import { create } from 'zustand';
import { Template, TemplateComponent, ComponentSchema } from '../types';
import { templatesAPI, componentsAPI } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

interface TemplateStore {
  templates: Template[];
  currentTemplate: Template | null;
  componentSchemas: ComponentSchema[];
  selectedComponentId: string | null;
  previewData: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  
  fetchTemplates: (params?: Record<string, unknown>) => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  createTemplate: (data: Partial<Template>) => Promise<Template>;
  updateTemplate: (id: string, data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<Template>;
  publishTemplate: (id: string) => Promise<void>;
  
  fetchComponentSchemas: () => Promise<void>;
  
  setCurrentTemplate: (template: Template | null) => void;
  addComponent: (schema: ComponentSchema) => void;
  updateComponent: (id: string, updates: Partial<TemplateComponent>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  reorderComponents: (fromIndex: number, toIndex: number) => void;
  
  setPreviewData: (data: Record<string, unknown>) => void;
  clearError: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  currentTemplate: null,
  componentSchemas: [],
  selectedComponentId: null,
  previewData: {},
  isLoading: false,
  error: null,

  fetchTemplates: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.getAll(params);
      set({ templates: response.data.templates, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to fetch templates', isLoading: false });
    }
  },

  fetchTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.getById(id);
      set({ currentTemplate: response.data, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to fetch template', isLoading: false });
    }
  },

  createTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.create(data);
      const newTemplate = response.data;
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        currentTemplate: newTemplate,
        isLoading: false,
      }));
      return newTemplate;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to create template', isLoading: false });
      throw error;
    }
  },

  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.update(id, data);
      const updatedTemplate = response.data;
      set((state) => ({
        templates: state.templates.map((t) => (t._id === id ? updatedTemplate : t)),
        currentTemplate: state.currentTemplate?._id === id ? updatedTemplate : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to update template', isLoading: false });
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await templatesAPI.delete(id);
      set((state) => ({
        templates: state.templates.filter((t) => t._id !== id),
        currentTemplate: state.currentTemplate?._id === id ? null : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to delete template', isLoading: false });
      throw error;
    }
  },

  duplicateTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.duplicate(id);
      const newTemplate = response.data;
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        isLoading: false,
      }));
      return newTemplate;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to duplicate template', isLoading: false });
      throw error;
    }
  },

  publishTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.publish(id);
      const updatedTemplate = response.data;
      set((state) => ({
        templates: state.templates.map((t) => (t._id === id ? updatedTemplate : t)),
        currentTemplate: state.currentTemplate?._id === id ? updatedTemplate : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      set({ error: err.response?.data?.error || 'Failed to publish template', isLoading: false });
      throw error;
    }
  },

  fetchComponentSchemas: async () => {
    try {
      const response = await componentsAPI.getAll();
      set({ componentSchemas: response.data.components });
    } catch (error: unknown) {
      console.error('Failed to fetch component schemas:', error);
    }
  },

  setCurrentTemplate: (template) => {
    set({ currentTemplate: template, selectedComponentId: null });
  },

  addComponent: (schema) => {
    const { currentTemplate } = get();
    if (!currentTemplate) return;

    const newComponent: TemplateComponent = {
      id: uuidv4(),
      type: schema.type,
      props: { ...schema.defaultProps },
      position: { ...schema.defaultPosition },
      styles: { ...schema.defaultStyles },
      variables: [],
      zIndex: currentTemplate.components.length,
    };

    set({
      currentTemplate: {
        ...currentTemplate,
        components: [...currentTemplate.components, newComponent],
      },
      selectedComponentId: newComponent.id,
    });
  },

  updateComponent: (id, updates) => {
    const { currentTemplate } = get();
    if (!currentTemplate) return;

    set({
      currentTemplate: {
        ...currentTemplate,
        components: currentTemplate.components.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    });
  },

  removeComponent: (id) => {
    const { currentTemplate, selectedComponentId } = get();
    if (!currentTemplate) return;

    set({
      currentTemplate: {
        ...currentTemplate,
        components: currentTemplate.components.filter((c) => c.id !== id),
      },
      selectedComponentId: selectedComponentId === id ? null : selectedComponentId,
    });
  },

  selectComponent: (id) => {
    set({ selectedComponentId: id });
  },

  reorderComponents: (fromIndex, toIndex) => {
    const { currentTemplate } = get();
    if (!currentTemplate) return;

    const components = [...currentTemplate.components];
    const [removed] = components.splice(fromIndex, 1);
    components.splice(toIndex, 0, removed);

    const reorderedComponents = components.map((c, index) => ({
      ...c,
      zIndex: index,
    }));

    set({
      currentTemplate: {
        ...currentTemplate,
        components: reorderedComponents,
      },
    });
  },

  setPreviewData: (data) => {
    set({ previewData: data });
  },

  clearError: () => set({ error: null }),
}));
