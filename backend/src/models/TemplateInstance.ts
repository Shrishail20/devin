import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplateInstance extends Document {
  templateId: mongoose.Types.ObjectId;
  data: Record<string, unknown>;
  renderedOutput: string;
  status: 'pending' | 'rendered' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

const TemplateInstanceSchema = new Schema<ITemplateInstance>({
  templateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Template', 
    required: true 
  },
  data: { type: Schema.Types.Mixed, required: true },
  renderedOutput: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'rendered', 'error'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

TemplateInstanceSchema.index({ templateId: 1 });
TemplateInstanceSchema.index({ createdAt: -1 });

export default mongoose.model<ITemplateInstance>('TemplateInstance', TemplateInstanceSchema);
