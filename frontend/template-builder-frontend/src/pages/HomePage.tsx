import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LayoutTemplate,
  Image,
  Layers,
  Download,
  Palette,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: <LayoutTemplate className="h-8 w-8" />,
      title: 'Drag & Drop Builder',
      description: 'Create templates visually with our intuitive drag-and-drop interface.',
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Component Library',
      description: 'Choose from a variety of pre-built components like text, images, shapes, and more.',
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: 'Layer Management',
      description: 'Organize your design with powerful layer controls and z-index management.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Variable Interpolation',
      description: 'Use dynamic variables to personalize templates with custom data.',
    },
    {
      icon: <Image className="h-8 w-8" />,
      title: 'Media Library',
      description: 'Upload and manage images, logos, and backgrounds in one place.',
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: 'Export Options',
      description: 'Export your templates as PNG, HTML, or PDF for any use case.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Dynamic Template Builder
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create beautiful, customizable templates for invitations, certificates, cards, and more. 
              Design once, personalize infinitely.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/templates">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="lg">
                  View Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-blue-500 mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Create?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start building your first template in minutes.
            </p>
            <Link to="/templates">
              <Button size="lg" variant="secondary">
                Create Template
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Dynamic Template Builder - Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
