import { ArticleDetail, ArticleSummary, UserProfile } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Request failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
};

export const fetchProfile = () => request<UserProfile>('/api/profile');

export const fetchArticles = () => request<ArticleSummary[]>('/api/articles');

export const fetchArticleDetail = (id: string) =>
  request<ArticleDetail>(`/api/articles/${id}`);