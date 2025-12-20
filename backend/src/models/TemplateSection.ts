import mongoose, { Document, Schema } from 'mongoose';

// Field definition within a section
export interface IFieldDefinition {
  fieldId: string;
  key: string;
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'datetime' | 'time' | 'image' | 'gallery' | 'video' | 'url' | 'email' | 'phone' | 'location' | 'select' | 'multiselect' | 'boolean' | 'color' | 'repeater';
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: Array<{ value: string; label: string }>;
  fields?: IFieldDefinition[]; // For repeater type
}

// Section types
export type SectionType = 'hero' | 'event_details' | 'countdown' | 'gallery' | 'story' | 'timeline' | 'venue' | 'rsvp' | 'wishes' | 'gift_registry' | 'contact' | 'footer' | 'custom';

// Template Section - Defines sections included in a template version
export interface ITemplateSection extends Document {
  versionId: mongoose.Types.ObjectId;
  sectionId: string;
  type: SectionType;
  name: string;
  description: string;
  order: number;
  isRequired: boolean;
  canDisable: boolean;
  fields: IFieldDefinition[];
  sampleValues: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const FieldDefinitionSchema = new Schema<IFieldDefinition>({
  fieldId: { type: String, required: true },
  key: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'textarea', 'richtext', 'number', 'date', 'datetime', 'time', 'image', 'gallery', 'video', 'url', 'email', 'phone', 'location', 'select', 'multiselect', 'boolean', 'color', 'repeater'],
    required: true 
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  helpText: { type: String },
  defaultValue: { type: Schema.Types.Mixed },
  validation: {
    required: { type: Boolean },
    minLength: { type: Number },
    maxLength: { type: Number },
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String }
  },
  options: [{ 
    value: { type: String },
    label: { type: String }
  }],
  fields: { type: [Schema.Types.Mixed] } // For repeater type (nested fields)
}, { _id: false });

const TemplateSectionSchema = new Schema<ITemplateSection>({
  versionId: { type: Schema.Types.ObjectId, ref: 'TemplateVersion', required: true },
  sectionId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['hero', 'event_details', 'countdown', 'gallery', 'story', 'timeline', 'venue', 'rsvp', 'wishes', 'gift_registry', 'contact', 'footer', 'custom'],
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: false },
  canDisable: { type: Boolean, default: true },
  fields: [FieldDefinitionSchema],
  sampleValues: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes
TemplateSectionSchema.index({ versionId: 1, order: 1 });
TemplateSectionSchema.index({ versionId: 1, sectionId: 1 }, { unique: true });

export default mongoose.model<ITemplateSection>('TemplateSection', TemplateSectionSchema);
