'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  Eye,
  Settings,
  Layers
} from 'lucide-react'
import { templateApi } from '@/lib/api'
import { SectionDefinition, FieldDefinition, ColorScheme, FontPair } from '@/types'

const SECTION_TYPES = [
  { type: 'hero', name: 'Hero Section', description: 'Main banner with title and image' },
  { type: 'event_details', name: 'Event Details', description: 'Date, time, and event info' },
  { type: 'countdown', name: 'Countdown', description: 'Timer to event date' },
  { type: 'gallery', name: 'Gallery', description: 'Photo gallery grid' },
  { type: 'story', name: 'Our Story', description: 'Timeline or story section' },
  { type: 'venue', name: 'Venue', description: 'Location and map' },
  { type: 'rsvp', name: 'RSVP', description: 'Guest response form' },
  { type: 'wishes', name: 'Wishes', description: 'Guestbook messages' },
  { type: 'gift_registry', name: 'Gift Registry', description: 'Gift links and info' },
  { type: 'contact', name: 'Contact', description: 'Contact information' },
  { type: 'footer', name: 'Footer', description: 'Footer with links' },
  { type: 'custom', name: 'Custom Section', description: 'Custom content block' },
] as const

const FIELD_TYPES = [
  { type: 'text', name: 'Text', description: 'Single line text' },
  { type: 'textarea', name: 'Text Area', description: 'Multi-line text' },
  { type: 'date', name: 'Date', description: 'Date picker' },
  { type: 'time', name: 'Time', description: 'Time picker' },
  { type: 'datetime', name: 'Date & Time', description: 'Date and time picker' },
  { type: 'number', name: 'Number', description: 'Numeric input' },
  { type: 'image', name: 'Image', description: 'Single image upload' },
  { type: 'gallery', name: 'Gallery', description: 'Multiple images' },
  { type: 'location', name: 'Location', description: 'Address with map' },
  { type: 'select', name: 'Select', description: 'Dropdown options' },
  { type: 'boolean', name: 'Toggle', description: 'Yes/No toggle' },
  { type: 'url', name: 'URL', description: 'Web link' },
  { type: 'email', name: 'Email', description: 'Email address' },
  { type: 'phone', name: 'Phone', description: 'Phone number' },
] as const

const DEFAULT_COLOR_SCHEMES: ColorScheme[] = [
  { id: 'elegant-purple', name: 'Elegant Purple', primary: '#9333ea', secondary: '#c084fc', accent: '#f0abfc', background: '#faf5ff', text: '#1f2937' },
  { id: 'romantic-rose', name: 'Romantic Rose', primary: '#e11d48', secondary: '#fb7185', accent: '#fda4af', background: '#fff1f2', text: '#1f2937' },
  { id: 'ocean-blue', name: 'Ocean Blue', primary: '#0284c7', secondary: '#38bdf8', accent: '#7dd3fc', background: '#f0f9ff', text: '#1f2937' },
  { id: 'forest-green', name: 'Forest Green', primary: '#059669', secondary: '#34d399', accent: '#6ee7b7', background: '#ecfdf5', text: '#1f2937' },
  { id: 'golden-sunset', name: 'Golden Sunset', primary: '#d97706', secondary: '#fbbf24', accent: '#fcd34d', background: '#fffbeb', text: '#1f2937' },
]

const DEFAULT_FONT_PAIRS: FontPair[] = [
  { id: 'classic', name: 'Classic Elegance', heading: 'Playfair Display', body: 'Lato' },
  { id: 'modern', name: 'Modern Clean', heading: 'Montserrat', body: 'Open Sans' },
  { id: 'romantic', name: 'Romantic Script', heading: 'Great Vibes', body: 'Raleway' },
  { id: 'minimal', name: 'Minimal', heading: 'Poppins', body: 'Inter' },
  { id: 'bold', name: 'Bold Statement', heading: 'Oswald', body: 'Source Sans Pro' },
]

