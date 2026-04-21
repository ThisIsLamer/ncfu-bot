/**
 * MAX Bridge — типы для window.WebApp
 * Документация: https://dev.max.ru/docs/webapps/bridge
 * Подключение: <script src="https://st.max.ru/js/max-web-app.js"></script>
 */

declare interface MaxWebAppUser {
  id: number
  first_name: string
  last_name: string
  username: string
  language_code: string
  photo_url: string
}

declare interface MaxWebAppChat {
  id: number
  type: 'DIALOG' | 'CHAT' | 'CHANNEL'
}

declare interface MaxWebAppInitData {
  query_id: string
  ip?: string
  auth_date: number
  hash: string
  user: MaxWebAppUser
  chat: MaxWebAppChat
  start_param: string
}

declare type MaxPlatform = 'ios' | 'android' | 'desktop' | 'web'

declare interface MaxBackButton {
  isVisible: boolean
  show: () => void
  hide: () => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
}

declare interface MaxDeviceStorage {
  setItem: (key: string, value: string) => Promise<{ status: 'updated' | 'removed' }>
  getItem: (key: string) => Promise<{ key: string, value: string }>
  removeItem: (key: string) => Promise<{ status: 'updated' | 'removed' }>
  clear: () => void
}

declare interface MaxSecureStorage {
  setItem: (key: string, value: string) => Promise<{ status: 'updated' | 'removed' }>
  getItem: (key: string) => Promise<{ key: string, value: string }>
  removeItem: (key: string) => Promise<{ status: 'updated' | 'removed' }>
  clear: () => void
}

declare interface MaxScreenCapture {
  enableScreenCapture: () => Promise<{ isScreenCaptureEnabled: boolean }>
  disableScreenCapture: () => Promise<{ isScreenCaptureEnabled: boolean }>
}

declare type MaxBiometryType = 'finger' | 'face' | 'unknown'

declare interface MaxBiometryInfo {
  available: boolean
  type: MaxBiometryType[]
  accessRequested: boolean
  accessGranted: boolean
  tokenSaved: boolean
  deviceId: string | null
}

declare interface MaxBiometricManager {
  isInited: boolean
  isBiometricAvailable: boolean
  isAccessRequested: boolean
  isAccessGranted: boolean
  isBiometricTokenSaved: boolean
  biometricType: MaxBiometryType[]
  deviceId: string | null
  init: () => Promise<MaxBiometryInfo>
  requestAccess: (reason?: string) => Promise<MaxBiometryInfo>
  authenticate: (reason?: string) => Promise<{ status: 'authorized', token: string }>
  updateBiometricToken: (token?: string, reason?: string) => Promise<{ status: 'updated' | 'removed' }>
  openSettings: () => Promise<{ status: 'opened' }>
}

declare type MaxHapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
declare type MaxHapticNotificationType = 'error' | 'success' | 'warning'

declare interface MaxHapticFeedback {
  impactOccurred: (style: MaxHapticImpactStyle, disableVibrationFallback?: boolean) => Promise<{ status: 'impactOccured' }>
  notificationOccurred: (type: MaxHapticNotificationType, disableVibrationFallback?: boolean) => Promise<{ status: 'notificationOccured' }>
  selectionChanged: (disableVibrationFallback?: boolean) => Promise<{ status: 'selectionChanged' }>
}

declare interface MaxNfcInfo {
  available: boolean
  enabled: boolean
  accessRevoked?: boolean
}

declare interface MaxNfcManager {
  isInited: boolean
  init: () => Promise<MaxNfcInfo>
  openSystemSettings: () => Promise<{ status: 'opened' }>
  emulateNfcTag: (nfctag?: string) => Promise<{ status: 'scanned' | 'stopped' }>
}

declare type MaxShareTextParams = { text?: string, link?: string }
declare type MaxShareMediaParams = { mid: string, chatType: 'DIALOG' | 'CHAT' }

declare interface MaxWebAppError {
  error: { code: string }
}

declare interface MaxWebApp {
  // Данные инициализации
  initData: string
  initDataUnsafe: MaxWebAppInitData
  platform: MaxPlatform
  version: string

  // Экран
  requestScreenMaxBrightness: () => Promise<{ maxBrightness: boolean }>
  restoreScreenBrightness: () => Promise<{ maxBrightness: boolean }>
  ScreenCapture: MaxScreenCapture

  // Контакт
  requestContact: () => Promise<{ phone: string }>

  // Закрытие
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void

  // Ссылки
  openLink: (url: string) => void
  openMaxLink: (url: string) => void

  // Файлы
  downloadFile: (url: string, file_name: string) => Promise<{ status: 'downloading' | 'cancelled' }>

  // Шеринг
  shareContent: (params: MaxShareTextParams) => Promise<{ status: 'shared' | 'cancelled' }>
  shareMaxContent: (params: MaxShareTextParams | MaxShareMediaParams) => Promise<{ status: 'shared' | 'cancelled' }>

  // QR-коды
  openCodeReader: (fileSelect?: boolean) => Promise<{ value: string }>

  // Кнопка «Назад»
  BackButton: MaxBackButton

  // Хранилища
  DeviceStorage: MaxDeviceStorage
  SecureStorage: MaxSecureStorage

  // Биометрия
  BiometricManager: MaxBiometricManager

  // Тактильные отклики
  HapticFeedback: MaxHapticFeedback

  // NFC
  NfcManager: MaxNfcManager
}

declare interface Window {
  WebApp: MaxWebApp
}
