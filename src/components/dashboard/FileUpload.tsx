import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import slugify from 'slugify'
import { Upload, X, FileText, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'sonner'

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  groupFiles: z.boolean().optional(),
})

type UploadForm = z.infer<typeof uploadSchema>

export function FileUpload() {
  const { user, profile, refetchProfile } = useAppContext()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [groupFiles, setGroupFiles] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      handleFilesSelect(files)
    }
  }

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files)
    if (files.length === 1 && !watch('title')) {
      const fileName = files[0].name.split('.').slice(0, -1).join('.')
      setValue('title', fileName)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    if (newFiles.length === 1) {
      const fileName = newFiles[0].name.split('.').slice(0, -1).join('.')
      setValue('title', fileName)
    } else if (newFiles.length === 0) {
      setValue('title', '')
    }
  }

  const onSubmit = async (data: UploadForm) => {
    if (!selectedFiles.length || !user) return

    try {
      setIsUploading(true)

      // Upload files to storage first
      const uploadedFiles = await Promise.all(selectedFiles.map(async (file, idx) => {
        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath)

        return {
          creatorId: user.id,
          fileName: file.name,
          fileUrl: publicUrl,
          fileSize: file.size,
          contentType: file.type,
          slug: slugify(
            selectedFiles.length > 1
              ? `${data.title} ${idx + 1}`
              : data.title,
            { lower: true, strict: true }
          ),
          description: data.description
        }
      }))

      // Create API payload
      const apiPayload = {
        files: uploadedFiles,
        group: groupFiles,
        series: {
          creatorId: user.id,
          title: data.title,
          slug: slugify(data.title, { lower: true, strict: true }),
          description: data.description
        }
      }

      // Call the unified API endpoint
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-file-api`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(apiPayload)
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { created } = await res.json()
      
      if (selectedFiles.length === 1) {
        toast.success('File uploaded successfully!')
      } else {
        toast.success(`${selectedFiles.length} files uploaded successfully!`)
      }
      
      // Reset form
      reset()
      setSelectedFiles([])
      setGroupFiles(false)
      
      // Refetch profile to update any changes
      refetchProfile()
      
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h2>
            <p className="text-gray-600 text-lg">Share your digital files with the world</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                dragActive
                  ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                {selectedFiles.length > 0 ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-900 mb-4">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div className="text-left">
                                <p className="font-medium text-gray-900 truncate max-w-xs">
                                  {file.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-3 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedFiles([])}
                        className="rounded-full px-6"
                      >
                        Clear All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="rounded-full px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="block text-xl font-semibold text-gray-900 mb-2">
                          Drop files here or click to browse
                        </span>
                        <span className="text-gray-500">
                          Supports PDF, images, videos, and documents
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files)
                            handleFilesSelect(files)
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium text-gray-900">
                    Content Title *
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter a descriptive title for your content"
                    className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 text-base"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium text-gray-900">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe what buyers will get..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-primary/20 text-base resize-none"
                  />
                </div>


                <Button 
                  type="submit" 
                  disabled={isUploading || !selectedFiles.length}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary-glow hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  {isUploading 
                    ? `Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}...` 
                    : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
                  }
                </Button>

                {selectedFiles.length > 1 && (
                  <div className="flex items-center space-x-3 pt-4">
                    <input
                      type="checkbox"
                      id="groupToggle"
                      checked={groupFiles}
                      onChange={() => setGroupFiles(!groupFiles)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <Label htmlFor="groupToggle" className="text-sm text-gray-700">
                      Group these files together?
                    </Label>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}