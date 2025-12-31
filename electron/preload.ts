import { ipcRenderer, contextBridge } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
    windowMinimize: () => ipcRenderer.send("window-minimize"),
    windowMaximize: () => ipcRenderer.send("window-maximize"),
    windowClose: () => ipcRenderer.send("window-close"),
    fileOpen: () => ipcRenderer.invoke("file-open"),
    fileSave: (content: string) => ipcRenderer.invoke("file-save", content),
    fileSaveAs: (content: string) => ipcRenderer.invoke("file-save-as", content),
    getCurrentWorkDir: () => ipcRenderer.invoke("get-current-work-dir"),
    requestUnsavedFiles: () => ipcRenderer.send("request-unsaved-files"),
    replyUnsavedFiles: (files: Array<{ id: string; name: string }>) =>
        ipcRenderer.send("reply-unsaved-files", files),
    requestSaveFile: (id: string) => ipcRenderer.send("request-save-file", id),
    replySaveFile: (success: boolean) => ipcRenderer.send("reply-save-file", success),
})

contextBridge.exposeInMainWorld("ipcRenderer", {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },
})
