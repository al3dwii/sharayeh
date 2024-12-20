// src/app/(pages)/settings/page.tsx
import React from 'react'
import { Metadata } from 'next'
import UserSettingClient from './UserSettingClient'

export const metadata: Metadata = {
  title: 'User Settings',
}

export default function Page() {
  // No data fetching here, just return the client component
  return <UserSettingClient />
}
