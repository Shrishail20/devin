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
  Sparkles,
  X,
  Check
} from 'lucide-react'
import { templateApi, micrositeApi } from '@/lib/api'
import { Template } from '@/types'

const categories = ['All', 'Wedding', 'Birthday', 'Corporate', 'Party', 'Other']

// Interface for sample profile
interface SampleProfile {
  id: string
  name: string
  description?: string
}

// Interface for template version with profiles
interface TemplateVersion {
  sampleProfiles?: SampleProfile[]
  colorSchemes?: Array<{ id: string; name: string }>
}

export default function TemplatesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [siteTitle, setSiteTitle] = useState('')
  const [templateVersion, setTemplateVersion] = useState<TemplateVersion | null>(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', 'published'],
    queryFn: async () => {
      const response = await templateApi.getPublished()
      return (response.data.templates || response.data || []) as Template[]
    },
  })

  const createSiteMutation = useMutation({
    mutationFn: async ({ templateId, title, profileId }: { templateId: string; title: string; profileId?: string }) => {
      const response = await micrositeApi.create(templateId, title, profileId)
      return response.data.microsite || response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['microsites'] })
      setShowCreateModal(false)
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
    setSelectedTemplate(template)
    setSiteTitle(`My ${template.name}`)
    setSelectedProfile('')
    
    // Fetch template details to get sample profiles
    try {
      const response = await templateApi.getOne(template._id)
      const data = response.data
      setTemplateVersion(data.version || null)
      
      // Set default profile if available
      if (data.version?.sampleProfiles?.length > 0) {
        setSelectedProfile(data.version.sampleProfiles[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch template details:', error)
      setTemplateVersion(null)
    }
    
    setShowCreateModal(true)
  }

  const handleCreateSite = () => {
    if (!selectedTemplate || !siteTitle.trim()) return
    createSiteMutation.mutate({
      templateId: selectedTemplate._id,
      title: siteTitle.trim(),
      profileId: selectedProfile || undefined
    })
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

      {/* Create Site Modal with Profile Selection */}
      {showCreateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Your Site</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Site Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="e.g., John & Jane Wedding"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Profile Selection */}
              {templateVersion?.sampleProfiles && templateVersion.sampleProfiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a Style
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select a pre-filled style to start with. You can customize everything later.
                  </p>
                  <div className="space-y-2">
                    {templateVersion.sampleProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => setSelectedProfile(profile.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedProfile === profile.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{profile.name}</h4>
                            {profile.description && (
                              <p className="text-sm text-gray-500 mt-1">{profile.description}</p>
                            )}
                          </div>
                          {selectedProfile === profile.id && (
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSite}
                  disabled={!siteTitle.trim() || createSiteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createSiteMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Site
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
