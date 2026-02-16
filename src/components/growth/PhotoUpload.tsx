'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Image as ImageIcon, RefreshCw, Check, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PhotoUploadProps {
  value?: string | null
  onFileSelect: (file: File) => void
  onEmojiSelect: (emoji: string) => void
  onRemove: () => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  isUploading?: boolean
  placeholder?: string
}

const EMOJI_OPTIONS = ['📸', '🌅', '🌺', '🎂', '🏖️', '🌟', '💐', '🎉', '🌈', '🦋', '🌸', '🏔️', '🌊', '🍰', '🎈', '⭐']

export function PhotoUpload({
  value,
  onFileSelect,
  onEmojiSelect,
  onRemove,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  variant = 'default',
  isUploading = false,
  placeholder = 'Add a photo to commemorate this milestone',
}: PhotoUploadProps): React.ReactElement {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmojiSelector, setShowEmojiSelector] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function validateAndSelect(file: File): void {
    setError(null)

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    if (!acceptedFormats.includes(file.type)) {
      setError('File format not supported. Use JPEG, PNG, or WebP.')
      return
    }

    onFileSelect(file)
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      validateAndSelect(files[0])
    }
  }

  function handleDragOver(e: React.DragEvent): void {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent): void {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSelect(files[0])
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-2', className)}>
        {value ? (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            {value.startsWith('http') ? (
              <img src={value} alt="Preview" className="h-8 w-8 rounded object-cover" />
            ) : (
              <span className="text-2xl">{value}</span>
            )}
            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">Photo selected</span>
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-gray-500 hover:text-red-500">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowEmojiSelector(true)} disabled={isUploading}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <AnimatePresence>
          {showEmojiSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border bg-white p-3 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">Choose an emoji</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowEmojiSelector(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onEmojiSelect(emoji)
                      setShowEmojiSelector(false)
                    }}
                    className="flex aspect-square items-center justify-center rounded-lg border text-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    )
  }

  // Default and compact variants
  return (
    <div className={cn('space-y-3', className)}>
      {value ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="flex items-center gap-3 rounded-lg border bg-white p-4 dark:bg-gray-900">
            {value.startsWith('http') ? (
              <img src={value} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <span className="text-3xl">{value}</span>
            )}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Photo added</span>
              </div>
              <p className="text-xs text-gray-500">Ready to create milestone</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-gray-500 hover:text-red-500">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            isDragging
              ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/10'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-700',
          )}
        >
          <Camera className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{placeholder}</p>

          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowEmojiSelector(true)} disabled={isUploading}>
              <ImageIcon className="mr-1 h-4 w-4" />
              Emoji
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      <AnimatePresence>
        {showEmojiSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border bg-white p-3 dark:bg-gray-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium">Choose an emoji</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowEmojiSelector(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onEmojiSelect(emoji)
                    setShowEmojiSelector(false)
                  }}
                  className="flex aspect-square items-center justify-center rounded-lg border text-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
