import React, { useState, useEffect } from 'react';
import { useTemplateStore } from '../../stores/templateStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';

export const PreviewDataPanel: React.FC = () => {
  const { currentTemplate, previewData, setPreviewData } = useTemplateStore();
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const extractVariables = (): string[] => {
    if (!currentTemplate) return [];
    
    const variables = new Set<string>();
    
    currentTemplate.components.forEach((component) => {
      Object.values(component.props).forEach((value) => {
        if (typeof value === 'string') {
          const matches = value.match(/\{\{(\w+)\}\}/g);
          if (matches) {
            matches.forEach((match) => {
              const varName = match.replace(/\{\{|\}\}/g, '');
              variables.add(varName);
            });
          }
        }
      });
    });
    
    return Array.from(variables);
  };

  const variables = extractVariables();

  useEffect(() => {
    setJsonInput(JSON.stringify(previewData, null, 2));
  }, [previewData]);

  const handleFieldChange = (key: string, value: string) => {
    setPreviewData({
      ...previewData,
      [key]: value,
    });
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setPreviewData(parsed);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const handleAddField = () => {
    const newKey = `field${Object.keys(previewData).length + 1}`;
    setPreviewData({
      ...previewData,
      [newKey]: '',
    });
  };

  const handleRemoveField = (key: string) => {
    const newData = { ...previewData };
    delete newData[key];
    setPreviewData(newData);
  };

  if (!currentTemplate) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No template selected
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Preview Data</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setJsonMode(!jsonMode)}
          >
            {jsonMode ? 'Form View' : 'JSON View'}
          </Button>
        </div>

        {variables.length > 0 && (
          <div className="p-3 bg-blue-50 rounded text-sm">
            <p className="font-medium text-blue-800 mb-1">Detected Variables:</p>
            <p className="text-blue-600">{variables.join(', ')}</p>
          </div>
        )}

        {jsonMode ? (
          <div className="space-y-2">
            <Textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="font-mono text-sm min-h-[200px]"
              placeholder='{"key": "value"}'
            />
            {jsonError && (
              <p className="text-red-500 text-sm">{jsonError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {variables.map((variable) => (
              <div key={variable}>
                <Label className="text-xs">{`{{${variable}}}`}</Label>
                <Input
                  value={(previewData[variable] as string) || ''}
                  onChange={(e) => handleFieldChange(variable, e.target.value)}
                  placeholder={`Enter value for ${variable}`}
                />
              </div>
            ))}

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500 mb-2">Additional Fields:</p>
              {Object.entries(previewData)
                .filter(([key]) => !variables.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newData = { ...previewData };
                        delete newData[key];
                        newData[e.target.value] = value;
                        setPreviewData(newData);
                      }}
                      className="w-1/3"
                      placeholder="Key"
                    />
                    <Input
                      value={value as string}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="flex-1"
                      placeholder="Value"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(key)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddField}
                className="w-full"
              >
                <Plus size={14} className="mr-1" />
                Add Field
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PreviewDataPanel;
