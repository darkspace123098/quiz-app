/**
 * Global type definitions for ProctorMonitor
 */

interface ProctorMonitorOptions {
  videoElement: HTMLVideoElement
  canvasElement: HTMLCanvasElement
  quizId?: string
  contestantId?: string
  contestantName?: string
  apiBaseUrl?: string
  checkInterval?: number
  captureFrameInterval?: number
}

interface ProctorMonitorInstance {
  initialize(): Promise<boolean>
  startMonitoring(): Promise<boolean>
  stopMonitoring(): Promise<void>
  on(event: string, callback: (data: any) => void): void
  emit(event: string, data: any): void
  monitoring: boolean
  enabled: boolean
  modelsLoaded: boolean
}

declare class ProctorMonitor {
  constructor(options?: ProctorMonitorOptions)
  initialize(): Promise<boolean>
  startMonitoring(): Promise<boolean>
  stopMonitoring(): Promise<void>
  on(event: string, callback: (data: any) => void): void
  emit(event: string, data: any): void
  monitoring: boolean
  enabled: boolean
  modelsLoaded: boolean
}

declare global {
  interface Window {
    ProctorMonitor: typeof ProctorMonitor
    faceapi?: any
  }
}

export {}
