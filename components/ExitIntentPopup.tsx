'use client'
import { useEffect, useState } from 'react'

interface Props {
  serviceUrl: string
  message: string
  ctaText: string
}

export function ExitIntentPopup({ serviceUrl, message, ctaText }: Props) {
  const [shown, setShown] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (shown) return
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShown(true)
        setVisible(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [shown])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <p className="text-white text-lg font-medium mb-4">{message}</p>
        <a
          href={serviceUrl + '#pricing'}
          className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl mb-3 hover:opacity-90 transition-opacity"
        >
          {ctaText}
        </a>
        <button
          onClick={() => setVisible(false)}
          className="text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
