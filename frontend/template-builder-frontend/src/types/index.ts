export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TemplateComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  position: ComponentPosition;
  styles: Record<string, unknown>;
  variables: string[];
  zIndex: number;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  components: TemplateComponent[];
  dataSchema: Record<string, unknown>;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplateInstance {
  _id: string;
  templateId: string;
  data: Record<string, unknown>;
  renderedOutput: string;
  status: 'pending' | 'rendered' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  gridFSId: string;
  uploadedBy?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ComponentSchema {
  type: string;
  name: string;
  description: string;
  category: string;
  defaultProps: Record<string, unknown>;
  defaultStyles: Record<string, unknown>;
  defaultPosition: ComponentPosition;
  propsSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      default?: unknown;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
