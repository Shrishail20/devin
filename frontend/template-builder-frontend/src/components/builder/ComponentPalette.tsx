import React, { useEffect } from 'react';
import { useTemplateStore } from '../../stores/templateStore';
import { ComponentSchema } from '../../types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Type,
  Heading,
  Image,
  Square,
  Minus,
  QrCode,
  Calendar,
  LayoutGrid,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  text: <Type size={18} />,
  heading: <Heading size={18} />,
  image: <Image size={18} />,
  container: <LayoutGrid size={18} />,
  divider: <Minus size={18} />,
  shape: <Square size={18} />,
  qrcode: <QrCode size={18} />,
  datetime: <Calendar size={18} />,
};

const categoryLabels: Record<string, string> = {
  content: 'Content',
  media: 'Media',
  layout: 'Layout',
  decorative: 'Decorative',
  custom: 'Custom',
};

export const ComponentPalette: React.FC = () => {
  const { componentSchemas, fetchComponentSchemas, addComponent, currentTemplate } = useTemplateStore();

  useEffect(() => {
    fetchComponentSchemas();
  }, [fetchComponentSchemas]);

  const groupedComponents = componentSchemas.reduce((acc, schema) => {
    const category = schema.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(schema);
    return acc;
  }, {} as Record<string, ComponentSchema[]>);

  const handleAddComponent = (schema: ComponentSchema) => {
    if (!currentTemplate) return;
    addComponent(schema);
  };

  if (!currentTemplate) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a template to add components
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <h3 className="font-semibold text-lg">Components</h3>
        
        {Object.entries(groupedComponents).map(([category, schemas]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {categoryLabels[category] || category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {schemas.map((schema) => (
                <Button
                  key={schema.type}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center justify-center h-20 p-2"
                  onClick={() => handleAddComponent(schema)}
                >
                  <span className="mb-1">
                    {iconMap[schema.type] || <Square size={18} />}
                  </span>
                  <span className="text-xs text-center">{schema.name}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ComponentPalette;
