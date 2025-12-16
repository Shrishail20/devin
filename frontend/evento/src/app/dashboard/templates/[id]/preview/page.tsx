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
      return response.data as Template
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
                  key={section.id}
                  section={section}
                  data={previewData[section.id] || {}}
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
  data,
  colorScheme,
  deviceMode
}: {
  section: SectionDefinition
  data: Record<string, unknown>
  colorScheme: { primary: string; secondary: string; accent: string; background: string; text: string }
  deviceMode: DeviceMode
}) {
  const getValue = (fieldName: string, defaultValue: string = '') => {
    return (data[fieldName] as string) || defaultValue
  }

  const isMobile = deviceMode === 'mobile'

  switch (section.type) {
    case 'hero':
      return (
        <div 
          className="relative min-h-[400px] flex items-center justify-center text-center p-8"
          style={{ 
            background: `linear-gradient(135deg, ${colorScheme.primary}20, ${colorScheme.secondary}20)`,
            backgroundImage: getValue('background_image') ? `url(${getValue('background_image')})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10">
            <h1 
              className={`font-bold mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}
              style={{ color: colorScheme.primary }}
            >
              {getValue('title', 'Event Title')}
            </h1>
            <p 
              className={`${isMobile ? 'text-lg' : 'text-2xl'}`}
              style={{ color: colorScheme.text }}
            >
              {getValue('subtitle', 'A beautiful celebration')}
            </p>
          </div>
        </div>
      )

    case 'event_details':
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`} style={{ color: colorScheme.text }}>
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Event Details
          </h2>
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-center gap-12'}`}>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" style={{ color: colorScheme.primary }} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{getValue('event_date', 'December 25, 2025')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" style={{ color: colorScheme.primary }} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{getValue('event_time', '6:00 PM')}</p>
              </div>
            </div>
          </div>
          {getValue('description') && (
            <p className="mt-6 text-center text-gray-600">{getValue('description')}</p>
          )}
        </div>
      )

    case 'venue':
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-12'}`}
          style={{ backgroundColor: `${colorScheme.primary}10` }}
        >
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Venue
          </h2>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5" style={{ color: colorScheme.primary }} />
              <p className="font-semibold text-lg">{getValue('venue_name', 'Beautiful Venue')}</p>
            </div>
            <p className="text-gray-600">{getValue('address', '123 Event Street, City, Country')}</p>
            {getValue('map_url') && (
              <a 
                href={getValue('map_url')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 rounded-full text-white"
                style={{ backgroundColor: colorScheme.primary }}
              >
                View on Map
              </a>
            )}
          </div>
        </div>
      )

    case 'gallery':
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Gallery
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="aspect-square rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colorScheme.primary}30, ${colorScheme.secondary}30)` }}
              />
            ))}
          </div>
          {getValue('caption') && (
            <p className="mt-4 text-center text-gray-600">{getValue('caption')}</p>
          )}
        </div>
      )

    case 'story':
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {getValue('story_title', 'Our Story')}
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
            {getValue('story_content', 'Share your beautiful story here. Tell your guests about how you met, your journey together, and what makes this celebration special.')}
          </p>
        </div>
      )

    case 'rsvp':
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-12'}`}
          style={{ backgroundColor: `${colorScheme.primary}10` }}
        >
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {getValue('rsvp_title', 'RSVP')}
          </h2>
          <div className="max-w-md mx-auto space-y-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': colorScheme.primary } as any}
              disabled
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              disabled
            />
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              disabled
            >
              <option>Will you attend?</option>
              <option>Yes, I will attend</option>
              <option>Sorry, I cannot attend</option>
            </select>
            <button 
              className="w-full py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: colorScheme.primary }}
              disabled
            >
              Submit RSVP
            </button>
          </div>
          {getValue('rsvp_deadline') && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Please respond by {getValue('rsvp_deadline')}
            </p>
          )}
        </div>
      )

    case 'wishes':
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'}`}>
          <h2 
            className={`font-bold mb-6 text-center ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            {getValue('wishes_title', 'Leave Your Wishes')}
          </h2>
          <div className="max-w-md mx-auto space-y-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              disabled
            />
            <textarea 
              placeholder="Write your wishes..." 
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              disabled
            />
            <button 
              className="w-full py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: colorScheme.primary }}
              disabled
            >
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
      return (
        <div className={`${isMobile ? 'p-6' : 'p-12'} text-center`}>
          <h2 
            className={`font-bold mb-6 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            style={{ color: colorScheme.primary }}
          >
            Countdown
          </h2>
          <div className={`flex justify-center ${isMobile ? 'gap-4' : 'gap-8'}`}>
            {['Days', 'Hours', 'Minutes', 'Seconds'].map((unit) => (
              <div key={unit} className="text-center">
                <div 
                  className={`${isMobile ? 'w-16 h-16 text-2xl' : 'w-20 h-20 text-3xl'} rounded-xl flex items-center justify-center font-bold text-white`}
                  style={{ backgroundColor: colorScheme.primary }}
                >
                  00
                </div>
                <p className="mt-2 text-sm text-gray-500">{unit}</p>
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
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-8'} text-center`}
          style={{ backgroundColor: colorScheme.primary, color: 'white' }}
        >
          <p className="text-sm opacity-80">Made with love using Evento</p>
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
