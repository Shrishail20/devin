'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Heart, 
  Users,
  Send,
  Check,
  X,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { siteApi, guestApi, wishApi } from '@/lib/api'
import { Site, Template } from '@/types'

export default function PublicEventPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { data: site, isLoading, error } = useQuery({
    queryKey: ['public-site', slug],
    queryFn: async () => {
      const response = await siteApi.getBySlug(slug)
      return response.data as Site
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

  const template = site.templateId as Template

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <HeroSection site={site} />
      
      {site.settings?.enableRsvp && (
        <RsvpSection site={site} />
      )}
      
      {site.settings?.enableWishes && (
        <WishesSection site={site} />
      )}
      
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>Created with <Heart className="w-4 h-4 inline text-pink-500" /> using Evento</p>
      </footer>
    </div>
  )
}

function HeroSection({ site }: { site: Site }) {
  const eventDate = site.settings?.eventDate ? new Date(site.settings.eventDate) : null
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-display">
          {site.title}
        </h1>
        
        {site.description && (
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            {site.description}
          </p>
        )}
        
        {eventDate && (
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-white/80 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-medium">
                {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-medium">
                {eventDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function RsvpSection({ site }: { site: Site }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'attending' as 'attending' | 'not_attending' | 'maybe',
    numberOfGuests: 1,
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const submitMutation = useMutation({
    mutationFn: () => guestApi.submitRsvp(site._id, formData),
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
          <Users className="w-10 h-10 text-purple-600 mx-auto mb-4" />
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
                Number of Guests
              </label>
              <select
                value={formData.numberOfGuests}
                onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
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
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </form>
      </div>
    </section>
  )
}

function WishesSection({ site }: { site: Site }) {
  const [newWish, setNewWish] = useState({ authorName: '', message: '' })

  const { data: wishes, refetch } = useQuery({
    queryKey: ['wishes', site._id],
    queryFn: async () => {
      const response = await wishApi.getApproved(site._id)
      return response.data
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => wishApi.submit(site._id, newWish.authorName, newWish.message),
    onSuccess: () => {
      setNewWish({ authorName: '', message: '' })
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
    if (!newWish.authorName.trim() || !newWish.message.trim()) return
    submitMutation.mutate()
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="w-10 h-10 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wishes & Messages</h2>
          <p className="text-gray-600">Leave your heartfelt wishes for the couple</p>
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
                value={newWish.authorName}
                onChange={(e) => setNewWish({ ...newWish, authorName: e.target.value })}
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
                <p className="text-sm text-gray-500">— {wish.authorName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
