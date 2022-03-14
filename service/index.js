import ApiService from './apiService';
import getEnvVars from '../environment';

const { apiUrl } = getEnvVars();

export const apiService = new ApiService({
  apiBase: apiUrl
});
