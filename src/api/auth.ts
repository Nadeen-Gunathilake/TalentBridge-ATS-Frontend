import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth';

export function login(body: LoginRequest) {
  return apiClient.post<LoginResponse>('/auth/login', body).then((r) => r.data);
}

export function registerCandidate(body: RegisterRequest) {
  return apiClient.post<RegisterResponse>('/auth/register', body).then((r) => r.data);
}
