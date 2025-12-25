import React from 'react';
import { useTemplateStore } from '../../stores/templateStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export const PropertyPanel: React.FC = () => {
  const { currentTemplate, selectedComponentId, updateComponent, componentSchemas } = useTemplateStore();

  const selectedComponent = currentTemplate?.components.find(
    (c) => c.id === selectedComponentId
  );

  const componentSchema = componentSchemas.find(
    (s) => s.type === selectedComponent?.type
  );

  if (!selectedComponent) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a component to edit its properties
      </div>
    );
  }

  const handlePropChange = (key: string, value: unknown) => {
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [key]: value,
      },
    });
  };

  const handlePositionChange = (key: string, value: number) => {
    updateComponent(selectedComponent.id, {
      position: {
        ...selectedComponent.position,
        [key]: value,
      },
    });
  };

  const renderPropertyInput = (
    key: string,
    schema: { type: string; description: string; enum?: string[]; default?: unknown }
  ) => {
    const value = selectedComponent.props[key] ?? schema.default;

    if (schema.enum) {
      return (
        <Select
          value={String(value)}
          onValueChange={(v) => handlePropChange(key, v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {schema.enum.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (schema.type === 'number') {
      return (
        <Input
          type="number"
          value={value as number}
          onChange={(e) => handlePropChange(key, Number(e.target.value))}
        />
      );
    }

    if (schema.type === 'string' && key.toLowerCase().includes('color')) {
      return (
        <div className="flex gap-2">
          <Input
            type="color"
            value={value as string}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="w-12 h-10 p-1"
          />
          <Input
            type="text"
            value={value as string}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="flex-1"
          />
        </div>
      );
    }

    return (
      <Input
        type="text"
        value={value as string}
        onChange={(e) => handlePropChange(key, e.target.value)}
      />
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Properties</h3>
          <p className="text-sm text-gray-500 mb-4">
            Component: {componentSchema?.name || selectedComponent.type}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Position & Size
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={selectedComponent.position.x}
                onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={selectedComponent.position.y}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={selectedComponent.position.width}
                onChange={(e) => handlePositionChange('width', Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={selectedComponent.position.height}
                onChange={(e) => handlePositionChange('height', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Z-Index</Label>
            <Input
              type="number"
              value={selectedComponent.zIndex}
              onChange={(e) =>
                updateComponent(selectedComponent.id, { zIndex: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {componentSchema && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Component Properties
            </h4>
            {Object.entries(componentSchema.propsSchema.properties).map(([key, schema]) => (
              <div key={key}>
                <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                <p className="text-xs text-gray-400 mb-1">{schema.description}</p>
                {renderPropertyInput(key, schema)}
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PropertyPanel;