export default function NewTemplatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'basic' | 'sections' | 'design' | 'preview'>('basic')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    category: 'wedding' as const,
    thumbnail: '',
    sections: [] as SectionDefinition[],
    colorSchemes: DEFAULT_COLOR_SCHEMES,
    fontPairs: DEFAULT_FONT_PAIRS,
    previewDataSets: [] as { name: string; data: Record<string, Record<string, unknown>> }[],
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof template) => {
      const payload = {
        ...data,
        fontPairs: data.fontPairs.map(fp => ({
          ...fp,
          headingFont: fp.heading,
          bodyFont: fp.body
        }))
      }
      const response = await templateApi.create(payload)
      return response.data
    },
    onSuccess: (data) => {
      Swal.fire({ icon: 'success', title: 'Template created!', timer: 1500, showConfirmButton: false })
      router.push('/dashboard/admin/templates')
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to create template' })
    },
  })

  const handleSave = () => {
    if (!template.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Name required', text: 'Please enter a template name' })
      return
    }
    if (template.sections.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sections required', text: 'Please add at least one section' })
      return
    }
    createMutation.mutate(template)
  }

  const addSection = (type: string) => {
    const sectionType = SECTION_TYPES.find(s => s.type === type)
    const newSection: SectionDefinition = {
      id: `section-${Date.now()}`,
      type: type as SectionDefinition['type'],
      name: sectionType?.name || 'New Section',
      order: template.sections.length,
      isRequired: false,
      isLocked: false,
      defaultVisible: true,
      fields: getDefaultFieldsForSection(type),
    }
    setTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setExpandedSection(newSection.id)
  }

  const removeSection = (sectionId: string) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId).map((s, i) => ({ ...s, order: i })),
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<SectionDefinition>) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s),
    }))
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = template.sections.findIndex(s => s.id === sectionId)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === template.sections.length - 1)) return
    
    const newSections = [...template.sections]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]]
    newSections.forEach((s, i) => s.order = i)
    
    setTemplate(prev => ({ ...prev, sections: newSections }))
  }

  const addField = (sectionId: string) => {
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: '',
    }
    updateSection(sectionId, {
      fields: [...(template.sections.find(s => s.id === sectionId)?.fields || []), newField],
    })
  }

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    const section = template.sections.find(s => s.id === sectionId)
    if (!section) return
    updateSection(sectionId, {
      fields: section.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
    })
  }

  const removeField = (sectionId: string, fieldId: string) => {
    const section = template.sections.find(s => s.id === sectionId)
    if (!section) return
    updateSection(sectionId, {
      fields: section.fields.filter(f => f.id !== fieldId),
    })
  }

  const addColorScheme = () => {
    const newScheme: ColorScheme = {
      id: `scheme-${Date.now()}`,
      name: 'New Color Scheme',
      primary: '#9333ea',
      secondary: '#c084fc',
      accent: '#f0abfc',
      background: '#ffffff',
      text: '#1f2937',
    }
    setTemplate(prev => ({
      ...prev,
      colorSchemes: [...prev.colorSchemes, newScheme],
    }))
  }

  const updateColorScheme = (schemeId: string, updates: Partial<ColorScheme>) => {
    setTemplate(prev => ({
      ...prev,
      colorSchemes: prev.colorSchemes.map(s => s.id === schemeId ? { ...s, ...updates } : s),
    }))
  }

  const removeColorScheme = (schemeId: string) => {
    setTemplate(prev => ({
      ...prev,
      colorSchemes: prev.colorSchemes.filter(s => s.id !== schemeId),
    }))
  }

  const addPreviewData = () => {
    const newPreview = {
      name: `Preview ${template.previewDataSets.length + 1}`,
      data: {} as Record<string, Record<string, unknown>>,
    }
    template.sections.forEach(section => {
      newPreview.data[section.id] = {}
      section.fields.forEach(field => {
        newPreview.data[section.id][field.name] = getDefaultPreviewValue(field.type)
      })
    })
    setTemplate(prev => ({
      ...prev,
      previewDataSets: [...prev.previewDataSets, newPreview],
    }))
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Template</h1>
              <p className="text-sm text-gray-500">Build a new event template</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending ? 'Saving...' : 'Save Template'}
          </button>
        </div>

        <div className="flex gap-1 mt-4 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'sections', label: 'Sections', icon: Layers },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'preview', label: 'Preview Data', icon: Eye },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'basic' && (
          <BasicInfoTab template={template} setTemplate={setTemplate} />
        )}

        {activeTab === 'sections' && (
          <SectionsTab
            sections={template.sections}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            addSection={addSection}
            removeSection={removeSection}
            updateSection={updateSection}
            moveSection={moveSection}
            addField={addField}
            updateField={updateField}
            removeField={removeField}
          />
        )}

        {activeTab === 'design' && (
          <DesignTab
            colorSchemes={template.colorSchemes}
            fontPairs={template.fontPairs}
            addColorScheme={addColorScheme}
            updateColorScheme={updateColorScheme}
            removeColorScheme={removeColorScheme}
            setTemplate={setTemplate}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewDataTab
            sections={template.sections}
            previewDataSets={template.previewDataSets}
            addPreviewData={addPreviewData}
            setTemplate={setTemplate}
          />
        )}
      </div>
    </div>
  )
}

