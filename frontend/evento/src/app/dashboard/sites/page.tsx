'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { 
  Search, 
  Plus,
  Globe,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  MoreVertical,
  Users,
  Heart,
  Copy,
  QrCode
} from 'lucide-react'
import { siteApi } from '@/lib/api'
import { Site } from '@/types'

export default function SitesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await siteApi.getAll()
      return (response.data.sites || response.data || []) as Site[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => siteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Site has been deleted',
        timer: 1500,
        showConfirmButton: false,
      })
    },
  })

  const handleDelete = async (site: Site) => {
    const result = await Swal.fire({
      title: 'Delete Site?',
      text: `Are you sure you want to delete "${site.title}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
    })

    if (result.isConfirmed) {
      deleteMutation.mutate(site._id)
    }
  }

  const handleCopyLink = (site: Site) => {
    const url = `${window.location.origin}/e/${site.slug}`
    navigator.clipboard.writeText(url)
    Swal.fire({
      icon: 'success',
      title: 'Link Copied!',
      text: url,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const filteredSites = sites?.filter((site) => {
    const matchesSearch = site.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || site.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Sites</h1>
          <p className="text-gray-600 mt-1">Manage your event sites</p>
        </div>
        <Link href="/dashboard/templates" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Site
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl capitalize transition-all ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1" />
                <div className="h-10 bg-gray-200 rounded flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSites && filteredSites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <SiteCard
              key={site._id}
              site={site}
              onDelete={() => handleDelete(site)}
              onCopyLink={() => handleCopyLink(site)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-600 mb-6">Create your first event site from a template</p>
          <Link href="/dashboard/templates" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Browse Templates
          </Link>
        </div>
      )}
    </div>
  )
}

function SiteCard({ 
  site, 
  onDelete,
  onCopyLink
}: { 
  site: Site
  onDelete: () => void
  onCopyLink: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{site.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              site.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {site.status}
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                <button
                  onClick={() => {
                    onCopyLink()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> QR Code
                </button>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{site.stats?.views || 0}</p>
          <p className="text-xs text-gray-500">Views</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{site.stats?.rsvpCount || 0}</p>
          <p className="text-xs text-gray-500">RSVPs</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-lg font-semibold text-gray-900">{site.stats?.wishCount || 0}</p>
          <p className="text-xs text-gray-500">Wishes</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dashboard/sites/${site._id}/edit`}
          className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" /> Edit
        </Link>
        {site.status === 'published' && (
          <Link
            href={`/e/${site.slug}`}
            target="_blank"
            className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> View
          </Link>
        )}
      </div>
    </div>
  )
}
