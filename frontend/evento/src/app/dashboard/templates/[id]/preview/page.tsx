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
  Globe,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { templateApi } from '@/lib/api'
import { Template, SectionDefinition, SampleProfile, TemplateSection } from '@/types'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface TemplateWithProfiles extends Template {
  sampleProfiles?: SampleProfile[]
  sections?: TemplateSection[]
}

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [activePreviewSet, setActivePreviewSet] = useState(0)
  const [activeColorScheme, setActiveColorScheme] = useState(0)
  const [activeSampleProfile, setActiveSampleProfile] = useState<string>('default')
  const [isFullPage, setIsFullPage] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['template-preview', templateId],
    queryFn: async () => {
      const response = await templateApi.getOne(templateId)
      // API returns { template: {...}, version: {...}, sections: [...] }
      const template = response.data.template || response.data
      const version = response.data.version || {}
      const sections = response.data.sections || []
      // Merge version data (colorSchemes, fontPairs, sampleProfiles) and sections into template object for rendering
      return { 
        ...template, 
        sections,
        colorSchemes: version.colorSchemes || template.colorSchemes || [],
        fontPairs: version.fontPairs || template.fontPairs || [],
        sampleProfiles: version.sampleProfiles || []
      } as TemplateWithProfiles
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
  const colorSchemes = template.colorSchemes || []
  const colorScheme = colorSchemes[activeColorScheme] || {
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
            <button
              onClick={() => setIsFullPage(!isFullPage)}
              className={`p-2 rounded-lg transition-colors ${isFullPage ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              title={isFullPage ? 'Exit Full Page' : 'Full Page Preview'}
            >
              {isFullPage ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sample Profile Selector */}
        {template.sampleProfiles && template.sampleProfiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Preview Data:</p>
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveSampleProfile('default')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeSampleProfile === 'default'
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Default
              </button>
              {template.sampleProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setActiveSampleProfile(profile.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeSampleProfile === profile.id
                      ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {profile.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Legacy preview data sets (for backward compatibility) */}
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

        {colorSchemes.length > 1 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Color Theme:</p>
            <div className="flex gap-2 overflow-x-auto">
              {colorSchemes.map((scheme: { id?: string; name?: string; primary: string; secondary: string; accent?: string }, index: number) => (
                <button
                  key={scheme.id || index}
                  onClick={() => setActiveColorScheme(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeColorScheme === index
                      ? 'ring-2 ring-offset-2 shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  style={{ 
                    backgroundColor: scheme.primary + '15',
                    borderColor: scheme.primary,
                    ringColor: scheme.primary
                  }}
                >
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: scheme.secondary }}
                    />
                    {scheme.accent && (
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: scheme.accent }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium" style={{ color: scheme.primary }}>
                    {scheme.name || `Theme ${index + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Page Preview Mode */}
      {isFullPage ? (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Full Page Preview - {template.name}</h2>
            <button
              onClick={() => setIsFullPage(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div style={{ backgroundColor: colorScheme.background }}>
            {template.sections?.length > 0 ? (
              template.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <PreviewSection
                    key={section.id || section.sectionId}
                    section={section}
                    colorScheme={colorScheme}
                    deviceMode="desktop"
                    activeSampleProfile={activeSampleProfile}
                  />
                ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No sections in this template</p>
              </div>
            )}
          </div>
        </div>
      ) : (
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
                    activeSampleProfile={activeSampleProfile}
                  />
                ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No sections in this template</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewSection({
  section,
  colorScheme,
  deviceMode,
  activeSampleProfile = 'default'
}: {
  section: SectionDefinition & { sampleValues?: Record<string, unknown>; sampleDataSets?: Array<{ profileId: string; values: Record<string, unknown> }> }
  colorScheme: { primary: string; secondary: string; accent: string; background: string; text: string }
  deviceMode: DeviceMode
  activeSampleProfile?: string
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  // Get sample values based on active profile
  // If a profile is selected and has data for this section, use it; otherwise fall back to default sampleValues
  const getEffectiveSampleValues = () => {
    if (activeSampleProfile !== 'default' && section.sampleDataSets) {
      const profileData = section.sampleDataSets.find(ds => ds.profileId === activeSampleProfile)
      if (profileData) {
        return profileData.values
      }
    }
    return section.sampleValues || {}
  }
  
  const sampleValues = getEffectiveSampleValues()
  
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
      // Support both wedding (groomName/brideName) and birthday (celebrantName/age) templates
      const celebrantName = getValue('celebrantName', '')
      const age = getValue('age', '')
      const groomName = getValue('groomName', '')
      const brideName = getValue('brideName', '')
      const tagline = getValue('tagline', 'Together Forever')
      const backgroundImage = getValue('backgroundImage', '')
      const weddingDate = getValue('weddingDate', '')
      const birthdayDate = getValue('birthdayDate', '')
      
      // Determine if this is a birthday or wedding template
      const isBirthday = celebrantName || age
      const eventDate = birthdayDate || weddingDate
      
      return (
        <div 
          className={`relative ${isMobile ? 'min-h-[400px] p-6' : 'min-h-[500px] p-8'} flex items-center justify-center text-center`}
          style={{ 
            backgroundImage: backgroundImage 
              ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})` 
              : `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10">
            {isBirthday ? (
              <>
                <p className={`text-white/90 uppercase tracking-[0.3em] mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  {celebrantName} is turning
                </p>
                <h1 
                  className={`font-serif font-bold mb-4 text-white ${isMobile ? 'text-6xl' : 'text-8xl'}`}
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {age}
                </h1>
              </>
            ) : (
              <>
                <p className={`text-white/90 uppercase tracking-[0.3em] mb-4 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                  The Wedding of
                </p>
                <h1 
                  className={`font-serif font-bold mb-4 text-white ${isMobile ? 'text-4xl' : 'text-6xl'}`}
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {groomName || 'Groom'} & {brideName || 'Bride'}
                </h1>
              </>
            )}
            <p 
              className={`text-white/90 italic ${isMobile ? 'text-lg' : 'text-2xl'}`}
            >
              {tagline}
            </p>
            {eventDate && (
              <p className={`mt-6 text-white/80 ${isMobile ? 'text-base' : 'text-xl'}`}>
                {new Date(eventDate).toLocaleDateString('en-US', { 
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
      // Support both wedding (ceremonyTime/ceremonyVenue) and birthday (partyTime/partyVenue) templates
      const partyTime = getValue('partyTime', '')
      const partyVenue = getValue('partyVenue', '')
      const partyTheme = getValue('theme', '')
      const ceremonyTime = getValue('ceremonyTime', '14:00')
      const ceremonyVenue = getValue('ceremonyVenue', 'The Chapel')
      const receptionTime = getValue('receptionTime', '17:00')
      const receptionVenue = getValue('receptionVenue', 'The Ballroom')
      const dressCode = getValue('dressCode', 'Formal Attire')
      
      // Determine if this is a birthday or wedding template
      const isBirthdayEvent = partyTime || partyVenue || partyTheme
      
      if (isBirthdayEvent) {
        return (
          <div className={`${isMobile ? 'p-4' : 'p-12'}`} style={{ backgroundColor: colorScheme.background }}>
            <h2 
              className={`font-serif font-bold text-center ${isMobile ? 'text-xl mb-4' : 'text-3xl mb-8'}`}
              style={{ color: colorScheme.primary }}
            >
              Party Details
            </h2>
            <div className={`max-w-2xl mx-auto ${isMobile ? 'space-y-3' : 'space-y-8'}`}>
              <div className={`flex items-start gap-3 ${isMobile ? 'p-3' : 'p-4'} rounded-xl`} style={{ backgroundColor: `${colorScheme.primary}10` }}>
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: colorScheme.primary }}>
                  <Clock className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </div>
                <div className="min-w-0">
                  <p className={`uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: colorScheme.primary }}>Party Time</p>
                  <p className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`} style={{ color: colorScheme.text }}>{partyTime}</p>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>{partyVenue}</p>
                </div>
              </div>
              {partyTheme && (
                <div className={`flex items-start gap-3 ${isMobile ? 'p-3' : 'p-4'} rounded-xl`} style={{ backgroundColor: `${colorScheme.accent}15` }}>
                  <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: colorScheme.accent }}>
                    <Star className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-sm'}`} style={{ color: colorScheme.accent }}>Party Theme</p>
                    <p className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`} style={{ color: colorScheme.text }}>{partyTheme}</p>
                  </div>
                </div>
              )}
              {dressCode && (
                <div className={`text-center ${isMobile ? 'pt-3' : 'pt-4'} border-t border-gray-200`}>
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Dress Code</p>
                  <p className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`} style={{ color: colorScheme.primary }}>{dressCode}</p>
                </div>
              )}
            </div>
          </div>
        )
      }
      
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
        <div className={`${isMobile ? 'p-4' : 'p-12'}`}>
          <h2 
            className={`font-serif font-bold text-center ${isMobile ? 'text-xl mb-4' : 'text-3xl mb-8'}`}
            style={{ color: colorScheme.primary }}
          >
            The Venue
          </h2>
          <div className="max-w-4xl mx-auto">
            {venueImage && (
              <div className={`relative overflow-hidden mb-4 shadow-lg ${isMobile ? 'rounded-xl' : 'rounded-2xl'}`}>
                <img 
                  src={venueImage} 
                  alt={venueName}
                  className={`w-full object-cover ${isMobile ? 'h-48' : 'h-64'}`}
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
      
      const openLightbox = (index: number) => {
        setLightboxIndex(index)
        setLightboxOpen(true)
      }
      
      const closeLightbox = () => {
        setLightboxOpen(false)
      }
      
      const goToPrevious = () => {
        setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
      }
      
      const goToNext = () => {
        setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
      }
      
      return (
        <div className={`${isMobile ? 'p-4' : 'p-12'}`} style={{ backgroundColor: `${colorScheme.accent}15` }}>
          <h2 
            className={`font-serif font-bold text-center ${isMobile ? 'text-xl mb-4' : 'text-3xl mb-8'}`}
            style={{ color: colorScheme.primary }}
          >
            {galleryTitle}
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-4'} max-w-4xl mx-auto`}>
            {galleryImages.length > 0 ? (
              galleryImages.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className={`aspect-square overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}
                  onClick={() => openLightbox(index)}
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
                  className={`aspect-square ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}
                  style={{ background: `linear-gradient(135deg, ${colorScheme.primary}30, ${colorScheme.secondary}30)` }}
                />
              ))
            )}
          </div>
          
          {/* Lightbox Popup */}
          {lightboxOpen && galleryImages.length > 0 && (
            <div 
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              {/* Popup Card */}
              <div 
                className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[480px] max-h-[70vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with close button */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    {lightboxIndex + 1} / {galleryImages.length}
                  </span>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={closeLightbox}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Image */}
                <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
                  <img 
                    src={galleryImages[lightboxIndex]} 
                    alt={`Gallery image ${lightboxIndex + 1}`}
                    className="max-h-[50vh] max-w-full object-contain"
                  />
                </div>
                
                {/* Footer with navigation */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-gray-100">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={goToNext}
                    >
                      <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
          className={`${isMobile ? 'p-4' : 'p-12'}`}
          style={{ backgroundColor: `${colorScheme.primary}08` }}
        >
          <h2 
            className={`font-serif font-bold text-center ${isMobile ? 'text-xl mb-2' : 'text-3xl mb-4'}`}
            style={{ color: colorScheme.primary }}
          >
            {rsvpTitle}
          </h2>
          <p className={`text-center text-gray-600 max-w-lg mx-auto ${isMobile ? 'text-sm mb-4' : 'text-base mb-8'}`}>{rsvpMessage}</p>
          <div className={`max-w-md mx-auto ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            />
            <input 
              type="number" 
              placeholder="Number of Guests" 
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            />
            <select 
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            >
              <option>Will you attend?</option>
              <option>Joyfully Accept</option>
              <option>Regretfully Decline</option>
            </select>
            <textarea 
              placeholder="Dietary restrictions or special requests..." 
              rows={2}
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            />
            <button 
              className={`w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all ${isMobile ? 'py-3 rounded-lg text-base' : 'py-4 rounded-xl text-lg'}`}
              style={{ backgroundColor: colorScheme.primary }}
              disabled
            >
              Send RSVP
            </button>
          </div>
          {rsvpDeadline && (
            <p className={`text-center text-gray-500 ${isMobile ? 'mt-4 text-xs' : 'mt-6 text-sm'}`}>
              Kindly respond by {new Date(rsvpDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      )

    case 'wishes':
      const wishesTitle = getValue('title', 'Send Your Wishes')
      const wishesDescription = getValue('description', 'Share your love and blessings for our new journey together')
      
      return (
        <div className={`${isMobile ? 'p-4' : 'p-12'}`}>
          <div className={`text-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <MessageCircle className={`mx-auto ${isMobile ? 'w-10 h-10 mb-3' : 'w-12 h-12 mb-4'}`} style={{ color: colorScheme.accent }} />
            <h2 
              className={`font-serif font-bold ${isMobile ? 'text-xl mb-1' : 'text-3xl mb-2'}`}
              style={{ color: colorScheme.primary }}
            >
              {wishesTitle}
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>{wishesDescription}</p>
          </div>
          <div className={`max-w-md mx-auto ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <input 
              type="text" 
              placeholder="Your Name" 
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            />
            <textarea 
              placeholder="Write your heartfelt wishes..." 
              rows={isMobile ? 3 : 4}
              className={`w-full border-2 border-gray-200 focus:outline-none focus:border-purple-400 transition-colors ${isMobile ? 'px-3 py-2.5 rounded-lg text-sm' : 'px-4 py-3 rounded-xl'}`}
              disabled
            />
            <button 
              className={`w-full text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${isMobile ? 'py-3 rounded-lg text-base' : 'py-4 rounded-xl text-lg'}`}
              style={{ backgroundColor: colorScheme.secondary }}
              disabled
            >
              <Heart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
          className={`${isMobile ? 'p-4' : 'p-12'} text-center`}
          style={{ background: `linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.secondary}15)` }}
        >
          <p className={`text-gray-600 italic ${isMobile ? 'mb-4 text-sm' : 'mb-8 text-base'}`}>{countdownMessage}</p>
          {/* Professional 4-in-a-row layout for both mobile and desktop */}
          <div className={`flex justify-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
            {[
              { value: days, label: 'Days' },
              { value: hours, label: 'Hrs' },
              { value: minutes, label: 'Min' },
              { value: seconds, label: 'Sec' }
            ].map((item) => (
              <div key={item.label} className="text-center flex-1" style={{ maxWidth: isMobile ? '72px' : '96px' }}>
                <div 
                  className={`${isMobile ? 'py-3 px-2 text-xl' : 'py-4 px-3 text-3xl'} rounded-xl flex items-center justify-center font-bold text-white shadow-lg`}
                  style={{ 
                    background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                    boxShadow: `0 4px 15px ${colorScheme.primary}40`,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <p className={`mt-1.5 font-medium uppercase tracking-wide ${isMobile ? 'text-[10px]' : 'text-xs'}`} style={{ color: colorScheme.primary }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'gift_registry':
      return (
        <div className={`${isMobile ? 'p-4' : 'p-12'}`}>
          <h2 
            className={`font-bold text-center ${isMobile ? 'text-xl mb-4' : 'text-3xl mb-6'}`}
            style={{ color: colorScheme.primary }}
          >
            Gift Registry
          </h2>
          <div className="flex justify-center gap-4">
            <Gift className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} style={{ color: colorScheme.primary }} />
          </div>
          <p className={`text-center text-gray-600 ${isMobile ? 'mt-3 text-sm' : 'mt-4 text-base'}`}>
            Your presence is the greatest gift. If you wish to give, please find our registry links here.
          </p>
        </div>
      )

    case 'footer':
      const footerMessage = getValue('message', 'Thank you for being part of our love story')
      const hashtag = getValue('hashtag', '')
      
      return (
        <div 
          className={`${isMobile ? 'p-6' : 'p-12'} text-center`}
          style={{ 
            background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
            color: 'white' 
          }}
        >
          <Heart className={`mx-auto opacity-80 ${isMobile ? 'w-6 h-6 mb-3' : 'w-8 h-8 mb-4'}`} />
          <p className={`font-serif italic ${isMobile ? 'text-base' : 'text-xl'}`}>{footerMessage}</p>
          {hashtag && (
            <p className={`text-white/70 font-medium ${isMobile ? 'mt-3 text-sm' : 'mt-4 text-base'}`}>{hashtag}</p>
          )}
          <div className={`border-t border-white/20 ${isMobile ? 'mt-4 pt-4' : 'mt-6 pt-6'}`}>
            <p className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>Made with love using Evento</p>
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
