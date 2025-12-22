'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone,
  Calendar,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  Users,
  Gift,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { templateApi } from '@/lib/api'
import { Template, SectionDefinition } from '@/types'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [activePreviewSet, setActivePreviewSet] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['template-preview', templateId],
    queryFn: async () => {
      const response = await templateApi.getOne(templateId)
      // API returns { template: {...}, version: {...}, sections: [...] }
      const template = response.data.template || response.data
      const sections = response.data.sections || []
      // Merge sections into template object for rendering
      return { ...template, sections } as Template
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Template not found</h2>
        <button onClick={() => router.back()} className="mt-4 btn-primary">Go Back</button>
      </div>
    )
  }

  const template = data
  const previewData = template.previewDataSets?.[activePreviewSet]?.data || {}
  const colorScheme = template.colorSchemes?.[0] || {
    primary: '#9333ea',
    secondary: '#c084fc',
    accent: '#f0abfc',
    background: '#faf5ff',
    text: '#1f2937'
  }

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'max-w-[375px]'
      case 'tablet': return 'max-w-[768px]'
      default: return 'max-w-[1200px]'
    }
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
              <h1 className="text-xl font-bold text-gray-900">Preview: {template.name}</h1>
              <p className="text-sm text-gray-500">See how your template looks with sample data</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-2 rounded-md transition-colors ${deviceMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-2 rounded-md transition-colors ${deviceMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-2 rounded-md transition-colors ${deviceMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {template.previewDataSets && template.previewDataSets.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {template.previewDataSets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setActivePreviewSet(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activePreviewSet === index
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <div 
          className={`w-full ${getDeviceWidth()} bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300`}
          style={{ backgroundColor: colorScheme.background }}
        >
          {template.sections?.length > 0 ? (
            template.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <PreviewSection
                  key={section.id || section.sectionId}
                  section={section}
                  colorScheme={colorScheme}
                  deviceMode={deviceMode}
                />
              ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No sections in this template</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewSection({
  section,
  colorScheme,
  deviceMode
}: {
  section: SectionDefinition & { sampleValues?: Record<string, unknown> }
  colorScheme: { primary: string; secondary: string; accent: string; background: string; text: string }
  deviceMode: DeviceMode
}) {
  const sampleValues = section.sampleValues || {}
  
  const getValue = (fieldName: string, defaultValue: string = '') => {
    return (sampleValues[fieldName] as string) || defaultValue
  }

  const getArray = (fieldName: string): string[] => {
    const value = sampleValues[fieldName]
    return Array.isArray(value) ? value : []
  }

  const isMobile = deviceMode === 'mobile'

  switch (section.type) {
    case 'hero':
      const groomName = getValue('groomName', 'Groom')
      const brideName = getValue('brideName', 'Bride')
      const tagline = getValue('tagline', 'Together Forever')
      const backgroundImage = getValue('backgroundImage', '')
      const weddingDate = getValue('weddingDate', '')
      
      return (
        <div 
          className="relative min-h-[500px] flex items-center justify-center text-center p-8"
          style={{ 
            backgroundImage: backgroundImage 
              ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})` 
              : `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10">
            <p className={`text-white/90 uppercase tracking-[0.3em] mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              The Wedding of
            </p>
            <h1 
              className={`font-serif font-bold mb-4 text-white ${isMobile ? 'text-4xl' : 'text-6xl'}`}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              {groomName} & {brideName}
            </h1>
            <p 
              className={`text-white/90 italic ${isMobile ? 'text-lg' : 'text-2xl'}`}
            >
              {tagline}
            </p>
            {weddingDate && (
              <p className={`mt-6 text-white/80 ${isMobile ? 'text-base' : 'text-xl'}`}>
                {new Date(weddingDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>
        </div>
      )

    case 'event_details':
      const ceremonyTime = getValue('ceremonyTime', '14:00')
      const ceremonyVenue = getValue('ceremonyVenue', 'The Chapel')
      const receptionTime = getValue('receptionTime', '17:00')
      const receptionVenue = getValue('receptionVenue', 'The Ballroom')
      const dressCode = getValue('dressCode', 'Formal Attire')
      
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`} style={{ backgroundColor: colorScheme.background }}>
          <h2 
            className={`font-serif font-bold mb-8 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Wedding Schedule
          </h2>
          <div className={`max-w-2xl mx-auto ${isMobile ? 'space-y-6' : 'space-y-8'}`}>
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: `${colorScheme.primary}10` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colorScheme.primary }}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider" style={{ color: colorScheme.primary }}>Ceremony</p>
                <p className="font-semibold text-lg" style={{ color: colorScheme.text }}>{ceremonyTime}</p>
                <p className="text-gray-600">{ceremonyVenue}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: `${colorScheme.secondary}10` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colorScheme.secondary }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider" style={{ color: colorScheme.secondary }}>Reception</p>
                <p className="font-semibold text-lg" style={{ color: colorScheme.text }}>{receptionTime}</p>
                <p className="text-gray-600">{receptionVenue}</p>
              </div>
            </div>
            {dressCode && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Dress Code</p>
                <p className="font-medium" style={{ color: colorScheme.primary }}>{dressCode}</p>
              </div>
            )}
          </div>
        </div>
      )

    case 'venue':
      const venueName = getValue('venueName', 'Beautiful Venue')
      const venueAddress = getValue('address', '123 Event Street, City, Country')
      const venueImage = getValue('venueImage', '')
      const mapUrl = getValue('mapUrl', '')
      const directions = getValue('directions', '')
      
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-serif font-bold mb-8 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            The Venue
          </h2>
          <div className="max-w-4xl mx-auto">
            {venueImage && (
              <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
                <img 
                  src={venueImage} 
                  alt={venueName}
                  className="w-full h-64 object-cover"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-semibold text-xl">{venueName}</h3>
                  </div>
                  <p className="text-white/80">{venueAddress}</p>
                </div>
              </div>
            )}
            {!venueImage && (
              <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: `${colorScheme.primary}10` }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-6 h-6" style={{ color: colorScheme.primary }} />
                  <h3 className="font-semibold text-xl" style={{ color: colorScheme.primary }}>{venueName}</h3>
                </div>
                <p className="text-gray-600">{venueAddress}</p>
              </div>
            )}
            {directions && (
              <p className="mt-4 text-center text-gray-600 italic">{directions}</p>
            )}
            {mapUrl && (
              <div className="mt-6 text-center">
                <a 
                  href={mapUrl.replace('/embed?', '/place?')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: colorScheme.primary }}
                >
                  <Globe className="w-5 h-5" />
                  Get Directions
                </a>
              </div>
            )}
          </div>
        </div>
      )

    case 'gallery':
      const galleryTitle = getValue('title', 'Our Moments Together')
      const galleryImages = getArray('images')
      
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`} style={{ backgroundColor: `${colorScheme.accent}15` }}>
          <h2 
            className={`font-serif font-bold mb-8 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {galleryTitle}
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-4 max-w-4xl mx-auto`}>
            {galleryImages.length > 0 ? (
              galleryImages.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <img 
                    src={imageUrl} 
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${colorScheme.primary}30, ${colorScheme.secondary}30)` }}
                />
              ))
            )}
          </div>
        </div>
      )

    case 'story':
      const storyTitle = getValue('title', 'Our Love Story')
      const storyContent = getValue('story', 'Share your beautiful story here. Tell your guests about how you met, your journey together, and what makes this celebration special.')
      const coupleImage = getValue('coupleImage', '')
      
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-serif font-bold mb-8 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {storyTitle}
          </h2>
          <div className="max-w-4xl mx-auto">
            {coupleImage && (
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <img 
                    src={coupleImage} 
                    alt="Our Story"
                    className={`rounded-2xl shadow-xl object-cover ${isMobile ? 'w-full h-64' : 'w-96 h-80'}`}
                  />
                  <div 
                    className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colorScheme.accent }}
                  >
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            )}
            <p className="text-gray-600 text-center leading-relaxed text-lg italic">
              &ldquo;{storyContent}&rdquo;
            </p>
          </div>
        </div>
      )

    case 'rsvp':
      const rsvpTitle = getValue('title', 'Join Our Celebration')
      const rsvpMessage = getValue('message', 'We would be honored to have you celebrate this special day with us.')
      const rsvpDeadline = getValue('deadline', '')
      
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-12'}`}
          style={{ backgroundColor: `${colorScheme.primary}08` }}
        >
          <h2 
            className={`font-serif font-bold mb-4 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {rsvpTitle}
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-lg mx-auto">{rsvpMessage}</p>
          <div className="max-w-md mx-auto space-y-4">
            <input 
              type="text" 
              placeholder="Your Full Name" 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            />
            <input 
              type="number" 
              placeholder="Number of Guests" 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            />
            <select 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            >
              <option>Will you attend?</option>
              <option>Joyfully Accept</option>
              <option>Regretfully Decline</option>
            </select>
            <textarea 
              placeholder="Dietary restrictions or special requests..." 
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            />
            <button 
              className="w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: colorScheme.primary }}
              disabled
            >
              Send RSVP
            </button>
          </div>
          {rsvpDeadline && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Kindly respond by {new Date(rsvpDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      )

    case 'wishes':
      const wishesTitle = getValue('title', 'Send Your Wishes')
      const wishesDescription = getValue('description', 'Share your love and blessings for our new journey together')
      
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <div className="text-center mb-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colorScheme.accent }} />
            <h2 
              className={`font-serif font-bold mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: colorScheme.primary }}
            >
              {wishesTitle}
            </h2>
            <p className="text-gray-600">{wishesDescription}</p>
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            />
            <textarea 
              placeholder="Write your heartfelt wishes for the couple..." 
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors"
              disabled
            />
            <button 
              className="w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: colorScheme.secondary }}
              disabled
            >
              <Heart className="w-5 h-5" />
              Send Wishes
            </button>
          </div>
        </div>
      )

    case 'contact':
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-12'}`}
          style={{ backgroundColor: `${colorScheme.primary}10` }}
        >
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Contact
          </h2>
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-center gap-12'}`}>
            {getValue('contact_name') && (
              <div className="text-center">
                <p className="font-semibold">{getValue('contact_name')}</p>
              </div>
            )}
            {getValue('contact_phone') && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" style={{ color: colorScheme.primary }} />
                <span>{getValue('contact_phone')}</span>
              </div>
            )}
            {getValue('contact_email') && (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: colorScheme.primary }} />
                <span>{getValue('contact_email')}</span>
              </div>
            )}
          </div>
        </div>
      )

    case 'countdown':
      const targetDate = getValue('targetDate', '')
      const countdownMessage = getValue('message', 'Counting down to our forever...')
      
      // Calculate countdown values
      let days = 0, hours = 0, minutes = 0, seconds = 0
      if (targetDate) {
        const target = new Date(targetDate).getTime()
        const now = new Date().getTime()
        const diff = target - now
        if (diff > 0) {
          days = Math.floor(diff / (1000 * 60 * 60 * 24))
          hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          seconds = Math.floor((diff % (1000 * 60)) / 1000)
        }
      }
      
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-12'} text-center`}
          style={{ background: `linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.secondary}15)` }}
        >
          <p className="text-gray-600 italic mb-4">{countdownMessage}</p>
          <div className={`flex justify-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
            {[
              { value: days, label: 'Days' },
              { value: hours, label: 'Hours' },
              { value: minutes, label: 'Minutes' },
              { value: seconds, label: 'Seconds' }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div 
                  className={`${isMobile ? 'w-16 h-16 text-xl' : 'w-24 h-24 text-3xl'} rounded-2xl flex items-center justify-center font-bold text-white shadow-lg`}
                  style={{ 
                    background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                    boxShadow: `0 4px 15px ${colorScheme.primary}40`
                  }}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <p className={`mt-2 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: colorScheme.primary }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'gift_registry':
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Gift Registry
          </h2>
          <div className="flex justify-center gap-4">
            <Gift className="w-12 h-12" style={{ color: colorScheme.primary }} />
          </div>
          <p className="mt-4 text-center text-gray-600">
            Your presence is the greatest gift. If you wish to give, please find our registry links here.
          </p>
        </div>
      )

    case 'footer':
      const footerMessage = getValue('message', 'Thank you for being part of our love story')
      const hashtag = getValue('hashtag', '')
      
      return (
        <div 
          className={`${isMobile ? 'p-8' : 'p-12'} text-center`}
          style={{ 
            background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            color: 'white' 
          }}
        >
          <Heart className="w-8 h-8 mx-auto mb-4 opacity-80" />
          <p className={`font-serif italic ${isMobile ? 'text-lg' : 'text-xl'}`}>{footerMessage}</p>
          {hashtag && (
            <p className="mt-4 text-white/70 font-medium">{hashtag}</p>
          )}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/60">Made with love using Evento</p>
          </div>
        </div>
      )

    default:
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-bold mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {section.name}
          </h2>
          <div className="space-y-2">
            {section.fields.map((field) => (
              <div key={field.id} className="flex gap-2">
                <span className="font-medium text-gray-600">{field.label}:</span>
                <span>{getValue(field.name, `[${field.label}]`)}</span>
              </div>
            ))}
          </div>
        </div>
      )
  }
}
