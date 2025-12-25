import React, { useState, useRef, useEffect } from 'react';
import { TemplateComponent } from '../../types';
import { ComponentRenderer } from './ComponentRenderer';
import { useTemplateStore } from '../../stores/templateStore';
import { Move, X } from 'lucide-react';

interface DraggableComponentProps {
  component: TemplateComponent;
  isSelected: boolean;
  previewData?: Record<string, unknown>;
  onSelect: () => void;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  isSelected,
  previewData = {},
  onSelect,
}) => {
  const { updateComponent, removeComponent } = useTemplateStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - component.position.x,
      y: e.clientY - component.position.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: component.position.width,
      height: component.position.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragStart.x);
        const newY = Math.max(0, e.clientY - dragStart.y);
        
        updateComponent(component.id, {
          position: {
            ...component.position,
            x: newX,
            y: newY,
          },
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(30, resizeStart.height + deltaY);
        
        updateComponent(component.id, {
          position: {
            ...component.position,
            width: newWidth,
            height: newHeight,
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, component, updateComponent]);

  return (
    <div
      ref={componentRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.position.width,
        height: component.position.height,
        zIndex: component.zIndex,
        ...component.styles,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="absolute inset-0 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <ComponentRenderer component={component} previewData={previewData} />
      </div>

      {isSelected && (
        <>
          <div className="absolute -top-8 left-0 flex gap-1">
            <button
              className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              onMouseDown={handleMouseDown}
            >
              <Move size={14} />
            </button>
            <button
              className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                removeComponent(component.id);
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  );
};

export default DraggableComponent;
