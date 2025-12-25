export interface ComponentSchema {
  type: string;
  name: string;
  description: string;
  category: string;
  defaultProps: Record<string, unknown>;
  defaultStyles: Record<string, unknown>;
  defaultPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

export const componentSchemas: ComponentSchema[] = [
  {
    type: 'text',
    name: 'Text Block',
    description: 'A text element with customizable font, size, and color',
    category: 'content',
    defaultProps: {
      content: 'Enter text here',
      fontSize: 16,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      textAlign: 'left',
      color: '#000000'
    },
    defaultStyles: {
      padding: '8px'
    },
    defaultPosition: { x: 0, y: 0, width: 200, height: 50 },
    propsSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Text content (supports {{variables}})' },
        fontSize: { type: 'number', description: 'Font size in pixels', default: 16 },
        fontWeight: { type: 'string', description: 'Font weight', enum: ['normal', 'bold', 'lighter'], default: 'normal' },
        fontFamily: { type: 'string', description: 'Font family', default: 'Arial' },
        textAlign: { type: 'string', description: 'Text alignment', enum: ['left', 'center', 'right', 'justify'], default: 'left' },
        color: { type: 'string', description: 'Text color (hex)', default: '#000000' }
      },
      required: ['content']
    }
  },
  {
    type: 'heading',
    name: 'Heading',
    description: 'A heading element with configurable level',
    category: 'content',
    defaultProps: {
      content: 'Heading',
      level: 1,
      fontFamily: 'Arial',
      textAlign: 'left',
      color: '#000000'
    },
    defaultStyles: {
      padding: '8px'
    },
    defaultPosition: { x: 0, y: 0, width: 300, height: 60 },
    propsSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Heading text (supports {{variables}})' },
        level: { type: 'number', description: 'Heading level (1-6)', default: 1 },
        fontFamily: { type: 'string', description: 'Font family', default: 'Arial' },
        textAlign: { type: 'string', description: 'Text alignment', enum: ['left', 'center', 'right'], default: 'left' },
        color: { type: 'string', description: 'Text color (hex)', default: '#000000' }
      },
      required: ['content']
    }
  },
  {
    type: 'image',
    name: 'Image',
    description: 'An image element with aspect ratio controls',
    category: 'media',
    defaultProps: {
      src: '',
      alt: 'Image',
      objectFit: 'cover',
      borderRadius: 0
    },
    defaultStyles: {
      overflow: 'hidden'
    },
    defaultPosition: { x: 0, y: 0, width: 200, height: 200 },
    propsSchema: {
      type: 'object',
      properties: {
        src: { type: 'string', description: 'Image URL or {{variable}}' },
        alt: { type: 'string', description: 'Alt text', default: 'Image' },
        objectFit: { type: 'string', description: 'Object fit', enum: ['cover', 'contain', 'fill', 'none'], default: 'cover' },
        borderRadius: { type: 'number', description: 'Border radius in pixels', default: 0 }
      },
      required: ['src']
    }
  },
  {
    type: 'container',
    name: 'Container',
    description: 'A layout container with flex/grid options',
    category: 'layout',
    defaultProps: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: 'transparent'
    },
    defaultStyles: {
      padding: '16px'
    },
    defaultPosition: { x: 0, y: 0, width: 300, height: 200 },
    propsSchema: {
      type: 'object',
      properties: {
        display: { type: 'string', description: 'Display type', enum: ['flex', 'grid', 'block'], default: 'flex' },
        flexDirection: { type: 'string', description: 'Flex direction', enum: ['row', 'column', 'row-reverse', 'column-reverse'], default: 'column' },
        justifyContent: { type: 'string', description: 'Justify content', enum: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'], default: 'flex-start' },
        alignItems: { type: 'string', description: 'Align items', enum: ['flex-start', 'flex-end', 'center', 'stretch'], default: 'flex-start' },
        gap: { type: 'number', description: 'Gap between items in pixels', default: 8 },
        backgroundColor: { type: 'string', description: 'Background color', default: 'transparent' }
      }
    }
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'A horizontal or vertical divider line',
    category: 'decorative',
    defaultProps: {
      orientation: 'horizontal',
      thickness: 1,
      color: '#cccccc',
      style: 'solid'
    },
    defaultStyles: {},
    defaultPosition: { x: 0, y: 0, width: 200, height: 2 },
    propsSchema: {
      type: 'object',
      properties: {
        orientation: { type: 'string', description: 'Divider orientation', enum: ['horizontal', 'vertical'], default: 'horizontal' },
        thickness: { type: 'number', description: 'Line thickness in pixels', default: 1 },
        color: { type: 'string', description: 'Line color (hex)', default: '#cccccc' },
        style: { type: 'string', description: 'Line style', enum: ['solid', 'dashed', 'dotted'], default: 'solid' }
      }
    }
  },
  {
    type: 'shape',
    name: 'Shape',
    description: 'A decorative shape element',
    category: 'decorative',
    defaultProps: {
      shape: 'rectangle',
      backgroundColor: '#f0f0f0',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderRadius: 0
    },
    defaultStyles: {},
    defaultPosition: { x: 0, y: 0, width: 100, height: 100 },
    propsSchema: {
      type: 'object',
      properties: {
        shape: { type: 'string', description: 'Shape type', enum: ['rectangle', 'circle', 'ellipse'], default: 'rectangle' },
        backgroundColor: { type: 'string', description: 'Fill color', default: '#f0f0f0' },
        borderColor: { type: 'string', description: 'Border color', default: '#cccccc' },
        borderWidth: { type: 'number', description: 'Border width in pixels', default: 1 },
        borderRadius: { type: 'number', description: 'Border radius in pixels', default: 0 }
      }
    }
  },
  {
    type: 'qrcode',
    name: 'QR Code',
    description: 'A QR code generator component',
    category: 'custom',
    defaultProps: {
      value: 'https://example.com',
      size: 128,
      fgColor: '#000000',
      bgColor: '#ffffff'
    },
    defaultStyles: {},
    defaultPosition: { x: 0, y: 0, width: 150, height: 150 },
    propsSchema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'QR code content (supports {{variables}})' },
        size: { type: 'number', description: 'QR code size in pixels', default: 128 },
        fgColor: { type: 'string', description: 'Foreground color', default: '#000000' },
        bgColor: { type: 'string', description: 'Background color', default: '#ffffff' }
      },
      required: ['value']
    }
  },
  {
    type: 'datetime',
    name: 'Date/Time Display',
    description: 'A date and time display component',
    category: 'custom',
    defaultProps: {
      value: '',
      format: 'MMMM DD, YYYY',
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000'
    },
    defaultStyles: {
      padding: '8px'
    },
    defaultPosition: { x: 0, y: 0, width: 200, height: 40 },
    propsSchema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Date value (supports {{variables}})' },
        format: { type: 'string', description: 'Date format string', default: 'MMMM DD, YYYY' },
        fontSize: { type: 'number', description: 'Font size in pixels', default: 16 },
        fontFamily: { type: 'string', description: 'Font family', default: 'Arial' },
        color: { type: 'string', description: 'Text color', default: '#000000' }
      },
      required: ['value']
    }
  }
];

export const getComponentSchema = (type: string): ComponentSchema | undefined => {
  return componentSchemas.find(schema => schema.type === type);
};

export const getComponentsByCategory = (category: string): ComponentSchema[] => {
  return componentSchemas.filter(schema => schema.category === category);
};
