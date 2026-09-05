import { useEffect } from 'react'
import '@twa-dev/sdk'

type BackButtonApi = {
  show: () => void
  hide: () => void
  onClick: (cb: () => void) => void
  offClick: (cb: () => void) => void
}

type TelegramWebApp = {
  ready?: () => void
  expand?: () => void
  disableVerticalSwipes?: () => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  BackButton?: BackButtonApi
}

function getWebApp(): TelegramWebApp | undefined {
  return (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram
    ?.WebApp
}

export function initTelegram() {
  const webApp = getWebApp()
  if (!webApp || typeof webApp.ready !== 'function') return

  webApp.ready()
  webApp.expand?.()
  webApp.disableVerticalSwipes?.()
  webApp.setHeaderColor?.('#0b1220')
  webApp.setBackgroundColor?.('#0b1220')
}

export function useTelegramBackButton(visible: boolean, onBack: () => void) {
  useEffect(() => {
    const back = getWebApp()?.BackButton
    if (!back) return

    if (!visible) {
      back.hide()
      return
    }

    back.onClick(onBack)
    back.show()

    return () => {
      back.offClick(onBack)
      back.hide()
    }
  }, [visible, onBack])
}
