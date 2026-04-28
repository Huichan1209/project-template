/**
 * 공통 axios 인스턴스. 모든 feature의 api.ts에서 이 인스턴스를 사용한다.
 *
 * @author Huichan Jeong
 */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10_000,
});
