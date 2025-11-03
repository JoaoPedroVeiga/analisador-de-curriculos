// frontend/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  analysisDate: string;
}