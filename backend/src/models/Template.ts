import mongoose, { Document, Schema } from 'mongoose';

// Field definition within a section
export interface IFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'time' | 'datetime' | 'number' | 'image' | 'gallery' | 'location' | 'select' | 'boolean' | 'url' | 'email' | 'phone';
  required: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Section definition within a template
export interface ISectionDefinition {
  id: string;
  type: 'hero' | 'event_details' | 'countdown' | 'gallery' | 'story' | 'venue' | 'rsvp' | 'wishes' | 'gift_registry' | 'contact' | 'footer' | 'custom';
  name: string;
  order: number;
  isRequired: boolean;
  isLocked: boolean;
  defaultVisible: boolean;
  fields: IFieldDefinition[];
}

// Color scheme option
export interface IColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// Font pair option
export interface IFontPair {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
}

// Preview data for template
export interface IPreviewData {
  name: string;
  data: Record<string, Record<string, unknown>>;
}

export interface ITemplate extends Document {
  name: string;
  slug: string;
  description: string;
  category: 'wedding' | 'birthday' | 'corporate' | 'baby_shower' | 'anniversary' | 'other';
  thumbnail: string;
  previewImages: string[];
  sections: ISectionDefinition[];
  colorSchemes: IColorScheme[];
  fontPairs: IFontPair[];
  previewDataSets: IPreviewData[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FieldDefinitionSchema = new Schema<IFieldDefinition>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'textarea', 'date', 'time', 'datetime', 'number', 'image', 'gallery', 'location', 'select', 'boolean', 'url', 'email', 'phone'],
    required: true 
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  defaultValue: { type: Schema.Types.Mixed },
  options: [{ type: String }],
  validation: {
    minLength: { type: Number },
    maxLength: { type: Number },
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String }
  }
}, { _id: false });

const SectionDefinitionSchema = new Schema<ISectionDefinition>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['hero', 'event_details', 'countdown', 'gallery', 'story', 'venue', 'rsvp', 'wishes', 'gift_registry', 'contact', 'footer', 'custom'],
    required: true 
  },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  defaultVisible: { type: Boolean, default: true },
  fields: [FieldDefinitionSchema]
}, { _id: false });

const ColorSchemeSchema = new Schema<IColorScheme>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  primary: { type: String, required: true },
  secondary: { type: String, required: true },
  accent: { type: String, required: true },
  background: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const FontPairSchema = new Schema<IFontPair>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  headingFont: { type: String, required: true },
  bodyFont: { type: String, required: true }
}, { _id: false });

const PreviewDataSchema = new Schema<IPreviewData>({
  name: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const TemplateSchema = new Schema<ITemplate>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['wedding', 'birthday', 'corporate', 'baby_shower', 'anniversary', 'other'],
    default: 'other' 
  },
  thumbnail: { type: String, default: '' },
  previewImages: [{ type: String }],
  sections: [SectionDefinitionSchema],
  colorSchemes: [ColorSchemeSchema],
  fontPairs: [FontPairSchema],
  previewDataSets: [PreviewDataSchema],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  version: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' }
}, {
  timestamps: true
});

TemplateSchema.index({ name: 'text', description: 'text' });
TemplateSchema.index({ slug: 1 }, { unique: true });
TemplateSchema.index({ status: 1 });
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ createdAt: -1 });

export default mongoose.model<ITemplate>('Template', TemplateSchema);
