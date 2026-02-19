import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useIsOwner } from '@/hooks/usePermission'
import { User, Users, Mail, Shield, HardDrive, SlidersHorizontal, Keyboard } from 'lucide-react'
import { LoadingState } from '@/components/shared/LoadingState'

const ProfileSection = lazy(() => import('./ProfileSection'))
const MembersSection = lazy(() => import('./MembersSection'))
const InvitesSection = lazy(() => import('./InvitesSection'))
const AccountSection = lazy(() => import('./AccountSection'))
const StorageSection = lazy(() => import('./StorageSection'))
const PreferencesSection = lazy(() => import('./PreferencesSection'))
const ShortcutsSection = lazy(() => import('./ShortcutsSection'))

interface SettingsTab {
  to: string
  label: string
  icon: typeof User
  ownerOnly?: boolean
}

const settingsTabs: SettingsTab[] = [
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/preferences', label: 'Preferences', icon: SlidersHorizontal },
  { to: '/settings/shortcuts', label: 'Shortcuts', icon: Keyboard },
  { to: '/settings/members', label: 'Members', icon: Users, ownerOnly: true },
  { to: '/settings/invites', label: 'Invites', icon: Mail, ownerOnly: true },
  { to: '/settings/account', label: 'Account', icon: Shield },
  { to: '/settings/storage', label: 'Storage', icon: HardDrive },
]

export default function SettingsPage(): JSX.Element {
  const isOwner = useIsOwner()
  const [version, setVersion] = useState('0.1.0')

  useEffect(() => {
    window.electronAPI?.getAppVersion().then((v) => setVersion(v)).catch(() => {})
  }, [])

  const visibleTabs = settingsTabs.filter((tab) => !tab.ownerOnly || isOwner)

  return (
    <div className="flex h-full">
      {/* Left-side tab navigation */}
      <nav className="flex w-52 shrink-0 flex-col gap-1 border-r border-border p-4">
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </h2>
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )
            }
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSection />} />
            <Route path="preferences" element={<PreferencesSection />} />
            <Route path="shortcuts" element={<ShortcutsSection />} />
            {isOwner && <Route path="members" element={<MembersSection />} />}
            {isOwner && <Route path="invites" element={<InvitesSection />} />}
            <Route path="account" element={<AccountSection />} />
            <Route path="storage" element={<StorageSection />} />
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </Suspense>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Project Tracker v{version}
        </p>
      </div>
    </div>
  )
}
