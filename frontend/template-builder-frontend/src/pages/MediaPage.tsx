import React from 'react';
import { Header } from '../components/layout';
import { MediaLibrary } from '../components/media';

export const MediaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Media Library</h1>
        <MediaLibrary />
      </main>
    </div>
  );
};

export default MediaPage;
