import axios from 'axios';

const apiUrl = 'http://localhost:8000/api/';

const getAuthToken = () => localStorage.getItem('token');

const quizApi = {
  fetchQuiz: async (quizId) => {
    try {
      const response = await axios.get(`${apiUrl}quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  submitQuiz: async (quizId, selectedAnswers) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${apiUrl}quizzes/${quizId}/attempts/`,
        { choices: selectedAnswers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  fetchQuizzesForModule: async (moduleId) => {
    try {
      const response = await axios.get(`${apiUrl}modules/${moduleId}/quizzes/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default quizApi;
