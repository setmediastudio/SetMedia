"use client"

import { Preloader } from "@/components/preloader"
import { RouterLoading } from "@/components/router-loading"

export function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <RouterLoading />
      {children}
    </>
  )
}