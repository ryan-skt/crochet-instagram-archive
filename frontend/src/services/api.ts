import type { Media } from './mock';
import { mockMedia, getStatus } from './mock';

export interface Source {
  id: number;
  type: string;
  username?: string;
  url?: string;
  status: string;
  created_at: string;
  last_run_at?: string;
  media_count: number;
  error_message?: string;
}

const API_BASE = 'http://localhost:8000/api';

// Source API
export const fetchSources = async (): Promise<Source[]> => {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error("Failed to fetch sources");
  return res.json();
};

export const createSource = async (type: string, username?: string, url?: string): Promise<Source> => {
  const res = await fetch(`${API_BASE}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, username, url })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to create source");
  }
  return res.json();
};

export const runSource = async (id: number): Promise<{status: string, message: string}> => {
  const res = await fetch(`${API_BASE}/sources/${id}/run`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error("Failed to run source");
  return res.json();
};

// Media mock APIs
export const fetchMedia = async (): Promise<Media[]> => {
  return new Promise(resolve => setTimeout(() => resolve(mockMedia), 100));
};

export const fetchMediaById = async (id: string | number): Promise<Media | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockMedia.find(m => m.id.toString() === id.toString()));
    }, 100);
  });
};

export const fetchStatus = async () => {
  return new Promise(resolve => setTimeout(() => resolve(getStatus()), 100));
};
