import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/';

const moduleApi = {
  fetchModules: async (courseId) => {
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/modules/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default moduleApi;
