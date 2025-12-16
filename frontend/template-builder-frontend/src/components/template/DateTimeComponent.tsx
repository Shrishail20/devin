import React from 'react';
import { format, parseISO, isValid } from 'date-fns';

interface DateTimeComponentProps {
  value: string;
  formatStr?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export const DateTimeComponent: React.FC<DateTimeComponentProps> = ({
  value,
  formatStr = 'MMMM dd, yyyy',
  fontSize = 16,
  fontFamily = 'Arial',
  color = '#000000',
}) => {
  const formatDate = (dateValue: string): string => {
    if (!dateValue) return 'No date';
    
    try {
      const date = parseISO(dateValue);
      if (!isValid(date)) {
        const directDate = new Date(dateValue);
        if (isValid(directDate)) {
          return format(directDate, formatStr);
        }
        return dateValue;
      }
      return format(date, formatStr);
    } catch {
      return dateValue;
    }
  };

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        fontFamily,
        color,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {formatDate(value)}
    </div>
  );
};

export default DateTimeComponent;
