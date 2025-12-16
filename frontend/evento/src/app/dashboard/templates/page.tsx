'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { 
  Search, 
  Filter,
  Plus,
  Eye,
  Globe,
  Calendar,
  Heart,
  Sparkles
} from 'lucide-react'
import { templateApi, siteApi } from '@/lib/api'
import { Template } from '@/types'

const categories = ['All', 'Wedding', 'Birthday', 'Corporate', 'Party', 'Other']

export default function TemplatesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', 'published'],
    queryFn: async () => {
      const response = await templateApi.getPublished()
      return (response.data.templates || response.data || []) as Template[]
    },
  })

  const createSiteMutation = useMutation({
    mutationFn: async ({ templateId, title }: { templateId: string; title: string }) => {
      const response = await siteApi.create(templateId, title)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      router.push(`/dashboard/sites/${data._id}/edit`)
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to create site',
      })
    },
  })

  const handleUseTemplate = async (template: Template) => {
    const { value: title } = await Swal.fire({
      title: 'Create Your Site',
      input: 'text',
      inputLabel: 'Site Title',
      inputPlaceholder: 'e.g., John & Jane Wedding',
      inputValue: `My ${template.name}`,
      showCancelButton: true,
      confirmButtonText: 'Create',
      confirmButtonColor: '#9333ea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a title'
        }
        return null
      },
    })

      if (title) {
        createSiteMutation.mutate({ templateId: template._id, title })
      }
    }

    const handlePreview = (template: Template) => {
      router.push(`/dashboard/templates/${template._id}/preview`)
    }

    const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || template.category === category
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Wedding': return <Heart className="w-4 h-4" />
      case 'Birthday': return <Sparkles className="w-4 h-4" />
      case 'Corporate': return <Globe className="w-4 h-4" />
      case 'Party': return <Calendar className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-600 mt-1">Choose a template to create your event site</p>
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
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template._id}
                        template={template}
                        onUse={() => handleUseTemplate(template)}
                        onPreview={() => handlePreview(template)}
                        isCreating={createSiteMutation.isPending}
                      />
                    ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ 
  template, 
  onUse,
  onPreview,
  isCreating
}: { 
  template: Template
  onUse: () => void
  onPreview: () => void
  isCreating: boolean
}) {
  return (
    <div className="card group overflow-hidden">
      <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4 relative overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-purple-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button 
            onClick={onPreview}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            {template.category && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {template.category}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{template.sections?.length || 0} sections</span>
          <span>{template.usageCount || 0} uses</span>
        </div>

        <button
          onClick={onUse}
          disabled={isCreating}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Use Template
        </button>
      </div>
    </div>
  )
}
