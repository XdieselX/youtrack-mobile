import EncryptedStorage from 'react-native-encrypted-storage';

import Auth from './oauth2';
import sinon from 'sinon';

import * as storageHelper from '../storage/storage__oauth';
import {__setStorageState} from '../storage/storage';

jest.mock('react-native-app-auth');

let configMock;
let authParamsMock;
let authParamsMockKey;
let requests;
let clock;
let auth;
let AppAuth;

describe('Auth', function () {

  describe('General', () => {
    const getLastRequest = () => requests[requests.length - 1];
    const mockConfigLoading = auth => sinon.stub(auth, 'getCachedAuthParams').returns(Promise.resolve(authParamsMock));
    const mockConfigSaving = auth => sinon.stub(auth, 'cacheAuthParams').callsFake((authParams) => authParams);

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      requests = [];
      clock = sinon.useFakeTimers();
      configMock = createConfigMock();
      authParamsMock = createAuthParamsMock();
      authParamsMockKey = '0123';

      global.fetch = sinon.spy(function (url, options) {
        return new Promise(function (resolve, reject) {
          const request = {
            url: url,
            options: options,
            requestBody: options.body,
            resolve: resolve,
            reject: reject,
          };
          global.fetch.onRequest(request);
          requests.push(request);
        });
      });

      global.fetch.onRequest = () => {};

      __setStorageState({authParamsKey: authParamsMockKey});
    });

    beforeEach(() => {
      AppAuth = require('react-native-app-auth');
    });

    afterEach(function () {
      delete global.fetch;
      clock.restore();
    });

    it('should be imported', () => Auth.should.be.defined);

    it('should create OAuth instance', () => {
      auth = createAuthMock();
      auth.should.be.defined;
    });

    describe('working with auth instance', () => {
      beforeEach(() => {
        auth = createAuthMock();
        mockConfigLoading(auth);
        mockConfigSaving(auth);
      });

      it('should try to load current user to verify token', () => {
        auth.loadCurrentUser(authParamsMock);

        getLastRequest().url.should.contain('api/rest/users/me?fields=');
      });

      it('should provide authorization params when trying to verify token', () => {
        auth.loadCurrentUser(authParamsMock);

        getLastRequest().options.headers.Authorization.should
          .equal(`${authParamsMock.token_type} ${authParamsMock.access_token}`);
      });

      it('should complete verification successfully if hub responded', () => {
        const promise = auth.loadCurrentUser(authParamsMock);

        getLastRequest().resolve({
          status: 200,
          json: () => ({
            id: 'fake-user',
          }),
        });

        return promise.should.be.fulfilled;
      });

      it('should fail verification if hub responded with error', () => {
        const promise = auth.loadCurrentUser(authParamsMock);

        getLastRequest().resolve({status: 403});

        return promise.should.be.rejected;
      });

      it('should perform token refresh if it`s expired', () => {
        sinon.stub(auth, 'getRefreshToken').returns('token');
        sinon.stub(auth, 'refreshToken').returns(Promise.resolve({}));
        const promise = auth.loadCurrentUser(authParamsMock);

        getLastRequest().resolve({status: 401});

        return promise.should.be.fulfilled;
      });

      it('should refresh token', async () => {
        const responseMock = {
          accessToken: 'new access token',
        };
        AppAuth.refresh.mockResolvedValueOnce(responseMock);
        jest.spyOn(auth, 'loadCurrentUser').mockResolvedValueOnce({});

        const authParams = await auth.refreshToken();

        expect(AppAuth.refresh).toHaveBeenCalledWith({
          clientId: configMock.auth.clientId,
          clientSecret: configMock.auth.clientSecret,
          redirectUrl: configMock.auth.landingUrl,
          dangerouslyAllowInsecureHttpRequests: true,
          serviceConfiguration: {
            authorizationEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/auth`,
            tokenEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/token`,
          },
        }, {refreshToken: authParamsMock.refresh_token});
        expect(authParams).toEqual(responseMock);
      });

      it('should fail refresh if permission management service is unavailable', async () => {
        const error = new Error('Service unavailable');
        AppAuth.refresh.mockRejectedValueOnce(error);

        await expect(auth.refreshToken()).rejects.toThrow(error);
      });

      it('should authorize via login/password', () => {
        Auth.obtainTokenByCredentials('log', 'pass', configMock);

        const request = getLastRequest();

        request.url.should.equal(`${configMock.auth.serverUri}/api/rest/oauth2/token`);
        request.requestBody.should.equal('grant_type=password&access_type=offline&username=log&password=pass&scope=scope1%20scope2');
        request.options.headers.Authorization.should.equal('Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=');
        request.options.headers['Content-Type'].should.equal('application/x-www-form-urlencoded');
      });

      it('should encode params when authorizing via login/password', () => {
        Auth.obtainTokenByCredentials('lo$g', 'pa%ss', configMock);

        const request = getLastRequest();
        request.requestBody.should.equal('grant_type=password&access_type=offline&username=lo%24g&password=pa%25ss&scope=scope1%20scope2');
      });

      it('should authorize with OAuth2 code flow', async () => {
        const oauthCodeFlowParamsMock = {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          tokenType: 'tokenType',
        };
        AppAuth.authorize.mockResolvedValueOnce(oauthCodeFlowParamsMock);

        const authParams = await Auth.obtainTokenWithOAuthCode(configMock);

        expect(authParams).toEqual({
          access_token: oauthCodeFlowParamsMock.accessToken,
          accessTokenExpirationDate: undefined,
          refresh_token: oauthCodeFlowParamsMock.refreshToken,
          token_type: oauthCodeFlowParamsMock.tokenType,
        });
        expect(AppAuth.authorize).toHaveBeenCalledWith({
          additionalParameters: {
            access_type: 'offline',
            prompt: 'login',
          },
          clientId: configMock.auth.clientId,
          clientSecret: 'client-secret',
          redirectUrl: configMock.auth.landingUrl,
          scopes: configMock.auth.scopes.split(' '),
          serviceConfiguration: {
            authorizationEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/auth`,
            tokenEndpoint: `${configMock.auth.serverUri}/api/rest/oauth2/token`,
          },
          usePKCE: false,
          dangerouslyAllowInsecureHttpRequests: true,
        });
      });
    });

  });


  describe('Get/Save cached auth parameters', () => {
    afterEach(() => jest.clearAllMocks());

    beforeEach(() => {
      authParamsMock = createAuthParamsMock();
      auth = createAuthMock(createConfigMock());
    });

    describe('cacheAuthParams', () => {
      it('should cache encrypted auth params', async () => {
      jest.spyOn(storageHelper, 'storeSecurelyAuthParams');
        const cachedAuthParams = await auth.cacheAuthParams(authParamsMock, authParamsMockKey);

        await expect(storageHelper.storeSecurelyAuthParams).toHaveBeenCalledWith(
          authParamsMock,
          authParamsMockKey
          );
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });

      it('should cache encrypted auth params with particular key', async () => {
      jest.spyOn(storageHelper, 'storeSecurelyAuthParams');
        const keyMock = 'datestamp';
        const cachedAuthParams = await auth.cacheAuthParams(authParamsMock, keyMock);

        await expect(storageHelper.storeSecurelyAuthParams).toHaveBeenCalledWith(
          authParamsMock,
          keyMock
          );
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });


    describe('getCachedAuthParams', () => {
      beforeEach(() => {
        jest.spyOn(storageHelper, 'getStoredSecurelyAuthParams');
      });

      it('should throw if there is no cached auth parameters', async () => {
        await expect(auth.getCachedAuthParams()).rejects.toThrow('');
      });

      it('should get auth parameters', async () => {
        jest.spyOn(EncryptedStorage, 'getItem').mockResolvedValueOnce(JSON.stringify(authParamsMock));
        const cachedAuthParams = await auth.getCachedAuthParams();

        await expect(storageHelper.getStoredSecurelyAuthParams).toHaveBeenCalled();
        await expect(cachedAuthParams).toEqual(authParamsMock);
      });
    });
  });

});


function createConfigMock() {
  return {
    backendUrl: 'http://youtrack.example',
    auth: {
      serverUri: 'http://youtrack/pm.example',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      youtrackServiceId: 'yt-service-id',
      scopes: 'scope1 scope2',
      landingUrl: 'ytoauth://landing.url',
    },
  };
}

function createAuthParamsMock() {
  return {
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    token_type: 'bearer',
  };
}

function createAuthMock(config) {
  return new Auth(config || configMock);
}