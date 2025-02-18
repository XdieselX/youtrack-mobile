import fetchMock from 'fetch-mock';

import * as feature from 'components/feature/feature';
import Api from './api';

import IssuesAPI from 'components/api/api__issues';
import type Auth from 'components/auth/oauth2';
import {AppConfig} from 'types/AppConfig';
import {AuthParams, RequestHeaders} from 'types/Auth';
import {IssueComment} from 'types/CustomFields';


describe('API', () => {
  const serverUrl = 'http://foo.bar';
  const authParamsMock: AuthParams = {
    token_type: 'token type',
    access_token: 'fake token',
  } as AuthParams;
  let authMock: Auth;

  const createApiInstance = (auth: Auth = authMock) => new Api(auth);

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    authMock = {
      refreshToken: jest.fn().mockResolvedValue({}),
      authParams: authParamsMock as AuthParams,
      getAuthorizationHeaders: () => ({
        Authorization: 'token type fake token',
      }) as RequestHeaders,
      config: {
        backendUrl: serverUrl,
      } as AppConfig,
    } as unknown as Auth;
  });

  afterEach(() => fetchMock.restore());

  it('should create instance', () => {
    expect(createApiInstance()).toBeDefined();
  });

  it('should store config', () => {
    expect(createApiInstance().config).toEqual(authMock.config);
  });

  it('should construct issue URL', () => {
    expect(createApiInstance().youTrackIssueUrl).toEqual(`${serverUrl}/api/issues`);
  });

  it('should make request', async () => {
    const bodyMock = {foo: 'bar'};

    fetchMock.get(`${serverUrl}?$top=-1`, bodyMock);
    const res = await createApiInstance().makeAuthorizedRequest(serverUrl);

    expect(res.foo).toEqual(bodyMock.foo);
  });

  it('should refresh token and make request again if outdated', async () => {
    const requestResponseMock = {foo: 'bar'};
    const callSpy = jest.fn();
    let isFirst = true;
    fetchMock.mock(`${serverUrl}?$top=-1`, (...args: any[]) => {
      callSpy(...args);

      if (isFirst) {
        isFirst = false;
        return 401;
      }

      return requestResponseMock;
    });
    const res = await createApiInstance().makeAuthorizedRequest(serverUrl);

    expect(authMock.refreshToken).toHaveBeenCalled();
    expect(callSpy).toHaveBeenCalledTimes(2);
    expect(res.foo).toEqual(requestResponseMock.foo);

  });


  describe('Issue', () => {
    const issueIdMock: Readonly<string> = 'issue-id';
    const testIdMock: Readonly<string> = 'test-id';

    it('should load issue', async () => {
      fetchMock.mock(`^${serverUrl}/api/issues/test-id`, {
        id: issueIdMock,
        comments: [{
          author: {
            avatarUrl: 'http://foo.bar',
          },
        }],
      });
      const res = await createApiInstance().issue.getIssue(testIdMock);

      expect(res.id).toEqual(issueIdMock);
    });

    it('should convert issue attachments', async () => {
      fetchMock.mock(`^${serverUrl}/api/issues/test-id`, {
        id: issueIdMock,
        comments: [],
        attachments: [
          {
            id: 'foo',
            url: '/persistent/123',
          },
        ],
      });
      const res = await createApiInstance().issue.getIssue(testIdMock);

      expect(res.attachments[0].url).toEqual(`${serverUrl}/persistent/123`);
    });

    it('should handle relative avatar url in comments on loading comments', async () => {
      const relativeUrl = '/hub/users/123';
      fetchMock.mock(`^${serverUrl}/api/issues/test-id/comments`, [
        {
          id: 'foo',
          author: {
            avatarUrl: relativeUrl,
          },
        },
      ]);
      const comments = await createApiInstance().issue.getIssueComments(
        testIdMock,
      );

      expect(comments[0].author.avatarUrl).toEqual(`${serverUrl}${relativeUrl}`);
    });

    it('should handle relative avatar url in custom field possible values', async () => {
      const relativeUrl = '/hub/users/123';
      fetchMock.mock(`^${serverUrl}/api/admin/customFieldSettings/bundles`, [
        {
          avatarUrl: relativeUrl,
        },
      ]);
      const res = await createApiInstance().getCustomFieldUserValues(testIdMock);

      expect(res[0].avatarUrl).toEqual(`${serverUrl}${relativeUrl}`);
    });

    it('should post comment', async () => {
      fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments`, {
        id: 'test-comment',
        author: {
          avatarUrl: 'http://foo.bar',
        },
      });
      const res = await createApiInstance().issue.submitComment('test-issue-id', {
        text: 'test comment text',
      } as IssueComment);

      expect(res.id).toEqual('test-comment');
    });

    it('should update existing comment if ID is provided', async () => {
      fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments/123`, {
        id: 'test-comment',
        author: {
          avatarUrl: 'http://foo.bar',
        },
      });
      const res = await createApiInstance().issue.submitComment('test-issue-id', {
        text: 'test comment text',
        id: '123',
      } as IssueComment);

      expect(res.id).toEqual('test-comment');
    });

    it('should fix relative URL of author avatar after positng comment', async () => {
      const relativeUrl = '/hub/users/123';
      fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments`, {
        id: 'test-comment',
        author: {
          avatarUrl: relativeUrl,
        },
      });
      const res = await createApiInstance().issue.submitComment('test-issue-id', {
        text: 'test comment text',
      } as IssueComment);

      expect(res.author.avatarUrl).toEqual(`${serverUrl}${relativeUrl}`);
    });
  });


  describe('Get issues count', () => {
    let issuesApi: IssuesAPI;
    let response;

    beforeEach(() => {
      issuesApi = createApiInstance().issues;
      jest.spyOn(feature, 'checkVersion');
    });

    it('should get issues count using legacy REST endpoint', async () => {
      const responseMock = {
        value: 1,
      };
      (feature.checkVersion as jest.Mock).mockReturnValueOnce(false);
      fetchMock.get(
        `^${serverUrl}/rest/issue/count?sync=false&filter=`,
        responseMock,
      );
      response = await issuesApi.getIssuesCount(null, null);

      expect(response).toEqual(responseMock.value);
    });

    it('should get issues count using actual REST endpoint', async () => {
      (feature.checkVersion as jest.Mock).mockReturnValueOnce(true);
      const responseMock = {
        count: 1,
      };
      fetchMock.post(
        `^${serverUrl}/api/issuesGetter/count?fields=count`,
        responseMock,
      );
      response = await issuesApi.getIssuesCount(null, null);
      expect(response).toEqual(responseMock.count);
    });
  });


  describe('Support legacy API entry points', () => {
    let api;
    it('should be TRUE if the server version === 2022.3', () => {
      authMock.config.version = '2022.3';
      api = createApiInstance();
      expect(api.isActualAPI).toEqual(true);
      expect(api.user.apiUrl).toEqual(`${serverUrl}/api/users`);
      expect(api.issue.draftsURL).toEqual(`${serverUrl}/api/users/me/drafts`);
      expect(api.projects.projectsURL).toEqual(
        `${serverUrl}/api/admin/projects`,
      );
      expect(api.articles.currentUserAPIUrl).toEqual(`${serverUrl}/api/users/me`);
    });

    it('should be TRUE if the server version >= than 2022', () => {
      authMock.config.version = '2023.1';
      api = createApiInstance();
      expect(api.isActualAPI).toEqual(true);
      expect(api.user.apiUrl).toEqual(`${serverUrl}/api/users`);
      expect(api.issue.draftsURL).toEqual(`${serverUrl}/api/users/me/drafts`);
      expect(api.projects.projectsURL).toEqual(`${serverUrl}/api/admin/projects`);
      expect(api.articles.currentUserAPIUrl).toEqual(`${serverUrl}/api/users/me`);
    });

    it('should be TRUE if the server version < than 2022.3', () => {
      authMock.config.version = '2022.2';
      api = createApiInstance();
      expect(api.isActualAPI).toEqual(false);
      expect(api.user.apiUrl).toEqual(`${serverUrl}/api/admin/users`);
      expect(api.issue.draftsURL).toEqual(`${serverUrl}/api/admin/users/me/drafts`);
      expect(api.projects.projectsURL).toEqual(`${serverUrl}/api/admin/projects`);
      expect(api.articles.currentUserAPIUrl).toEqual(`${serverUrl}/api/admin/users/me`);
    });

    it('should be TRUE if the server version < than 2022', () => {
      authMock.config.version = '2021.3';
      api = createApiInstance();
      expect(api.isActualAPI).toEqual(false);
      expect(api.user.apiUrl).toEqual(`${serverUrl}/api/admin/users`);
      expect(api.issue.draftsURL).toEqual(`${serverUrl}/api/admin/users/me/drafts`);
      expect(api.projects.projectsURL).toEqual(`${serverUrl}/api/admin/projects`);
      expect(api.articles.currentUserAPIUrl).toEqual(`${serverUrl}/api/admin/users/me`);
    });
  });
});
