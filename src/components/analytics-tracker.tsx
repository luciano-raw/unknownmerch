"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sessionTokenRef = useRef<string | null>(null)
  
  // Track timestamps for duration calculation
  const pageEntryTimeRef = useRef<number>(Date.now())
  const prevPathRef = useRef<string | null>(null)

  // Initialize session token
  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = sessionStorage.getItem("unknown_session_token")
      if (!token) {
        token = `session-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`
        sessionStorage.setItem("unknown_session_token", token)
      }
      sessionTokenRef.current = token
    }
  }, [])

  // Send event helper
  const sendEvent = (data: {
    type: string
    path?: string
    elementId?: string | null
    elementText?: string | null
    duration?: number | null
    deviceType?: string | null
  }, useBeacon = false) => {
    const payload = {
      ...data,
      sessionToken: sessionTokenRef.current || "anonymous",
      deviceType: data.deviceType || (window.innerWidth < 768 ? "mobile" : "desktop"),
      path: data.path || window.location.pathname
    }

    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", JSON.stringify(payload))
    } else {
      fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        keepalive: true // Crucial for exit tracking
      }).catch(err => console.error("Error sending analytics:", err))
    }
  }

  // Handle Pageview and Duration Updates
  useEffect(() => {
    if (!sessionTokenRef.current) return

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    const now = Date.now()

    // 1. If we have a previous page, calculate and send its duration
    if (prevPathRef.current && prevPathRef.current !== fullPath) {
      const durationSeconds = Math.round((now - pageEntryTimeRef.current) / 1000)
      if (durationSeconds > 0) {
        sendEvent({
          type: "duration_update",
          path: prevPathRef.current,
          duration: durationSeconds
        })
      }
    }

    // 2. Track new page view
    sendEvent({
      type: "pageview",
      path: fullPath
    })

    // Reset references for the current page
    pageEntryTimeRef.current = now
    prevPathRef.current = fullPath

  }, [pathname, searchParams, sessionTokenRef.current])

  // Track window/tab unload (final exit duration)
  useEffect(() => {
    const handleUnload = () => {
      if (!sessionTokenRef.current || !prevPathRef.current) return
      const durationSeconds = Math.round((Date.now() - pageEntryTimeRef.current) / 1000)
      if (durationSeconds > 0) {
        sendEvent({
          type: "duration_update",
          path: prevPathRef.current,
          duration: durationSeconds
        }, true)
      }
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [pathname, searchParams])

  // Global click listener for key elements (Checkout, Add to Cart, Social Links, Products, Menu)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!sessionTokenRef.current) return

      const target = e.target as HTMLElement
      // Find closest link or button
      const clickable = target.closest("a, button, [role='button']") as HTMLElement | null
      if (!clickable) return

      const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

      let elementId = clickable.id || clickable.getAttribute("data-analytics-id")
      let elementText = clickable.innerText?.trim() || clickable.getAttribute("aria-label") || clickable.getAttribute("data-analytics-label") || ""

      // Trim text length if excessively long (e.g. paragraph descriptions)
      if (elementText.length > 50) {
        elementText = elementText.substring(0, 47) + "..."
      }

      // Check for specific element traits to categorize them nicely
      let isInteresting = false

      // Add to Cart detection
      if (
        clickable.classList.contains("bg-primary") &&
        (elementText.toLowerCase().includes("agregar") || 
         elementText.toLowerCase().includes("buy") || 
         elementText.toLowerCase().includes("shop") || 
         elementText.toLowerCase().includes("carrito"))
      ) {
        elementId = elementId || "add-to-cart-button"
        isInteresting = true
      }

      // Social Links (Instagram)
      const href = clickable.getAttribute("href")
      if (href && href.includes("instagram.com")) {
        elementId = elementId || "instagram-link"
        elementText = elementText || `@${href.split("/").pop()}` || "Instagram"
        isInteresting = true
      }

      // Search submit
      if (clickable.getAttribute("type") === "submit" && clickable.innerText === "Buscar") {
        elementId = elementId || "search-button"
        isInteresting = true
      }

      // Product clicks
      if (href && href.startsWith("/product/")) {
        elementId = elementId || `product-card-click`
        elementText = elementText || href.split("/").pop() || "Product Detail"
        isInteresting = true
      }

      // If it has data-analytics-id or is marked interesting, we record it
      if (elementId || isInteresting) {
        sendEvent({
          type: "click",
          path,
          elementId: elementId || clickable.tagName.toLowerCase(),
          elementText: elementText || "Botón/Enlace"
        })
      }
    };

    window.addEventListener("click", handleGlobalClick)
    return () => {
      window.removeEventListener("click", handleGlobalClick)
    }
  }, [pathname, searchParams])

  return null
}
