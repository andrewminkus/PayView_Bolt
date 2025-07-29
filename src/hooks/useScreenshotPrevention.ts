import { useEffect, useCallback } from 'react'

export function useScreenshotPrevention(enabled: boolean = true) {
  const preventScreenshot = useCallback((e: KeyboardEvent) => {
    // Prevent common screenshot shortcuts
    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) || // Ctrl+Shift+S
      (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) || // Mac screenshot shortcuts
      e.key === 'PrintScreen' // Print Screen key
    ) {
      e.preventDefault()
      e.stopPropagation()
      console.warn('Screenshot blocked')
    }
  }, [])

  const preventRightClick = useCallback((e: MouseEvent) => {
    e.preventDefault()
  }, [])

  const preventSelection = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  const preventDragStart = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!enabled) return

    // Add event listeners
    document.addEventListener('keydown', preventScreenshot)
    document.addEventListener('contextmenu', preventRightClick)
    document.addEventListener('selectstart', preventSelection)
    document.addEventListener('dragstart', preventDragStart)

    // Add CSS to prevent text selection
    const style = document.createElement('style')
    style.textContent = `
      .screenshot-protected {
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
      .screenshot-protected * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }
    `
    document.head.appendChild(style)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', preventScreenshot)
      document.removeEventListener('contextmenu', preventRightClick)
      document.removeEventListener('selectstart', preventSelection)
      document.removeEventListener('dragstart', preventDragStart)
      document.head.removeChild(style)
    }
  }, [enabled, preventScreenshot, preventRightClick, preventSelection, preventDragStart])

  return {
    protectionClass: enabled ? 'screenshot-protected' : '',
  }
}