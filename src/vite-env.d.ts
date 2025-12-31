/// <reference types="vite/client" />

interface ElectronAPI {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  readDir: (_path: string) => Promise<string[]>
  readFile: (_path: string) => Promise<string>
  writeFile: (_path: string, data: string) => Promise<void>
  createDir: (_path: string) => Promise<void>
  deleteFile: (_path: string) => Promise<void>
}

interface Window {
  electronAPI?: ElectronAPI
}