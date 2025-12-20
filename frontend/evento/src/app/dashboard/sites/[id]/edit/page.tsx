'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { 
  ArrowLeft,
  Save,
  Eye,
  Globe,
  Settings,
  Palette,
  Type,
  GripVertical,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Check,
  Users,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { micrositeApi } from '@/lib/api'
import { MicrositeWithDetails, TemplateVersion, TemplateSection, MicrositeSection } from '@/types'

type TabType = 'content' | 'design' | 'settings'

export default function SiteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const siteId = params.id as string
  
  const [activeTab, setActiveTab] = useState<TabType>('content')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const { data: site, isLoading } = useQuery({
    queryKey: ['microsite', siteId],
    queryFn: async () => {
      const response = await micrositeApi.getOne(siteId)
      return response.data as MicrositeWithDetails
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<MicrositeWithDetails>) => micrositeApi.update(siteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microsite', siteId] })
      setHasChanges(false)
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        timer: 1500,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to save',
      })
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => micrositeApi.publish(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microsite', siteId] })
      Swal.fire({
        icon: 'success',
        title: 'Published!',
        text: 'Your site is now live',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Publish',
        text: error.response?.data?.error || 'Please fill in all required fields',
        html: error.response?.data?.missingFields 
          ? `<p>Missing fields:</p><ul class="text-left mt-2">${error.response.data.missingFields.map((f: string) => `<li>- ${f}</li>`).join('')}</ul>`
          : undefined,
      })
    },
  })

  const version = site?.version as TemplateVersion | undefined

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Site not found</h2>
          <Link href="/dashboard/sites" className="text-purple-600 hover:underline">
            Back to sites
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/sites"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                {site.title}
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                site.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {site.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {site.status === 'published' && (
              <Link
                href={`/e/${site.slug}`}
                target="_blank"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="btn-primary text-sm px-4 py-2"
            >
              {publishMutation.isPending ? 'Publishing...' : site.status === 'published' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex border-b border-gray-200 bg-white px-4 overflow-x-auto">
        {[
          { id: 'content', icon: Type, label: 'Content' },
          { id: 'design', icon: Palette, label: 'Design' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {activeTab === 'content' && (
          <ContentTab 
            site={site} 
            template={template}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            onUpdate={(data) => {
              updateMutation.mutate(data)
            }}
          />
        )}
        {activeTab === 'design' && (
          <DesignTab 
            site={site} 
            template={template}
            onUpdate={(data) => {
              updateMutation.mutate(data)
            }}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab 
            site={site}
            onUpdate={(data) => {
              updateMutation.mutate(data)
            }}
          />
        )}
      </div>
    </div>
  )
}

function ContentTab({ 
  site, 
  template,
  expandedSections,
  toggleSection,
  onUpdate
}: { 
  site: Site
  template?: Template
  expandedSections: string[]
  toggleSection: (id: string) => void
  onUpdate: (data: Partial<Site>) => void
}) {
  const sections = template?.sections || []

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Site Title</h3>
        <input
          type="text"
          defaultValue={site.title}
          onBlur={(e) => {
            if (e.target.value !== site.title) {
              onUpdate({ title: e.target.value })
            }
          }}
          className="input-field"
          placeholder="Enter site title"
        />
      </div>

      <h3 className="font-semibold text-gray-900 mt-6 mb-2">Sections</h3>
      
      {sections.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No sections defined in this template</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.sort((a, b) => a.order - b.order).map((section) => {
            const siteSection = site.sections?.find(s => s.sectionId === section.id)
            const isExpanded = expandedSections.includes(section.id)
            const isVisible = siteSection?.visible !== false

            return (
              <div key={section.id} className="card p-0 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{section.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isVisible && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Show this section</span>
                      <button
                        onClick={() => {
                          const updatedSections = site.sections?.map(s => 
                            s.sectionId === section.id 
                              ? { ...s, visible: !s.visible }
                              : s
                          ) || []
                          onUpdate({ sections: updatedSections })
                        }}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          isVisible ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          isVisible ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {section.fields?.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <FieldInput
                          field={field}
                          value={siteSection?.content?.[field.id]}
                          onChange={(value) => {
                            const updatedSections = site.sections?.map(s => 
                              s.sectionId === section.id 
                                ? { ...s, content: { ...s.content, [field.id]: value } }
                                : s
                            ) || []
                            onUpdate({ sections: updatedSections })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FieldInput({ 
  field, 
  value, 
  onChange 
}: { 
  field: any
  value: any
  onChange: (value: any) => void
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          defaultValue={value || ''}
          onBlur={(e) => onChange(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder={field.placeholder}
        />
      )
    case 'date':
      return (
        <input
          type="date"
          defaultValue={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
    case 'time':
      return (
        <input
          type="time"
          defaultValue={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
    case 'datetime':
      return (
        <input
          type="datetime-local"
          defaultValue={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          defaultValue={value || ''}
          onBlur={(e) => onChange(e.target.value)}
          className="input-field"
          placeholder={field.placeholder}
        />
      )
    case 'boolean':
      return (
        <button
          onClick={() => onChange(!value)}
          className={`w-12 h-6 rounded-full transition-colors ${
            value ? 'bg-purple-600' : 'bg-gray-300'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      )
    case 'select':
      return (
        <select
          defaultValue={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        >
          <option value="">Select...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    default:
      return (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          defaultValue={value || ''}
          onBlur={(e) => onChange(e.target.value)}
          className="input-field"
          placeholder={field.placeholder}
        />
      )
  }
}

function DesignTab({ 
  site, 
  template,
  onUpdate
}: { 
  site: Site
  template?: Template
  onUpdate: (data: Partial<Site>) => void
}) {
  const colorSchemes = template?.colorSchemes || []
  const fontPairs = template?.fontPairs || []

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Color Scheme</h3>
        {colorSchemes.length === 0 ? (
          <p className="text-gray-500">No color schemes available</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => onUpdate({ selectedColorScheme: scheme.id })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  site.selectedColorScheme === scheme.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: scheme.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: scheme.accent }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">{scheme.name}</p>
                {site.selectedColorScheme === scheme.id && (
                  <Check className="w-4 h-4 text-purple-600 mt-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Font Style</h3>
        {fontPairs.length === 0 ? (
          <p className="text-gray-500">No font styles available</p>
        ) : (
          <div className="space-y-3">
            {fontPairs.map((pair) => (
              <button
                key={pair.id}
                onClick={() => onUpdate({ selectedFontPair: pair.id })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  site.selectedFontPair === pair.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontFamily: pair.heading }}>
                      {pair.name}
                    </p>
                    <p className="text-sm text-gray-500" style={{ fontFamily: pair.body }}>
                      {pair.heading} + {pair.body}
                    </p>
                  </div>
                  {site.selectedFontPair === pair.id && (
                    <Check className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsTab({ 
  site,
  onUpdate
}: { 
  site: Site
  onUpdate: (data: Partial<Site>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">RSVP Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable RSVP</p>
              <p className="text-sm text-gray-500">Allow guests to respond to your event</p>
            </div>
            <button
              onClick={() => onUpdate({ 
                settings: { ...site.settings, enableRsvp: !site.settings?.enableRsvp } 
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                site.settings?.enableRsvp ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                site.settings?.enableRsvp ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {site.settings?.enableRsvp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RSVP Deadline
              </label>
              <input
                type="date"
                defaultValue={site.settings?.rsvpDeadline?.split('T')[0] || ''}
                onChange={(e) => onUpdate({ 
                  settings: { ...site.settings, rsvpDeadline: e.target.value } 
                })}
                className="input-field"
              />
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Wishes/Guestbook</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Wishes</p>
              <p className="text-sm text-gray-500">Allow guests to leave messages</p>
            </div>
            <button
              onClick={() => onUpdate({ 
                settings: { ...site.settings, enableWishes: !site.settings?.enableWishes } 
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                site.settings?.enableWishes ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                site.settings?.enableWishes ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {site.settings?.enableWishes && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Require Approval</p>
                <p className="text-sm text-gray-500">Review wishes before showing</p>
              </div>
              <button
                onClick={() => onUpdate({ 
                  settings: { ...site.settings, requireWishApproval: !site.settings?.requireWishApproval } 
                })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  site.settings?.requireWishApproval ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  site.settings?.requireWishApproval ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date
            </label>
            <input
              type="datetime-local"
              defaultValue={site.settings?.eventDate?.slice(0, 16) || ''}
              onChange={(e) => onUpdate({ 
                settings: { ...site.settings, eventDate: e.target.value } 
              })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event End Date (optional)
            </label>
            <input
              type="datetime-local"
              defaultValue={site.settings?.eventEndDate?.slice(0, 16) || ''}
              onChange={(e) => onUpdate({ 
                settings: { ...site.settings, eventEndDate: e.target.value } 
              })}
              className="input-field"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
