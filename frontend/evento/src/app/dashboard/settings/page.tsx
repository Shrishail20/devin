'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import Swal from 'sweetalert2'
import { User, Mail, Lock, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      timer: 1500,
      showConfirmButton: false,
    })
    
    setIsUpdating(false)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-purple-600">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                defaultValue={user?.name}
                className="input-field pl-12"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                defaultValue={user?.email}
                className="input-field pl-12"
                placeholder="your@email.com"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="btn-primary disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Change Password
        </h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
            />
          </div>
          <button type="button" className="btn-secondary">
            Update Password
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about your sites</p>
            </div>
            <button className="w-12 h-6 bg-purple-600 rounded-full">
              <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">RSVP Alerts</p>
              <p className="text-sm text-gray-500">Get notified when guests respond</p>
            </div>
            <button className="w-12 h-6 bg-purple-600 rounded-full">
              <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">New Wishes</p>
              <p className="text-sm text-gray-500">Get notified when guests leave wishes</p>
            </div>
            <button className="w-12 h-6 bg-gray-300 rounded-full">
              <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="card border-red-200">
        <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium">
          Delete Account
        </button>
      </div>
    </div>
  )
}
