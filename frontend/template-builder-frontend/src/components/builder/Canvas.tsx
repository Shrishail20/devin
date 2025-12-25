import React from 'react';
import { useTemplateStore } from '../../stores/templateStore';
import { DraggableComponent } from './DraggableComponent';

interface CanvasProps {
  width?: number;
  height?: number;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

const previewSizes = {
  desktop: { width: 800, height: 600 },
  tablet: { width: 600, height: 800 },
  mobile: { width: 375, height: 667 },
};

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  previewMode = 'desktop',
}) => {
  const { currentTemplate, selectedComponentId, selectComponent, previewData } = useTemplateStore();

  const size = previewSizes[previewMode];
  const canvasWidth = width || size.width;
  const canvasHeight = height || size.height;

  const handleCanvasClick = () => {
    selectComponent(null);
  };

  if (!currentTemplate) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        No template selected. Create or select a template to start editing.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 bg-gray-200 min-h-full overflow-auto">
      <div
        className="relative bg-white shadow-lg"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: canvasWidth,
          minHeight: canvasHeight,
        }}
        onClick={handleCanvasClick}
      >
        {currentTemplate.components
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((component) => (
            <DraggableComponent
              key={component.id}
              component={component}
              isSelected={selectedComponentId === component.id}
              previewData={previewData}
              onSelect={() => selectComponent(component.id)}
            />
          ))}
      </div>
    </div>
  );
};

export default Canvas;
