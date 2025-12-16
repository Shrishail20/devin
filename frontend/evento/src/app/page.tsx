'use client'

import Link from 'next/link'
import { Sparkles, Calendar, Users, Share2, BarChart3, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">Evento</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-pink-100/50" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Create Beautiful
              <span className="block gradient-text font-display">Event Websites</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Design stunning event pages for weddings, birthdays, and celebrations. 
              Manage RSVPs, collect wishes, and share with a beautiful QR code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Start Creating Free
              </Link>
              <Link href="/templates" className="btn-secondary text-lg px-8 py-4">
                Browse Templates
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Create, customize, and share your event site with powerful features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Calendar className="w-6 h-6" />}
                title="Beautiful Templates"
                description="Choose from stunning, mobile-first templates designed for every occasion"
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="RSVP Management"
                description="Collect and track guest responses with real-time updates"
              />
              <FeatureCard
                icon={<Heart className="w-6 h-6" />}
                title="Wishes & Guestbook"
                description="Let guests leave heartfelt messages and wishes"
              />
              <FeatureCard
                icon={<Share2 className="w-6 h-6" />}
                title="Easy Sharing"
                description="Share via QR code, link, or directly to WhatsApp"
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Analytics Dashboard"
                description="Track views, RSVPs, and engagement in real-time"
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Fully Customizable"
                description="Edit content, reorder sections, and choose your colors"
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Create Your Event Site?
            </h2>
            <p className="text-lg text-purple-100 mb-10">
              Join thousands of happy users creating beautiful event pages
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Evento</span>
            </div>
            <p className="text-sm">
              Made with love for beautiful events
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card group hover:border-purple-200 border border-transparent">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
