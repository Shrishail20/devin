import React from 'react';
import { useTemplateStore } from '../../stores/templateStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react';

export const LayerPanel: React.FC = () => {
  const {
    currentTemplate,
    selectedComponentId,
    selectComponent,
    updateComponent,
    removeComponent,
  } = useTemplateStore();

  if (!currentTemplate) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No template selected
      </div>
    );
  }

  const sortedComponents = [...currentTemplate.components].sort(
    (a, b) => b.zIndex - a.zIndex
  );

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const component = sortedComponents[index];
    const targetComponent = sortedComponents[index - 1];
    
    updateComponent(component.id, { zIndex: targetComponent.zIndex });
    updateComponent(targetComponent.id, { zIndex: component.zIndex });
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedComponents.length - 1) return;
    const component = sortedComponents[index];
    const targetComponent = sortedComponents[index + 1];
    
    updateComponent(component.id, { zIndex: targetComponent.zIndex });
    updateComponent(targetComponent.id, { zIndex: component.zIndex });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-lg">Layers</h3>
        
        {sortedComponents.length === 0 ? (
          <p className="text-sm text-gray-500">No components added yet</p>
        ) : (
          <div className="space-y-2">
            {sortedComponents.map((component, index) => (
              <div
                key={component.id}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  selectedComponentId === component.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectComponent(component.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate capitalize">
                    {component.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    z: {component.zIndex}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(index);
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(index);
                    }}
                    disabled={index === sortedComponents.length - 1}
                  >
                    <ChevronDown size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(component.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default LayerPanel;
