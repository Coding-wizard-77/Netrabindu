import { apiClient } from './client';
import { AuthSession, Department, User } from '../types';

export interface SetupPayload {
  username: string;
  password: string;
  email?: string;
  department_code?: string;
  department_id?: string;
}

export const authApi = {
  async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const res = await apiClient.post('/auth/login', credentials);
    const data = res.data;
    
    // Normalize backend UserOut to frontend User interface
    const user: User = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email || undefined,
      department_id: data.user.department_id || '',
      department_name: data.user.department_id ? `Dept: ${data.user.department_id}` : 'Gujarat Police HQ',
      role: (data.user.roles && data.user.roles[0]) || 'SUPER_ADMIN',
      created_at: new Date().toISOString(),
    };

    return {
      access_token: data.access_token,
      refresh_token: data.access_token,
      token_type: data.token_type || 'bearer',
      user,
    };
  },

  async setupInitialAdmin(adminData: SetupPayload): Promise<AuthSession> {
    const department_code = adminData.department_code || adminData.department_id || 'DEPT-HQ';
    
    await apiClient.post('/auth/setup', {
      username: adminData.username,
      password: adminData.password,
      email: adminData.email,
      department_code,
    });

    // Automatically authenticate the freshly provisioned admin
    return this.login({
      username: adminData.username,
      password: adminData.password,
    });
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get('/auth/me');
    const data = res.data;
    return {
      id: data.id,
      username: data.username,
      email: data.email || undefined,
      department_id: data.department_id || '',
      department_name: data.department_id ? `Dept: ${data.department_id}` : 'Gujarat Police HQ',
      role: (data.roles && data.roles[0]) || 'SUPER_ADMIN',
      created_at: new Date().toISOString(),
    };
  },

  async getDepartments(): Promise<Department[]> {
    const res = await apiClient.get('/departments');
    return res.data.map((d: any) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      jurisdiction: d.jurisdiction || undefined,
      status: d.status || 'ACTIVE',
      total_cameras: d.total_cameras || 0,
    }));
  },
};
