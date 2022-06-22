import * as actions from './inbox-threads-actions';
import * as storage from 'components/storage/storage';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {__setStorageState} from 'components/storage/storage';
import {inboxThreadsNamespace, inboxThreadsReducersNamesMap} from './inbox-threads-reducers';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';

describe('Inbox Threads', () => {
  let apiMock;
  let responseMock;
  let store;

  const getApi = () => apiMock;
  const middlewares = [thunk.withExtraArgument(getApi)];
  const storeMock = configureMockStore(middlewares);

  beforeEach(() => {
    jest.restoreAllMocks();
    responseMock = [{subject: {}}];
    apiMock = {
      inbox: {
        getThreads: jest.fn().mockResolvedValue(responseMock),
      },
    };

    store = storeMock({});
    storage.__setStorageState({});
  });


  describe('loadInboxThreads', () => {
    it('should load inbox threads for the first time', async () => {
      await store.dispatch(require('./inbox-threads-actions').loadInboxThreads());

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined, undefined);
      expect(store.getActions()).toEqual([
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setError}`,
          payload: {
            error: null,
          },
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.toggleProgress}`,
          payload: {
            inProgress: true,
          },
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.toggleProgress}`,
          payload: {
            inProgress: false,
          },
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
          payload: {
            folderId: folderIdAllKey,
            threads: responseMock,
            reset: true,
          },
        },
      ]);
    });

    it('should load more threads', async () => {
      await store.dispatch(actions.loadInboxThreads(undefined, 1));

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined, 1);
      expect(store.getActions()[3]).toEqual({
        type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
        payload: {
          folderId: folderIdAllKey,
          threads: responseMock,
          reset: false,
        },
      });
    });


    describe('Cache', () => {
      it('should update inbox threads `All` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}]);
        await store.dispatch(actions.loadInboxThreads(undefined, undefined));

        expect(storage.getStorageState().inboxThreadsCache[folderIdAllKey].length).toEqual(2);
      });

      it('should update inbox threads `Mentions & Reactions` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}, {}]);
        await store.dispatch(actions.loadInboxThreads(folderIdMap[1]));

        expect(storage.getStorageState().inboxThreadsCache[folderIdMap[1]].length).toEqual(3);
      });

      it('should update inbox threads `Subscriptions` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}, {}, {}]);
        await store.dispatch(actions.loadInboxThreads(folderIdMap[2]));

        expect(storage.getStorageState().inboxThreadsCache[folderIdMap[2]].length).toEqual(4);
      });

      it('should set threads from the cache before loading for the  first time', async () => {
        const threadsMock = [{}, {}];
        __setStorageState({
          inboxThreadsCache: {
            [folderIdMap[1]]: threadsMock,
          },
        });

        await store.dispatch(actions.loadInboxThreads(folderIdMap[1], null));

        expect(store.getActions()[0]).toEqual({
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
          payload: {
            folderId: folderIdMap[1],
            threads: threadsMock,
            reset: true,
          },
        });

      });

      it('should not set threads from the cache before loading for the  first time', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}, {}]);
        const threadsMock = [{}, {}];
        __setStorageState({
          inboxThreadsCache: {
            [folderIdMap[1]]: threadsMock,
          },
        });

        await store.dispatch(actions.loadInboxThreads(folderIdMap[1], 1));

        expect(store.getActions()[0].type).not.toEqual(`${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`);

      });
    });

  });
});
