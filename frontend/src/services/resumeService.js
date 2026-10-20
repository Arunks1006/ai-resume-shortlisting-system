import api from './api';

export const resumeService = {
  evaluateResume: async (formData) => {
    const response = await api.post('/resume/evaluate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCandidates: async () => {
    const response = await api.get('/candidates/');
    return response.data;
  },

  getCandidate: async (candidateId) => {
    const response = await api.get(`/candidates/${candidateId}`);
    return response.data;
  },

  updateHRDecision: async (candidateId, hrDecision) => {
    const response = await api.post(`/candidates/${candidateId}/decision`, {
      hrDecision,
    });
    return response.data;
  },

  getCandidateStats: async () => {
    const response = await api.get('/candidates/stats/summary');
    return response.data;
  },

  evaluateBulkResumes: async (formData) => {
    const response = await api.post('/resume/evaluate-bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
