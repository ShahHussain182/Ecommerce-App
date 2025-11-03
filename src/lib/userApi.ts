import axios from 'axios';
import { z } from 'zod';

const API_BASE_URL = 'http://localhost:3001/api/v1'; 
const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

interface GenericSuccessResponse {
    success: boolean;
    message: string;
  }
export const NewsLetterPayloadSchema = z.object({
    email: z.string().email(),
  });
export const contactSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.string().min(5),
    message: z.string().min(10),
  });
export type NewsLetterPayload = z.infer<typeof NewsLetterPayloadSchema>;
export type ContactPayload = z.infer<typeof contactSchema>;


export const submitEmailForNewsletter = async (payload: NewsLetterPayload): Promise<GenericSuccessResponse> => {
    const response = await authApi.post('/subscribe-newsletter', payload);
    return response.data;
  };
export const submitContactMessage = async (payload: ContactPayload): Promise<GenericSuccessResponse> => {
  const response = await authApi.post('/contact-us', payload);
  return response.data; 
}