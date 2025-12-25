'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { 
  Heart, 
  Users,
  Send,
  Check,
  X,
  HelpCircle
} from 'lucide-react'
import { micrositeApi } from '@/lib/api'
import { MicrositeWithDetails } from '@/types'
import EventSectionRenderer, { ColorScheme, EventSection } from '@/components/EventSectionRenderer'

// Default color scheme if none is provided
const defaultColorScheme: ColorScheme = {
  primary: '#9333ea',
  secondary: '#c084fc',
  accent: '#f0abfc',
  background: '#faf5ff',
  text: '#1f2937'
}

export default function PublicEventPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { data: site, isLoading, error } = useQuery({
    queryKey: ['public-microsite', slug],
    queryFn: async () => {
      const response = await micrositeApi.getPublic(slug)
      // API returns { microsite, version, templateSections, sections, wishes }
      const data = response.data
      return {
        ...data.microsite,
        version: data.version,
        templateSections: data.templateSections,
        sections: data.sections,
        wishes: data.wishes,
      } as MicrositeWithDetails
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">This event page doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Get color scheme from microsite or version, or use default
  const colorSchemes = site.version?.colorSchemes || []
  const selectedSchemeIndex = typeof site.colorScheme === 'number' ? site.colorScheme : 0
  const colorScheme: ColorScheme = (colorSchemes.length > selectedSchemeIndex ? colorSchemes[selectedSchemeIndex] : null) || defaultColorScheme

  // Get sections to render - merge templateSections with microsite sections
  // templateSections have the type/order, sections have the user's values
  const templateSections = site.templateSections || []
  const micrositeSections = site.sections || []

  // Create a map of microsite sections by sectionId for quick lookup
  const sectionValuesMap = new Map<string, Record<string, unknown>>()
  micrositeSections.forEach((section: any) => {
    sectionValuesMap.set(section.sectionId, section.values || {})
  })

  // Merge template sections with microsite values
  const sectionsToRender: Array<EventSection & { values: Record<string, unknown> }> = templateSections
    .filter((ts: any) => {
      // Check if this section is enabled in the microsite
      const micrositeSection = micrositeSections.find((ms: any) => ms.sectionId === ts.sectionId)
      return micrositeSection ? micrositeSection.enabled !== false : true
    })
    .sort((a: any, b: any) => a.order - b.order)
    .map((ts: any) => ({
      ...ts,
      values: sectionValuesMap.get(ts.sectionId) || ts.sampleValues || {}
    }))

  // Check if we have any sections to render
  const hasSections = sectionsToRender.length > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorScheme.background }}>
      {hasSections ? (
        // Render template sections using the shared renderer
        sectionsToRender.map((section) => (
          <EventSectionRenderer
            key={section._id || section.sectionId}
            section={section}
            values={section.values}
            colorScheme={colorScheme}
            deviceMode="desktop"
            isPreview={false}
          />
        ))
      ) : (
        // Fallback to simple title display if no sections
        <FallbackHeroSection site={site} colorScheme={colorScheme} />
      )}
      
      {/* Always show RSVP if enabled (functional form) */}
      {site.settings?.enableRsvp && (
        <RsvpSection site={site} colorScheme={colorScheme} />
      )}
      
      {/* Always show Wishes if enabled (functional form) */}
      {site.settings?.enableWishes && (
        <WishesSection site={site} colorScheme={colorScheme} />
      )}
      
      <footer 
        className="py-8 text-center text-sm"
        style={{ color: colorScheme.text }}
      >
        <p>Created with <Heart className="w-4 h-4 inline text-pink-500" /> using Evento</p>
      </footer>
    </div>
  )
}

// Fallback hero section when no template sections are available
function FallbackHeroSection({ site, colorScheme }: { site: MicrositeWithDetails; colorScheme: ColorScheme }) {
  return (
    <section 
      className="relative min-h-[60vh] flex items-center justify-center px-4 py-20"
      style={{ 
        background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`
      }}
    >
      <div className="relative text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-display">
          {site.title}
        </h1>
      </div>
    </section>
  )
}

function RsvpSection({ site, colorScheme }: { site: MicrositeWithDetails; colorScheme: ColorScheme }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'attending' as 'attending' | 'not_attending' | 'maybe',
    partySize: 1,
    dietaryNotes: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const submitMutation = useMutation({
    mutationFn: () => micrositeApi.submitRsvp(site.slug, formData),
    onSuccess: () => {
      setSubmitted(true)
      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your RSVP has been submitted',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to submit RSVP',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate()
  }

  if (submitted) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">RSVP Submitted!</h2>
          <p className="text-gray-600">Thank you for your response. We look forward to seeing you!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Users className="w-10 h-10 mx-auto mb-4" style={{ color: colorScheme.primary }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">RSVP</h2>
          <p className="text-gray-600">Let us know if you can make it!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Will you attend? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'attending', label: 'Yes', icon: Check, color: 'green' },
                { value: 'not_attending', label: 'No', icon: X, color: 'red' },
                { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'yellow' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value as any })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    formData.status === option.value
                      ? option.color === 'green' 
                        ? 'border-green-500 bg-green-50'
                        : option.color === 'red'
                        ? 'border-red-500 bg-red-50'
                        : 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon className={`w-5 h-5 ${
                    option.color === 'green' ? 'text-green-600' :
                    option.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {formData.status === 'attending' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Size
              </label>
              <select
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                className="input-field"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Any message for the hosts..."
            />
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full btn-primary disabled:opacity-50"
            style={{ backgroundColor: colorScheme.primary }}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </form>
      </div>
    </section>
  )
}

function WishesSection({ site, colorScheme }: { site: MicrositeWithDetails; colorScheme: ColorScheme }) {
  const [newWish, setNewWish] = useState({ name: '', message: '' })

  const { data: wishes, refetch } = useQuery({
    queryKey: ['wishes', site.slug],
    queryFn: async () => {
      // Get wishes from the public microsite data
      return (site as any).wishes || []
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => micrositeApi.submitWish(site.slug, newWish.name, newWish.message),
    onSuccess: () => {
      setNewWish({ name: '', message: '' })
      refetch()
      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: site.settings?.requireWishApproval 
          ? 'Your wish has been submitted and will appear after approval'
          : 'Your wish has been added',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to submit wish',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWish.name.trim() || !newWish.message.trim()) return
    submitMutation.mutate()
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="w-10 h-10 mx-auto mb-4" style={{ color: colorScheme.accent }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wishes & Messages</h2>
          <p className="text-gray-600">Leave your heartfelt wishes</p>
        </div>

        <form onSubmit={handleSubmit} className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                required
                value={newWish.name}
                onChange={(e) => setNewWish({ ...newWish, name: e.target.value })}
                className="input-field"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                required
                value={newWish.message}
                onChange={(e) => setNewWish({ ...newWish, message: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="Write your wishes..."
              />
            </div>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: colorScheme.secondary }}
            >
              <Send className="w-4 h-4" />
              {submitMutation.isPending ? 'Sending...' : 'Send Wish'}
            </button>
          </div>
        </form>

        {wishes && wishes.length > 0 && (
          <div className="space-y-4">
            {wishes.map((wish: any) => (
              <div 
                key={wish._id} 
                className={`card ${wish.isHighlighted ? 'border-2 border-pink-300 bg-pink-50' : ''}`}
              >
                {wish.isHighlighted && (
                  <div className="flex items-center gap-1 text-pink-600 text-sm mb-2">
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Highlighted</span>
                  </div>
                )}
                <p className="text-gray-700 mb-3">{wish.message}</p>
                <p className="text-sm text-gray-500">— {wish.authorName || wish.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
