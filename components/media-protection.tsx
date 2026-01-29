"use client"

import { useEffect } from "react"

export function MediaProtection() {
  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault()
        return false
      }
    }

    const disableDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault()
        return false
      }
    }

    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s") ||
        e.key === "F12"
      ) {
        e.preventDefault()
        return false
      }
    }

    const disableSelection = () => {
      const style = document.createElement("style")
      style.innerHTML = `
        img, video {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          pointer-events: auto;
        }
      `
      document.head.appendChild(style)
      return style
    }

    document.addEventListener("contextmenu", disableRightClick)
    document.addEventListener("dragstart", disableDragStart)
    document.addEventListener("keydown", disableKeyboardShortcuts)
    const styleElement = disableSelection()

    return () => {
      document.removeEventListener("contextmenu", disableRightClick)
      document.removeEventListener("dragstart", disableDragStart)
      document.removeEventListener("keydown", disableKeyboardShortcuts)
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement)
      }
    }
  }, [])

  return null
}
