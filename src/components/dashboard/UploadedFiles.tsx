import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, ExternalLink, Eye, Calendar, DollarSign, Shield, ShieldX, FileText, Folder, Image, Video, Music, File } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { db, type FileDetails } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { formatCents, formatDate, getFileType, createPaywallUrl, createContentUrl } from '../../lib/utils'
import { toast } from 'sonner'

export function UploadedFiles() {
  const { user } = useAppContext()

  const { data: files, isLoading } = useQuery({
    queryKey: ['creator-files', user?.id],
    queryFn: async () => {
      if (!user) return []
      return await db.getCreatorFiles(user.id)
    },
    enabled: !!user,
  })

  const copyPaywallLink = (file: FileDetails) => {
    const link = createPaywallUrl(file.slug)
    navigator.clipboard.writeText(link)
    toast.success('Paywall link copied to clipboard!')
  }

  const viewContent = (file: FileDetails) => {
    const url = createContentUrl(file.slug)
    window.open(url, '_blank')
  }

  const getFileIcon = (fileName: string) => {
    const fileType = getFileType(fileName)
    const iconClass = "h-4 w-4"
    
    switch (fileType) {
      case 'image':
        return <Image className={iconClass} />
      case 'video':
        return <Video className={iconClass} />
      case 'audio':
        return <Music className={iconClass} />
      case 'pdf':
      case 'document':
        return <FileText className={iconClass} />
      default:
        return <File className={iconClass} />
    }
  }

  const FilePreview = ({ file }: { file: FileDetails }) => {
    const fileType = getFileType(file.file_name)
    
    return (
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
        {fileType === 'image' ? (
          <img
            src={file.file_url}
            alt={file.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : fileType === 'video' ? (
          <video
            src={file.file_url}
            className="w-full h-full object-cover"
            muted
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        
        {/* Fallback icon display */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ display: fileType === 'image' || fileType === 'video' ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center shadow-sm">
              {getFileIcon(file.file_name)}
            </div>
            <p className="text-xs text-gray-500 font-medium truncate max-w-20">
              {file.file_name.split('.').pop()?.toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!files?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No files uploaded</h3>
            <p className="mt-2 text-gray-500">
              Start by uploading your first digital file to create a paywall.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => {
        const isExpired = file.expires_at && new Date(file.expires_at) < new Date()

        return (
          <Card key={file.id} className={`${isExpired ? 'opacity-75' : ''} overflow-hidden hover:shadow-lg transition-all duration-300`}>
            {/* Preview Section */}
            <div className="p-4 pb-0">
              <FilePreview file={file} />
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="truncate">
                    {file.title}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {file.screenshot_protection ? (
                    <ShieldX className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Shield className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatCents(file.price_cents)}
                </span>
                <span>{file.sales_count} sales</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created {formatDate(file.created_at)}
                </div>
                
                {file.expires_at && (
                  <div className={`flex items-center text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {isExpired ? 'Expired' : 'Expires'} {formatDate(file.expires_at)}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPaywallLink(file)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewContent(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(createPaywallUrl(file.slug), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}