import { create } from 'zustand';
import { Media } from '../types';
import { mediaAPI } from '../services/api';

interface MediaStore {
  media: Media[];
  selectedMedia: Media | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  fetchMedia: (params?: Record<string, unknown>) => Promise<void>;
  uploadMedia: (file: File, tags?: string[]) => Promise<Media>;
  deleteMedia: (id: string) => Promise<void>;
  selectMedia: (media: Media | null) => void;
  clearError: () => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: [],
  selectedMedia: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  fetchMedia: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.getAll(params);
      set({
        media: response.data.media,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({
        error: err.response?.data?.error || 'Failed to fetch media',
        isLoading: false,
      });
    }
  },

  uploadMedia: async (file, tags) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.upload(file, tags);
      const newMedia = response.data;
      set((state) => ({
        media: [newMedia, ...state.media],
        isLoading: false,
      }));
      return newMedia;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({
        error: err.response?.data?.error || 'Failed to upload media',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteMedia: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await mediaAPI.delete(id);
      set((state) => ({
        media: state.media.filter((m) => m._id !== id),
        selectedMedia: state.selectedMedia?._id === id ? null : state.selectedMedia,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({
        error: err.response?.data?.error || 'Failed to delete media',
        isLoading: false,
      });
      throw error;
    }
  },

  selectMedia: (media) => {
    set({ selectedMedia: media });
  },

  clearError: () => set({ error: null }),
}));
