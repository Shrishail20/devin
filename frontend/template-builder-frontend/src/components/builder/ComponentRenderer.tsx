import React from 'react';
import { TemplateComponent } from '../../types';
import {
  TextComponent,
  HeadingComponent,
  ImageComponent,
  ContainerComponent,
  DividerComponent,
  ShapeComponent,
  QRCodeComponent,
  DateTimeComponent,
} from '../template';

interface ComponentRendererProps {
  component: TemplateComponent;
  previewData?: Record<string, unknown>;
}

const interpolateValue = (value: unknown, data: Record<string, unknown>): unknown => {
  if (typeof value !== 'string') return value;
  
  return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const replacement = data[key];
    if (replacement !== undefined && replacement !== null) {
      return String(replacement);
    }
    return match;
  });
};

const interpolateProps = (
  props: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> => {
  const interpolated: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(props)) {
    interpolated[key] = interpolateValue(value, data);
  }
  
  return interpolated;
};

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  previewData = {},
}) => {
  const props = interpolateProps(component.props, previewData);

  switch (component.type) {
    case 'text':
      return (
        <TextComponent
          content={props.content as string}
          fontSize={props.fontSize as number}
          fontWeight={props.fontWeight as string}
          fontFamily={props.fontFamily as string}
          textAlign={props.textAlign as 'left' | 'center' | 'right' | 'justify'}
          color={props.color as string}
        />
      );

    case 'heading':
      return (
        <HeadingComponent
          content={props.content as string}
          level={props.level as 1 | 2 | 3 | 4 | 5 | 6}
          fontFamily={props.fontFamily as string}
          textAlign={props.textAlign as 'left' | 'center' | 'right'}
          color={props.color as string}
        />
      );

    case 'image':
      return (
        <ImageComponent
          src={props.src as string}
          alt={props.alt as string}
          objectFit={props.objectFit as 'cover' | 'contain' | 'fill' | 'none'}
          borderRadius={props.borderRadius as number}
        />
      );

    case 'container':
      return (
        <ContainerComponent
          display={props.display as 'flex' | 'grid' | 'block'}
          flexDirection={props.flexDirection as 'row' | 'column' | 'row-reverse' | 'column-reverse'}
          justifyContent={props.justifyContent as 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'}
          alignItems={props.alignItems as 'flex-start' | 'flex-end' | 'center' | 'stretch'}
          gap={props.gap as number}
          backgroundColor={props.backgroundColor as string}
        />
      );

    case 'divider':
      return (
        <DividerComponent
          orientation={props.orientation as 'horizontal' | 'vertical'}
          thickness={props.thickness as number}
          color={props.color as string}
          style={props.style as 'solid' | 'dashed' | 'dotted'}
        />
      );

    case 'shape':
      return (
        <ShapeComponent
          shape={props.shape as 'rectangle' | 'circle' | 'ellipse'}
          backgroundColor={props.backgroundColor as string}
          borderColor={props.borderColor as string}
          borderWidth={props.borderWidth as number}
          borderRadius={props.borderRadius as number}
        />
      );

    case 'qrcode':
      return (
        <QRCodeComponent
          value={props.value as string}
          size={props.size as number}
          fgColor={props.fgColor as string}
          bgColor={props.bgColor as string}
        />
      );

    case 'datetime':
      return (
        <DateTimeComponent
          value={props.value as string}
          formatStr={props.format as string}
          fontSize={props.fontSize as number}
          fontFamily={props.fontFamily as string}
          color={props.color as string}
        />
      );

    default:
      return (
        <div className="p-2 bg-gray-100 text-gray-500 text-sm">
          Unknown component: {component.type}
        </div>
      );
  }
};

export default ComponentRenderer;
