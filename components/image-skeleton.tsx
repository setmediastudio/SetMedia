"use client"

import React from "react"

import { useEffect, useState } from "react"

interface ImageSkeletonProps {
  width?: number
  height?: number
  isLoading: boolean
  children: React.ReactNode
}

export function ImageSkeleton({ isLoading, children }: ImageSkeletonProps) {
  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-pulse z-10" />
      )}
      {children}
    </>
  )
}
