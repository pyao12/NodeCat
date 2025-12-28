/// <reference types="vite/client" />

interface ElectronAPI {
    windowMinimize: () => void
    windowMaximize: () => void
    windowClose: () => void
}

interface Window {
    electronAPI?: ElectronAPI
}
