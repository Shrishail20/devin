import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
}

export const templateApi = {
  getPublished: () => api.get('/templates/published'),
  getAll: () => api.get('/templates'),
  getOne: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  duplicate: (id: string) => api.post(`/templates/${id}/duplicate`),
  publish: (id: string) => api.post(`/templates/${id}/publish`),
  unpublish: (id: string) => api.post(`/templates/${id}/unpublish`),
  preview: (id: string, previewDataId?: string) =>
    api.post(`/templates/${id}/preview`, { previewDataId }),
  addSection: (id: string, section: any) =>
    api.post(`/templates/${id}/sections`, section),
  updateSection: (id: string, sectionId: string, data: any) =>
    api.put(`/templates/${id}/sections/${sectionId}`, data),
  deleteSection: (id: string, sectionId: string) =>
    api.delete(`/templates/${id}/sections/${sectionId}`),
  reorderSections: (id: string, sectionOrder: string[]) =>
    api.post(`/templates/${id}/sections/reorder`, { sectionOrder }),
}

export const siteApi = {
  getAll: () => api.get('/sites'),
  getOne: (id: string) => api.get(`/sites/${id}`),
  getBySlug: (slug: string) => api.get(`/sites/public/${slug}`),
  create: (templateId: string, title: string) =>
    api.post('/sites', { templateId, title }),
  update: (id: string, data: any) => api.put(`/sites/${id}`, data),
  updateSlug: (id: string, slug: string) =>
    api.put(`/sites/${id}/slug`, { slug }),
  updateSection: (id: string, sectionId: string, content: any, visible?: boolean) =>
    api.put(`/sites/${id}/sections/${sectionId}`, { content, visible }),
  reorderSections: (id: string, sectionOrder: string[]) =>
    api.post(`/sites/${id}/sections/reorder`, { sectionOrder }),
  publish: (id: string) => api.post(`/sites/${id}/publish`),
  unpublish: (id: string) => api.post(`/sites/${id}/unpublish`),
  delete: (id: string) => api.delete(`/sites/${id}`),
  getStats: (id: string) => api.get(`/sites/${id}/stats`),
}

export const guestApi = {
  getAll: (siteId: string) => api.get(`/guests/${siteId}`),
  getStats: (siteId: string) => api.get(`/guests/${siteId}/stats`),
  updateStatus: (siteId: string, guestId: string, status: string) =>
    api.put(`/guests/${siteId}/${guestId}/status`, { status }),
  delete: (siteId: string, guestId: string) =>
    api.delete(`/guests/${siteId}/${guestId}`),
  export: (siteId: string) => api.get(`/guests/${siteId}/export`),
  submitRsvp: (siteId: string, data: any) =>
    api.post(`/guests/${siteId}/rsvp`, data),
  lookupRsvp: (siteId: string, email: string) =>
    api.post(`/guests/${siteId}/rsvp/lookup`, { email }),
  updateRsvp: (siteId: string, data: any) =>
    api.put(`/guests/${siteId}/rsvp`, data),
}

export const wishApi = {
  getAll: (siteId: string) => api.get(`/wishes/${siteId}`),
  getApproved: (siteId: string) => api.get(`/wishes/${siteId}/approved`),
  getStats: (siteId: string) => api.get(`/wishes/${siteId}/stats`),
  approve: (siteId: string, wishId: string) =>
    api.post(`/wishes/${siteId}/${wishId}/approve`),
  reject: (siteId: string, wishId: string) =>
    api.post(`/wishes/${siteId}/${wishId}/reject`),
  toggleHighlight: (siteId: string, wishId: string) =>
    api.post(`/wishes/${siteId}/${wishId}/highlight`),
  delete: (siteId: string, wishId: string) =>
    api.delete(`/wishes/${siteId}/${wishId}`),
  bulkApprove: (siteId: string, wishIds: string[]) =>
    api.post(`/wishes/${siteId}/bulk/approve`, { wishIds }),
  bulkReject: (siteId: string, wishIds: string[]) =>
    api.post(`/wishes/${siteId}/bulk/reject`, { wishIds }),
  bulkDelete: (siteId: string, wishIds: string[]) =>
    api.post(`/wishes/${siteId}/bulk/delete`, { wishIds }),
  submit: (siteId: string, authorName: string, message: string) =>
    api.post(`/wishes/${siteId}`, { authorName, message }),
}

export const mediaApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAll: () => api.get('/media'),
  delete: (id: string) => api.delete(`/media/${id}`),
}

export default api
