import mongoose, { Document, Schema } from 'mongoose';

// Color scheme option
export interface IColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
}

// Font pair option
export interface IFontPair {
  id: string;
  name: string;
  heading: string;
  body: string;
  headingWeight: number;
  bodyWeight: number;
}

// Template Version - Allows template updates without breaking existing user sites
export interface ITemplateVersion extends Document {
  templateId: mongoose.Types.ObjectId;
  version: number;
  colorSchemes: IColorScheme[];
  fontPairs: IFontPair[];
  defaultColorScheme: string;
  defaultFontPair: string;
  changelog: string;
  createdAt: Date;
}

const ColorSchemeSchema = new Schema<IColorScheme>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  primary: { type: String, required: true },
  secondary: { type: String, required: true },
  background: { type: String, required: true, default: '#FFFFFF' },
  surface: { type: String, required: true, default: '#FAFAFA' },
  text: { type: String, required: true, default: '#212121' },
  textMuted: { type: String, required: true, default: '#757575' },
  accent: { type: String, required: true }
}, { _id: false });

const FontPairSchema = new Schema<IFontPair>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  heading: { type: String, required: true },
  body: { type: String, required: true },
  headingWeight: { type: Number, default: 700 },
  bodyWeight: { type: Number, default: 400 }
}, { _id: false });

const TemplateVersionSchema = new Schema<ITemplateVersion>({
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  version: { type: Number, required: true },
  colorSchemes: [ColorSchemeSchema],
  fontPairs: [FontPairSchema],
  defaultColorScheme: { type: String, default: '' },
  defaultFontPair: { type: String, default: '' },
  changelog: { type: String, default: '' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
TemplateVersionSchema.index({ templateId: 1, version: 1 }, { unique: true });
TemplateVersionSchema.index({ templateId: 1 });

export default mongoose.model<ITemplateVersion>('TemplateVersion', TemplateVersionSchema);
