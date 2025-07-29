import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { useScreenshotPrevention } from '../../hooks/useScreenshotPrevention'
import { getFileType } from '../../lib/utils'
import { toast } from 'sonner'

export function ContentPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const { user } = useAppContext()

  const { data: fileData, isLoading } = useQuery({
    queryKey: ['content-file', fileId],
    queryFn: async () => {
      if (!fileId) return null

      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          creator_id (
            username
          )
        `)
        .eq('id', fileId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!fileId,
  })

  const { data: hasAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['content-access', fileId, user?.id],
    queryFn: async () => {
      if (!fileId || !user) return false

      // Check if user is the creator
      if (fileData?.creator_id === user.id) return true

      // Check if user has purchased access
      const { data, error } = await supabase
        .from('transactions')
        .select('expiry_date')
        .eq('file_id', fileId)
        .eq('buyer_id', user.id)
        .eq('payment_status', 'completed')
        .single()

      if (error) return false

      // Check if access has expired
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        return false
      }

      return true
    },
    enabled: !!fileId && !!user && !!fileData,
  })

  const { data: secureUrl } = useQuery({
    queryKey: ['secure-url', fileId],
    queryFn: async () => {
      if (!fileId || !hasAccess) return null

      const { data, error } = await supabase.functions.invoke('get-secure-signed-url', {
        body: { fileId }
      })

      if (error) throw error
      return data.url
    },
    enabled: !!fileId && hasAccess,
  })

  const { protectionClass } = useScreenshotPrevention(!fileData?.allow_screenshots)

  const handleDownload = async () => {
    if (!secureUrl || !fileData) return

    try {
      const response = await fetch(secureUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileData.file_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  if (isLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!fileData) {
    return <Navigate to="/404" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasAccess) {
    return <Navigate to={`/paywall/${fileId}`} replace />
  }

  const fileType = getFileType(fileData.file_name)
  const creatorName = fileData.creator_id?.username || 'Unknown Creator'

  return (
    <div className={`min-h-screen bg-gray-50 ${protectionClass}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fileData.file_name}</h1>
              <p className="text-gray-600">by {creatorName}</p>
            </div>
            
            {fileData.allow_screenshots && (
              <Button onClick={handleDownload} disabled={!secureUrl}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ContentViewer 
              fileUrl={secureUrl} 
              fileName={fileData.file_name}
              fileType={fileType}
              allowScreenshots={fileData.allow_screenshots}
            />
          </CardContent>
        </Card>

        {!fileData.allow_screenshots && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Protected Content:</strong> This content has screenshot prevention enabled. 
              Right-click, keyboard shortcuts, and text selection have been disabled.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ContentViewer({ 
  fileUrl, 
  fileName, 
  fileType, 
  allowScreenshots 
}: { 
  fileUrl: string | null
  fileName: string
  fileType: string
  allowScreenshots: boolean 
}) {
  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const commonProps = {
    className: `w-full ${!allowScreenshots ? 'pointer-events-none select-none' : ''}`,
    onContextMenu: !allowScreenshots ? (e: React.MouseEvent) => e.preventDefault() : undefined,
  }

  switch (fileType) {
    case 'image':
      return (
        <img
          src={fileUrl}
          alt={fileName}
          {...commonProps}
          style={{ maxHeight: '80vh', objectFit: 'contain' }}
        />
      )
    
    case 'video':
      return (
        <video
          src={fileUrl}
          controls={allowScreenshots}
          controlsList={!allowScreenshots ? 'nodownload nofullscreen noremoteplayback' : undefined}
          {...commonProps}
          style={{ maxHeight: '80vh' }}
        >
          Your browser does not support the video tag.
        </video>
      )
    
    case 'audio':
      return (
        <div className="p-8 text-center">
          <audio
            src={fileUrl}
            controls={allowScreenshots}
            controlsList={!allowScreenshots ? 'nodownload' : undefined}
            className="w-full max-w-md mx-auto"
          >
            Your browser does not support the audio tag.
          </audio>
          <p className="mt-4 text-lg font-medium">{fileName}</p>
        </div>
      )
    
    case 'pdf':
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          className="w-full h-screen"
          style={{ minHeight: '80vh' }}
        />
      )
    
    default:
      return (
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{fileName}</h3>
            <p className="text-gray-600 mb-4">
              This file type cannot be previewed in the browser.
            </p>
            {allowScreenshots && (
              <Button onClick={() => window.open(fileUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            )}
          </div>
        </div>
      )
  }
}