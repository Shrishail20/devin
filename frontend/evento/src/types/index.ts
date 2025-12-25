export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

// Field definition within a section
export interface FieldDefinition {
  fieldId: string
  key: string
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'datetime' | 'time' | 'image' | 'gallery' | 'video' | 'url' | 'email' | 'phone' | 'location' | 'select' | 'multiselect' | 'boolean' | 'color' | 'repeater'
  label: string
  placeholder?: string
  helpText?: string
  defaultValue?: unknown
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
  options?: Array<{ value: string; label: string }>
  fields?: FieldDefinition[] // For repeater type
}

// Color scheme option
export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textMuted: string
  accent: string
}

// Font pair option
export interface FontPair {
  id: string
  name: string
  heading: string
  body: string
  headingWeight?: number
  bodyWeight?: number
}

// Sample profile option (for multiple preview data sets)
export interface SampleProfile {
  id: string
  name: string
  description?: string
}

// Template Version
export interface TemplateVersion {
  _id: string
  templateId: string
  version: number
  colorSchemes: ColorScheme[]
  fontPairs: FontPair[]
  sampleProfiles: SampleProfile[]
  defaultColorScheme: string
  defaultFontPair: string
  defaultSampleProfile: string
  changelog: string
  createdAt: string
}

// Sample data set for a specific profile
export interface SampleDataSet {
  profileId: string
  values: Record<string, unknown>
}

// Template Section (separate collection)
export interface TemplateSection {
  _id: string
  versionId: string
  sectionId: string
  type: 'hero' | 'event_details' | 'countdown' | 'gallery' | 'story' | 'timeline' | 'venue' | 'rsvp' | 'wishes' | 'gift_registry' | 'contact' | 'footer' | 'custom'
  name: string
  description: string
  order: number
  isRequired: boolean
  canDisable: boolean
  fields: FieldDefinition[]
  sampleValues: Record<string, unknown>
  sampleDataSets?: SampleDataSet[]
  createdAt: string
  updatedAt: string
}

// Template (master blueprint)
export interface Template {
  _id: string
  slug: string
  name: string
  description: string
  category: 'wedding' | 'birthday' | 'anniversary' | 'corporate' | 'baby_shower' | 'engagement' | 'graduation' | 'other'
  thumbnail: string
  currentVersion: number
  isActive: boolean
  isPremium: boolean
  usageCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Template with version and sections (for API responses)
export interface TemplateWithDetails extends Template {
  version?: TemplateVersion
  sections?: TemplateSection[]
}

// Microsite Section (user's content per section)
export interface MicrositeSection {
  _id: string
  micrositeId: string
  sectionId: string
  type: string
  order: number
  enabled: boolean
  values: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Microsite (user's event site)
export interface Microsite {
  _id: string
  userId: string
  templateId: string | Template
  versionId: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  colorScheme: string
  fontPair: string
  settings: {
    enableRsvp: boolean
    enableWishes: boolean
    requireWishApproval: boolean
    rsvpDeadline?: string
    eventDate?: string
    eventEndDate?: string
    timezone: string
  }
  viewCount: number
  uniqueViewCount: number
  lastViewedAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// Microsite with sections (for API responses)
export interface MicrositeWithDetails extends Microsite {
  version?: TemplateVersion
  templateSections?: TemplateSection[]
  sections?: MicrositeSection[]
}

// Legacy types for backward compatibility
export interface SectionDefinition {
  id: string
  type: 'hero' | 'event_details' | 'countdown' | 'gallery' | 'story' | 'venue' | 'rsvp' | 'wishes' | 'gift_registry' | 'contact' | 'footer' | 'custom'
  name: string
  order: number
  isRequired: boolean
  isLocked: boolean
  defaultVisible: boolean
  fields: FieldDefinition[]
}

export interface PreviewData {
  id: string
  name: string
  data: Record<string, Record<string, unknown>>
}

export interface SectionContent {
  sectionId: string
  visible: boolean
  order: number
  content: Record<string, unknown>
}

export interface Site {
  _id: string
  userId: string
  templateId: string | Template
  templateVersion: number
  title: string
  slug: string
  description: string
  status: 'draft' | 'published'
  sections: SectionContent[]
  selectedColorScheme: string
  selectedFontPair: string
  settings: {
    enableRsvp: boolean
    enableWishes: boolean
    requireWishApproval: boolean
    maxHighlightedWishes: number
    rsvpDeadline?: string
    eventDate?: string
    eventEndDate?: string
    timezone?: string
  }
  stats: {
    views: number
    uniqueVisitors: number
    rsvpCount: number
    wishCount: number
  }
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Guest {
  _id: string
  siteId: string
  name: string
  email: string
  phone?: string
  status: 'pending' | 'attending' | 'not_attending' | 'maybe'
  numberOfGuests: number
  partySize?: number
  dietaryNotes?: string
  message?: string
  customFields?: Record<string, unknown>
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Wish {
  _id: string
  siteId: string
  authorName?: string
  name?: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  isHighlighted: boolean
  createdAt: string
  updatedAt: string
}

export interface SiteStats {
  views: number
  uniqueVisitors: number
  rsvp: {
    total: number
    attending: number
    notAttending: number
    maybe: number
    pending: number
    totalGuests: number
  }
  wishes: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export interface MicrositeStats {
  views: number
  uniqueViews: number
  guests: {
    total: number
    attending: number
    pending: number
  }
  wishes: {
    total: number
    approved: number
    pending: number
  }
}
