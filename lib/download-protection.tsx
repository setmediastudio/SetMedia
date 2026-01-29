export function initializeDownloadProtection() {
  if (typeof window === "undefined") return

  const blockDownloadManagers = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const downloadManagers = ["idm", "fdm", "eagleget", "jdownloader", "downloadmaster"]

    const isDownloadManager = downloadManagers.some((dm) => userAgent.includes(dm))

    if (isDownloadManager) {
      console.warn("[v0] Download manager detected")
      return true
    }

    return false
  }

  const preventDirectAccess = () => {
    const images = document.querySelectorAll("img")
    const videos = document.querySelectorAll("video")

    images.forEach((img) => {
      img.addEventListener("contextmenu", (e) => e.preventDefault())
      img.addEventListener("dragstart", (e) => e.preventDefault())
      img.style.pointerEvents = "none"
    })

    videos.forEach((video) => {
      video.addEventListener("contextmenu", (e) => e.preventDefault())
      video.addEventListener("dragstart", (e) => e.preventDefault())
      video.controlsList.add("nodownload")
      video.disablePictureInPicture = true
    })
  }

  const detectDevTools = () => {
    const threshold = 160
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold

    if (widthThreshold || heightThreshold) {
      console.warn("[v0] DevTools may be open")
    }
  }

  if (blockDownloadManagers()) {
    document.body.innerHTML = "<h1>Download managers are not supported</h1>"
    return
  }

  preventDirectAccess()

  window.addEventListener("resize", detectDevTools)
  window.addEventListener("load", preventDirectAccess)

  const observer = new MutationObserver(preventDirectAccess)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}
