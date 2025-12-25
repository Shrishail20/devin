import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplateStore } from '../stores/templateStore';
import { Header } from '../components/layout';
import { Canvas, ComponentPalette, PropertyPanel, LayerPanel, PreviewDataPanel } from '../components/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export const BuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTemplate,
    isLoading,
    fetchTemplate,
    updateTemplate,
    setCurrentTemplate,
  } = useTemplateStore();

  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    if (id) {
      fetchTemplate(id);
    }
    return () => {
      setCurrentTemplate(null);
    };
  }, [id, fetchTemplate, setCurrentTemplate]);

  useEffect(() => {
    if (currentTemplate) {
      setTemplateName(currentTemplate.name);
    }
  }, [currentTemplate]);

  const handleSave = async () => {
    if (!currentTemplate || !id) return;

    setIsSaving(true);
    try {
      await updateTemplate(id, {
        name: templateName,
        components: currentTemplate.components,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (id) {
      navigate(`/preview/${id}`);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/templates')}>
            <ArrowLeft size={18} className="mr-1" />
            Back
          </Button>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-64 font-medium"
          />
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
          
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye size={16} className="mr-1" />
            Preview
          </Button>
          
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 size={16} className="mr-1 animate-spin" />
            ) : (
              <Save size={16} className="mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r bg-white">
              <Tabs defaultValue="components" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b">
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="layers">Layers</TabsTrigger>
                </TabsList>
                <TabsContent value="components" className="flex-1 m-0 overflow-hidden">
                  <ComponentPalette />
                </TabsContent>
                <TabsContent value="layers" className="flex-1 m-0 overflow-hidden">
                  <LayerPanel />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={55}>
            <Canvas previewMode={previewMode} />
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full border-l bg-white">
              <Tabs defaultValue="properties" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b">
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="data">Preview Data</TabsTrigger>
                </TabsList>
                <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
                  <PropertyPanel />
                </TabsContent>
                <TabsContent value="data" className="flex-1 m-0 overflow-hidden">
                  <PreviewDataPanel />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default BuilderPage;
