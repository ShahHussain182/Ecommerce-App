import axios from 'axios';
import { User } from '@/types';
import { z } from 'zod';
import { signupSchema, loginSchema1, codeSchema, forgotPasswordSchema, resetPasswordSchema, updateUserSchema } from '../../../Backend/backend/Schemas/authSchema'; // Adjust path as needed

const API_BASE_URL = 'http://localhost:3001/api/v1/auth';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Type definitions for API payloads and responses
type SignupPayload = z.infer<typeof signupSchema>;
type LoginPayload = z.infer<typeof loginSchema1>;
type VerifyEmailPayload = z.infer<typeof codeSchema>;
type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
type UpdateUserPayload = z.infer<typeof updateUserSchema>;

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  session?: any; // Adjust as per actual session structure
}

interface GenericSuccessResponse {
  success: boolean;
  message: string;
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await authApi.post('/signup', payload);
  return response.data;
};

export const verifyEmail = async (code: VerifyEmailPayload): Promise<AuthResponse> => {
  const response = await authApi.post('/verify-email', { code });
  return response.data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await authApi.post('/login', payload);
  return response.data;
};

export const logout = async (): Promise<GenericSuccessResponse> => {
  const response = await authApi.post('/logout');
  return response.data;
};

export const checkAuth = async (): Promise<AuthResponse> => {
  const response = await authApi.get('/check-auth');
  return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<GenericSuccessResponse> => {
  const response = await authApi.post('/forgot-password', payload);
  return response.data;
};

export const resetPassword = async (token: string, payload: ResetPasswordPayload): Promise<GenericSuccessResponse> => {
  const response = await authApi.post(`/reset-password/${token}`, payload);
  return response.data;
};

export const updateUserProfile = async (payload: UpdateUserPayload): Promise<AuthResponse> => {
  const response = await authApi.put('/profile', payload);
  return response.data;
};