function BasicInfoTab({ template, setTemplate }: { template: any; setTemplate: any }) {
  return (
    <div className="card space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
        <input
          type="text"
          value={template.name}
          onChange={(e) => setTemplate((prev: any) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Elegant Wedding"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={template.description}
          onChange={(e) => setTemplate((prev: any) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your template..."
          rows={3}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={template.category}
          onChange={(e) => setTemplate((prev: any) => ({ ...prev, category: e.target.value }))}
          className="input-field"
        >
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
          <option value="baby_shower">Baby Shower</option>
          <option value="anniversary">Anniversary</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
        <input
          type="url"
          value={template.thumbnail}
          onChange={(e) => setTemplate((prev: any) => ({ ...prev, thumbnail: e.target.value }))}
          placeholder="https://example.com/image.jpg"
          className="input-field"
        />
        {template.thumbnail && (
          <div className="mt-2 w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img src={template.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}

function SectionsTab({
  sections,
  expandedSection,
  setExpandedSection,
  addSection,
  removeSection,
  updateSection,
  moveSection,
  addField,
  updateField,
  removeField,
}: {
  sections: SectionDefinition[]
  expandedSection: string | null
  setExpandedSection: (id: string | null) => void
  addSection: (type: string) => void
  removeSection: (id: string) => void
  updateSection: (id: string, updates: Partial<SectionDefinition>) => void
  moveSection: (id: string, direction: 'up' | 'down') => void
  addField: (sectionId: string) => void
  updateField: (sectionId: string, fieldId: string, updates: Partial<FieldDefinition>) => void
  removeField: (sectionId: string, fieldId: string) => void
}) {
  const [showAddSection, setShowAddSection] = useState(false)

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <div className="card text-center py-12">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
          <p className="text-gray-600 mb-4">Add sections to build your template</p>
          <button
            onClick={() => setShowAddSection(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      ) : (
        <>
          {sections.map((section, index) => (
            <div key={section.id} className="card">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              >
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{section.name}</h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {section.type}
                    </span>
                    {section.isRequired && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Required</span>
                    )}
                    {section.isLocked && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">Locked</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{section.fields.length} fields</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up') }}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down') }}
                    disabled={index === sections.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedSection === section.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSection === section.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSection(section.id, { name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.isRequired}
                          onChange={(e) => updateSection(section.id, { isRequired: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.isLocked}
                          onChange={(e) => updateSection(section.id, { isLocked: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Locked</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.defaultVisible}
                          onChange={(e) => updateSection(section.id, { defaultVisible: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Visible</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Fields</h4>
                      <button
                        onClick={() => addField(section.id)}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>
                    </div>
                    
                    {section.fields.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No fields yet</p>
                    ) : (
                      <div className="space-y-3">
                        {section.fields.map((field) => (
                          <FieldEditor
                            key={field.id}
                            field={field}
                            onUpdate={(updates) => updateField(section.id, field.id, updates)}
                            onRemove={() => removeField(section.id, field.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => setShowAddSection(true)}
            className="w-full card border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 py-4"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
        </>
      )}

      {showAddSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Add Section</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {SECTION_TYPES.map((sectionType) => (
                <button
                  key={sectionType.type}
                  onClick={() => {
                    addSection(sectionType.type)
                    setShowAddSection(false)
                  }}
                  className="p-4 text-left rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">{sectionType.name}</h4>
                  <p className="text-sm text-gray-500">{sectionType.description}</p>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddSection(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FieldEditor({
  field,
  onUpdate,
  onRemove,
}: {
  field: FieldDefinition
  onUpdate: (updates: Partial<FieldDefinition>) => void
  onRemove: () => void
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            className="input-field text-sm py-1.5"
            placeholder="Field label"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as FieldDefinition['type'] })}
            className="input-field text-sm py-1.5"
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft.type} value={ft.type}>{ft.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="input-field text-sm py-1.5"
            placeholder="Placeholder text"
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-100 text-red-600 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function DesignTab({
  colorSchemes,
  fontPairs,
  addColorScheme,
  updateColorScheme,
  removeColorScheme,
  setTemplate,
}: {
  colorSchemes: ColorScheme[]
  fontPairs: FontPair[]
  addColorScheme: () => void
  updateColorScheme: (id: string, updates: Partial<ColorScheme>) => void
  removeColorScheme: (id: string) => void
  setTemplate: any
}) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Color Schemes</h3>
          <button
            onClick={addColorScheme}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Scheme
          </button>
        </div>
        
        <div className="space-y-4">
          {colorSchemes.map((scheme) => (
            <div key={scheme.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={scheme.name}
                  onChange={(e) => updateColorScheme(scheme.id, { name: e.target.value })}
                  className="font-medium bg-transparent border-none focus:ring-0 p-0"
                />
                <button
                  onClick={() => removeColorScheme(scheme.id)}
                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map((colorKey) => (
                  <div key={colorKey}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize">{colorKey}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={scheme[colorKey]}
                        onChange={(e) => updateColorScheme(scheme.id, { [colorKey]: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={scheme[colorKey]}
                        onChange={(e) => updateColorScheme(scheme.id, { [colorKey]: e.target.value })}
                        className="input-field text-xs py-1 flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                {[scheme.primary, scheme.secondary, scheme.accent, scheme.background].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Font Pairs</h3>
        </div>
        
        <div className="space-y-3">
          {fontPairs.map((pair) => (
            <div key={pair.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{pair.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Heading Font</label>
                  <p className="text-sm" style={{ fontFamily: pair.heading }}>{pair.heading}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Body Font</label>
                  <p className="text-sm" style={{ fontFamily: pair.body }}>{pair.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreviewDataTab({
  sections,
  previewDataSets,
  addPreviewData,
  setTemplate,
}: {
  sections: SectionDefinition[]
  previewDataSets: { name: string; data: Record<string, Record<string, unknown>> }[]
  addPreviewData: () => void
  setTemplate: any
}) {
  const [activePreview, setActivePreview] = useState(0)

  const updatePreviewData = (previewIndex: number, sectionId: string, fieldName: string, value: unknown) => {
    setTemplate((prev: any) => ({
      ...prev,
      previewDataSets: prev.previewDataSets.map((p: any, i: number) => {
        if (i !== previewIndex) return p
        return {
          ...p,
          data: {
            ...p.data,
            [sectionId]: {
              ...p.data[sectionId],
              [fieldName]: value,
            },
          },
        }
      }),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Preview Data Sets</h3>
          <button
            onClick={addPreviewData}
            disabled={sections.length === 0}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Preview
          </button>
        </div>

        {sections.length === 0 ? (
          <p className="text-gray-500 text-sm">Add sections first to create preview data</p>
        ) : previewDataSets.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No preview data yet</p>
            <button
              onClick={addPreviewData}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
            >
              Create preview data
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {previewDataSets.map((preview, index) => (
                <button
                  key={index}
                  onClick={() => setActivePreview(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activePreview === index
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preview.name}
                </button>
              ))}
            </div>

            {previewDataSets[activePreview] && (
              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">{section.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={(previewDataSets[activePreview]?.data[section.id]?.[field.name] as string) || ''}
                              onChange={(e) => updatePreviewData(activePreview, section.id, field.name, e.target.value)}
                              className="input-field text-sm"
                              rows={2}
                            />
                          ) : field.type === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={(previewDataSets[activePreview]?.data[section.id]?.[field.name] as boolean) || false}
                              onChange={(e) => updatePreviewData(activePreview, section.id, field.name, e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              value={(previewDataSets[activePreview]?.data[section.id]?.[field.name] as string) || ''}
                              onChange={(e) => updatePreviewData(activePreview, section.id, field.name, e.target.value)}
                              className="input-field text-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function getDefaultFieldsForSection(type: string): FieldDefinition[] {
  const timestamp = Date.now()
  switch (type) {
    case 'hero':
      return [
        { id: `f-${timestamp}-1`, name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Event Title' },
        { id: `f-${timestamp}-2`, name: 'subtitle', label: 'Subtitle', type: 'text', required: false, placeholder: 'A beautiful subtitle' },
        { id: `f-${timestamp}-3`, name: 'background_image', label: 'Background Image', type: 'image', required: false },
      ]
    case 'event_details':
      return [
        { id: `f-${timestamp}-1`, name: 'event_date', label: 'Event Date', type: 'date', required: true },
        { id: `f-${timestamp}-2`, name: 'event_time', label: 'Event Time', type: 'time', required: true },
        { id: `f-${timestamp}-3`, name: 'description', label: 'Description', type: 'textarea', required: false },
      ]
    case 'venue':
      return [
        { id: `f-${timestamp}-1`, name: 'venue_name', label: 'Venue Name', type: 'text', required: true },
        { id: `f-${timestamp}-2`, name: 'address', label: 'Address', type: 'location', required: true },
        { id: `f-${timestamp}-3`, name: 'map_url', label: 'Map URL', type: 'url', required: false },
      ]
    case 'gallery':
      return [
        { id: `f-${timestamp}-1`, name: 'images', label: 'Gallery Images', type: 'gallery', required: false },
        { id: `f-${timestamp}-2`, name: 'caption', label: 'Gallery Caption', type: 'text', required: false },
      ]
    case 'story':
      return [
        { id: `f-${timestamp}-1`, name: 'story_title', label: 'Story Title', type: 'text', required: false },
        { id: `f-${timestamp}-2`, name: 'story_content', label: 'Story Content', type: 'textarea', required: false },
      ]
    case 'rsvp':
      return [
        { id: `f-${timestamp}-1`, name: 'rsvp_title', label: 'RSVP Title', type: 'text', required: false, placeholder: 'Will you attend?' },
        { id: `f-${timestamp}-2`, name: 'rsvp_deadline', label: 'RSVP Deadline', type: 'date', required: false },
      ]
    case 'wishes':
      return [
        { id: `f-${timestamp}-1`, name: 'wishes_title', label: 'Wishes Title', type: 'text', required: false, placeholder: 'Leave your wishes' },
      ]
    case 'contact':
      return [
        { id: `f-${timestamp}-1`, name: 'contact_name', label: 'Contact Name', type: 'text', required: false },
        { id: `f-${timestamp}-2`, name: 'contact_phone', label: 'Phone', type: 'phone', required: false },
        { id: `f-${timestamp}-3`, name: 'contact_email', label: 'Email', type: 'email', required: false },
      ]
    default:
      return []
  }
}

function getDefaultPreviewValue(type: string): unknown {
  switch (type) {
    case 'text': return 'Sample text'
    case 'textarea': return 'Sample long text content goes here...'
    case 'date': return new Date().toISOString().split('T')[0]
    case 'time': return '14:00'
    case 'datetime': return new Date().toISOString()
    case 'number': return 0
    case 'image': return ''
    case 'gallery': return []
    case 'location': return 'Sample Address'
    case 'select': return ''
    case 'boolean': return false
    case 'url': return 'https://example.com'
    case 'email': return 'example@email.com'
    case 'phone': return '+1234567890'
    default: return ''
  }
}
