'use client'

import React from 'react'

import { Skeleton, CardSkeleton, ListItemSkeleton } from '@/components/ui/LoadingSkeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} showHeader showFooter />
        ))}
      </div>

      <CardSkeleton showHeader className="p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <ListItemSkeleton key={i} showAvatar />
          ))}
        </div>
      </CardSkeleton>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center space-y-2">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CheckInSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} shape="circle" className="h-3 w-3" />
        ))}
      </div>

      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            <Skeleton shape="circle" className="h-12 w-12 mx-auto" />
            <Skeleton className="h-5 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      <div className="flex space-x-3 pt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32 flex-1" />
      </div>
    </div>
  )
}

export function NotesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton shape="circle" className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
