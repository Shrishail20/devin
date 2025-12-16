export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface FieldDefinition {
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'time' | 'datetime' | 'number' | 'image' | 'gallery' | 'location' | 'select' | 'boolean' | 'url' | 'email' | 'phone'
  required: boolean
  placeholder?: string
  defaultValue?: unknown
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

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

export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface FontPair {
  id: string
  name: string
  heading: string
  body: string
}

export interface PreviewData {
  id: string
  name: string
  data: Record<string, Record<string, unknown>>
}

export interface Template {
  _id: string
  name: string
  slug: string
  description: string
  category: string
  thumbnail?: string
  sections: SectionDefinition[]
  colorSchemes: ColorScheme[]
  fontPairs: FontPair[]
  previewDataSets: PreviewData[]
  status: 'draft' | 'published' | 'archived'
  version: number
  usageCount: number
  createdAt: string
  updatedAt: string
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
  authorName: string
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
