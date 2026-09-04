import { apiClient } from './client';
import { AuthSession, Department, User } from '../types';

export const authApi = {
  async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  async setupInitialAdmin(adminData: {
    username: string;
    password: string;
    email?: string;
    department_id: string;
  }): Promise<AuthSession> {
    const res = await apiClient.post('/auth/setup-admin', adminData);
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async getDepartments(): Promise<Department[]> {
    const res = await apiClient.get('/departments');
    return res.data;
  },
};
