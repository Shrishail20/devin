'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { 
  Globe, 
  Users, 
  Heart, 
  Eye,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { siteApi } from '@/lib/api'
import { Site } from '@/types'

export default function DashboardPage() {
  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await siteApi.getAll()
      return response.data as Site[]
    },
  })

  const totalViews = sites?.reduce((sum, site) => sum + (site.stats?.views || 0), 0) || 0
  const totalRsvps = sites?.reduce((sum, site) => sum + (site.stats?.rsvpCount || 0), 0) || 0
  const totalWishes = sites?.reduce((sum, site) => sum + (site.stats?.wishCount || 0), 0) || 0
  const publishedSites = sites?.filter(s => s.status === 'published').length || 0

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Globe className="w-5 h-5" />}
          label="Published Sites"
          value={publishedSites}
          color="purple"
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Views"
          value={totalViews}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="RSVPs"
          value={totalRsvps}
          color="green"
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="Wishes"
          value={totalWishes}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sites</h2>
            <Link
              href="/dashboard/sites"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : sites && sites.length > 0 ? (
            <div className="space-y-4">
              {sites.slice(0, 5).map((site) => (
                <Link
                  key={site._id}
                  href={`/dashboard/sites/${site._id}`}
                  className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{site.title}</h3>
                    <p className="text-sm text-gray-500">
                      {site.stats?.views || 0} views
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        site.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {site.status}
                      </span>
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No sites yet</p>
              <Link href="/dashboard/templates" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Your First Site
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/templates"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create New Site</h3>
                <p className="text-sm text-gray-500">Browse templates and start creating</p>
              </div>
            </Link>

            <Link
              href="/dashboard/sites"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-500">Check your site performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: 'purple' | 'blue' | 'green' | 'pink'
}) {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
