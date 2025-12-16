import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplateStore } from '../stores/templateStore';
import { Header } from '../components/layout';
import { ComponentRenderer } from '../components/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  FileImage,
  Code,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const previewSizes = {
  desktop: { width: 800, height: 600 },
  tablet: { width: 600, height: 800 },
  mobile: { width: 375, height: 667 },
};

export const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTemplate,
    isLoading,
    fetchTemplate,
    previewData,
    setPreviewData,
  } = useTemplateStore();

  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchTemplate(id);
    }
  }, [id, fetchTemplate]);

  useEffect(() => {
    setJsonInput(JSON.stringify(previewData, null, 2));
  }, [previewData]);

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

  const handleExportPNG = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${currentTemplate?.name || 'template'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHTML = () => {
    if (!currentTemplate) return;

    const size = previewSizes[previewMode];
    let componentsHTML = '';

    currentTemplate.components.forEach((component) => {
      const style = `
        position: absolute;
        left: ${component.position.x}px;
        top: ${component.position.y}px;
        width: ${component.position.width}px;
        height: ${component.position.height}px;
        z-index: ${component.zIndex};
      `;

      const props = component.props;
      
      switch (component.type) {
        case 'text':
          componentsHTML += `<div style="${style}; font-size: ${props.fontSize || 16}px; color: ${props.color || '#000'}; font-family: ${props.fontFamily || 'Arial'}; text-align: ${props.textAlign || 'left'}">${interpolate(props.content as string)}</div>`;
          break;
        case 'heading':
          const level = props.level || 1;
          componentsHTML += `<h${level} style="${style}; color: ${props.color || '#000'}; font-family: ${props.fontFamily || 'Arial'}; text-align: ${props.textAlign || 'left'}">${interpolate(props.content as string)}</h${level}>`;
          break;
        case 'image':
          componentsHTML += `<img src="${interpolate(props.src as string)}" alt="${props.alt || ''}" style="${style}; object-fit: ${props.objectFit || 'cover'}; border-radius: ${props.borderRadius || 0}px" />`;
          break;
        default:
          componentsHTML += `<div style="${style}">${component.type}</div>`;
      }
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentTemplate.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; }
    .template-container { position: relative; width: ${size.width}px; height: ${size.height}px; margin: 0 auto; background: white; }
  </style>
</head>
<body>
  <div class="template-container">
    ${componentsHTML}
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = `${currentTemplate.name || 'template'}.html`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const interpolate = (text: string): string => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = previewData[key];
      return value !== undefined ? String(value) : match;
    });
  };

  if (isLoading || !currentTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  const size = previewSizes[previewMode];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/builder/${id}`)}>
            <ArrowLeft size={18} className="mr-1" />
            Back to Editor
          </Button>
          <h1 className="font-medium">{currentTemplate.name} - Preview</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor size={16} />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet size={16} />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone size={16} />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExportPNG} disabled={isExporting}>
            {isExporting ? (
              <Loader2 size={16} className="mr-1 animate-spin" />
            ) : (
              <FileImage size={16} className="mr-1" />
            )}
            Export PNG
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportHTML}>
            <Code size={16} className="mr-1" />
            Export HTML
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center overflow-auto bg-gray-100 p-8">
                <div
                  ref={previewRef}
                  className="relative bg-white shadow-lg"
                  style={{
                    width: size.width,
                    height: size.height,
                    minWidth: size.width,
                    minHeight: size.height,
                  }}
                >
                  {currentTemplate.components
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((component) => (
                      <div
                        key={component.id}
                        style={{
                          position: 'absolute',
                          left: component.position.x,
                          top: component.position.y,
                          width: component.position.width,
                          height: component.position.height,
                          zIndex: component.zIndex,
                          ...component.styles,
                        }}
                      >
                        <ComponentRenderer
                          component={component}
                          previewData={previewData}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="form">
                  <TabsList className="w-full">
                    <TabsTrigger value="form" className="flex-1">Form</TabsTrigger>
                    <TabsTrigger value="json" className="flex-1">JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="form" className="space-y-4 mt-4">
                    {Object.keys(previewData).length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No variables detected. Add variables like {'{{variableName}}'} to your components.
                      </p>
                    ) : (
                      Object.entries(previewData).map(([key, value]) => (
                        <div key={key}>
                          <Label className="text-xs">{key}</Label>
                          <Input
                            value={value as string}
                            onChange={(e) =>
                              setPreviewData({ ...previewData, [key]: e.target.value })
                            }
                          />
                        </div>
                      ))
                    )}
                  </TabsContent>
                  <TabsContent value="json" className="mt-4">
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className="font-mono text-sm min-h-[200px]"
                      placeholder='{"key": "value"}'
                    />
                    {jsonError && (
                      <p className="text-red-500 text-sm mt-2">{jsonError}</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
