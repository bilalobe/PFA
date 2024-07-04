import { fetchResources, uploadResource } from './resourceSlice';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('resourceSlice', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      resource: {
        loading: false,
        error: null,
        resources: [],
      },
    });
  });

  describe('fetchResources', () => {
    it('should fetch resources successfully', async () => {
      const mockResources = [
        { id: '1', title: 'Resource 1', description: 'Desc 1', file: 'File1' },
        { id: '2', title: 'Resource 2', description: 'Desc 2', file: 'File2' },
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockResources });

      await store.dispatch(fetchResources({ moduleId: 'module1', searchQuery: 'query' }));

      const actions = store.getActions();
      expect(actions[0].type).toEqual('resource/fetchResources/pending');
      expect(actions[1].type).toEqual('resource/fetchResources/fulfilled');
      expect(actions[1].payload).toEqual(mockResources);
    });

    it('should handle error when fetching resources', async () => {
      const errorMessage = 'Error fetching resources';

      mockAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await store.dispatch(fetchResources({ moduleId: 'module1', searchQuery: 'query' }));

      const actions = store.getActions();
      expect(actions[0].type).toEqual('resource/fetchResources/pending');
      expect(actions[1].type).toEqual('resource/fetchResources/rejected');
      expect(actions[1].error.message).toEqual(errorMessage);
    });
  });

  describe('uploadResource', () => {
    it('should upload resource successfully', async () => {
      const mockResource = { id: '1', title: 'Resource 1', description: 'Desc 1', file: 'File1' };

      mockAxios.post.mockResolvedValueOnce({ data: mockResource });

      const formData = new FormData();
      formData.append('file', new Blob(['file content']), 'test.txt');

      await store.dispatch(uploadResource({ formData, onUploadProgress: jest.fn() }));

      const actions = store.getActions();
      expect(actions[0].type).toEqual('resource/uploadResource/pending');
      expect(actions[1].type).toEqual('resource/uploadResource/fulfilled');
      expect(actions[1].payload).toEqual(mockResource);
    });

    it('should handle error when uploading resource', async () => {
      const errorMessage = 'Error uploading resource';

      mockAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      const formData = new FormData();
      formData.append('file', new Blob(['file content']), 'test.txt');

      await store.dispatch(uploadResource({ formData, onUploadProgress: jest.fn() }));

      const actions = store.getActions();
      expect(actions[0].type).toEqual('resource/uploadResource/pending');
      expect(actions[1].type).toEqual('resource/uploadResource/rejected');
      expect(actions[1].error.message).toEqual(errorMessage);
    });
  });
});