'use client'

import { MessageSquare } from 'lucide-react'
import { DashboardWhatsApp } from '@/components/whatsapp/dashboard-whatsapp'

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <MessageSquare className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp Business</h1>
          <p className="text-gray-400 mt-1">
            Monitoreo y gestión de comunicaciones por WhatsApp
          </p>
        </div>
      </div>

      <DashboardWhatsApp />
    </div>
  )
}
