'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { exportUserData } from '@/app/(app)/settings/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DataExportPanel(): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const result = await exportUserData()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        // Create blob and download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `qc-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Data exported successfully')
      }
    } catch {
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Data & Privacy</h2>
        <p className="text-sm text-muted-foreground">Manage your data and privacy settings</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download a copy of all your QC data including notes, check-ins, milestones, and more. Your data will be
            exported as a JSON file.
          </p>
          <Button onClick={handleExport} disabled={isExporting} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium">What's Included</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Your profile information</li>
            <li>• Couple relationship data</li>
            <li>• All your notes (shared and private)</li>
            <li>• Check-in history</li>
            <li>• Action items and milestones</li>
            <li>• Reminders and requests</li>
            <li>• Love languages and actions</li>
          </ul>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium">Privacy Notice</h3>
          <p className="text-sm text-muted-foreground">
            Your exported data includes all information from your account and couple profile. Store this file securely
            as it contains sensitive personal information. Data import functionality is not yet available.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
