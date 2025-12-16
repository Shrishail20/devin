import mongoose, { Document, Schema } from 'mongoose';

export interface IComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  position: IComponentPosition;
  styles: Record<string, unknown>;
  variables: string[];
  zIndex: number;
}

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  tags: string[];
  components: IComponent[];
  dataSchema: Record<string, unknown>;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentPositionSchema = new Schema<IComponentPosition>({
  x: { type: Number, required: true, default: 0 },
  y: { type: Number, required: true, default: 0 },
  width: { type: Number, required: true, default: 200 },
  height: { type: Number, required: true, default: 100 }
}, { _id: false });

const ComponentSchema = new Schema<IComponent>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  props: { type: Schema.Types.Mixed, default: {} },
  position: { type: ComponentPositionSchema, required: true },
  styles: { type: Schema.Types.Mixed, default: {} },
  variables: [{ type: String }],
  zIndex: { type: Number, default: 0 }
}, { _id: false });

const TemplateSchema = new Schema<ITemplate>({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'general' },
  tags: [{ type: String }],
  components: [ComponentSchema],
  dataSchema: { type: Schema.Types.Mixed, default: {} },
  thumbnail: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  version: { type: Number, default: 1 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' }
}, {
  timestamps: true
});

TemplateSchema.index({ name: 'text', description: 'text', tags: 'text' });
TemplateSchema.index({ status: 1 });
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ createdAt: -1 });

export default mongoose.model<ITemplate>('Template', TemplateSchema);
