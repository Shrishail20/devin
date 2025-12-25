'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Globe,
  Archive,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { templateApi } from '@/lib/api'
import { Template } from '@/types'

export default function AdminTemplatesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => {
      const response = await templateApi.getAll()
      return (response.data.templates || response.data || []) as Template[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      Swal.fire({ icon: 'success', title: 'Template deleted', timer: 1500, showConfirmButton: false })
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to delete' })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => templateApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      Swal.fire({ icon: 'success', title: 'Template duplicated', timer: 1500, showConfirmButton: false })
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to duplicate' })
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => templateApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      Swal.fire({ icon: 'success', title: 'Template published', timer: 1500, showConfirmButton: false })
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to publish' })
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => templateApi.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      Swal.fire({ icon: 'success', title: 'Template unpublished', timer: 1500, showConfirmButton: false })
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to unpublish' })
    },
  })

  const handleDelete = async (template: Template) => {
    const result = await Swal.fire({
      title: 'Delete Template?',
      text: `Are you sure you want to delete "${template.name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      deleteMutation.mutate(template._id)
    }
  }

  const handleDuplicate = (template: Template) => {
    duplicateMutation.mutate(template._id)
  }

  const handleTogglePublish = (template: Template) => {
    if (template.status === 'published') {
      unpublishMutation.mutate(template._id)
    } else {
      publishMutation.mutate(template._id)
    }
  }

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Published</span>
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><Edit className="w-3 h-3" /> Draft</span>
      case 'archived':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"><Archive className="w-3 h-3" /> Archived</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin: Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage event templates</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/templates/new')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Globe className="w-10 h-10 text-purple-300" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{template.description || 'No description'}</p>
                    </div>
                    {getStatusBadge(template.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{template.sections?.length || 0} sections</span>
                    <span>{template.colorSchemes?.length || 0} color schemes</span>
                    <span>{template.usageCount || 0} uses</span>
                    <span className="capitalize">{template.category}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/dashboard/admin/templates/${template._id}/edit`)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => handleTogglePublish(template)}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm ${
                      template.status === 'published'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {template.status === 'published' ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span className="sm:hidden">Unpublish</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="sm:hidden">Publish</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="sm:hidden">Duplicate</span>
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first template to get started</p>
          <button
            onClick={() => router.push('/dashboard/admin/templates/new')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </button>
        </div>
      )}
    </div>
  )
}
