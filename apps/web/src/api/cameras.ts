import { apiClient } from './client';
import { Camera, CameraValidationResult, ONVIFDevice, StreamSessionResponse } from '../types';

export const camerasApi = {
  async getCameras(params?: {
    department_id?: string;
    status?: string;
    analytics_profile?: string;
    search?: string;
  }): Promise<Camera[]> {
    const res = await apiClient.get('/cameras', { params });
    return res.data;
  },

  async getCameraById(id: string): Promise<Camera> {
    const res = await apiClient.get(`/cameras/${id}`);
    return res.data;
  },

  async createCamera(camera: Partial<Camera> & { endpoint?: string; username?: string; password?: string }): Promise<Camera> {
    const res = await apiClient.post('/cameras', camera);
    return res.data;
  },

  async updateCamera(id: string, camera: Partial<Camera>): Promise<Camera> {
    const res = await apiClient.patch(`/cameras/${id}`, camera);
    return res.data;
  },

  async deleteCamera(id: string): Promise<void> {
    await apiClient.delete(`/cameras/${id}`);
  },

  async validateCameraSource(id: string): Promise<CameraValidationResult> {
    const res = await apiClient.post(`/cameras/${id}/validate`);
    return res.data;
  },

  async testDirectEndpoint(data: { endpoint: string; username?: string; password?: string; protocol: string }): Promise<CameraValidationResult> {
    const res = await apiClient.post('/cameras/probe-test', data);
    return res.data;
  },

  async startIngestion(id: string): Promise<{ status: string; message: string }> {
    const res = await apiClient.post(`/cameras/${id}/start`);
    return res.data;
  },

  async stopIngestion(id: string): Promise<{ status: string; message: string }> {
    const res = await apiClient.post(`/cameras/${id}/stop`);
    return res.data;
  },

  async getStreamSession(id: string): Promise<StreamSessionResponse> {
    const res = await apiClient.get(`/cameras/${id}/stream`);
    return res.data;
  },

  async importCsv(csvFile: File): Promise<{ total: number; imported: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', csvFile);
    const res = await apiClient.post('/cameras/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async discoverONVIF(networkInterface?: string): Promise<ONVIFDevice[]> {
    const res = await apiClient.post('/cameras/discover/onvif', { network_interface: networkInterface });
    return res.data;
  },
};
