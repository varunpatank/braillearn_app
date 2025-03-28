'use client'
import { useState } from 'react'
import { User, Mail, Phone, MapPin, Save, Bell, Shield, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'

type UserSettings = {
  name: string
  email: string
  phone: string
  address: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    public_profile: boolean
    show_location: boolean
  }
  theme: 'light' | 'dark' | 'system'
}

const SettingCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
  >
    {children}
  </motion.div>
)

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Eco Street, Green City, 12345',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      public_profile: true,
      show_location: false
    },
    theme: 'light'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationToggle = (type: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }))
  }

  const handlePrivacyToggle = (type: keyof UserSettings['privacy']) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated settings to your backend
    console.log('Updated settings:', settings)
    alert('Settings updated successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Account Settings</h1>
      
      <div className="grid gap-8">
        <SettingCard>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={settings.name}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </SettingCard>

        <SettingCard>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-blue-600" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={() => handleNotificationToggle('email')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates in browser</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={() => handleNotificationToggle('push')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">SMS Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates via SMS</p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={() => handleNotificationToggle('sms')}
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Public Profile</h3>
                <p className="text-sm text-gray-500">Make your profile visible to others</p>
              </div>
              <Switch
                checked={settings.privacy.public_profile}
                onCheckedChange={() => handlePrivacyToggle('public_profile')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Location Sharing</h3>
                <p className="text-sm text-gray-500">Share your location on reports</p>
              </div>
              <Switch
                checked={settings.privacy.show_location}
                onCheckedChange={() => handlePrivacyToggle('show_location')}
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Palette className="w-6 h-6 mr-2 text-blue-600" />
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((theme) => (
              <button
                key={theme}
                onClick={() => setSettings(prev => ({ ...prev, theme: theme as UserSettings['theme'] }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.theme === theme
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="text-center">
                  <div className="capitalize font-medium text-gray-800">{theme}</div>
                  <div className="text-sm text-gray-500">Theme</div>
                </div>
              </button>
            ))}
          </div>
        </SettingCard>

        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl transition-all duration-300"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}