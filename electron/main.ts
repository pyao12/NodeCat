import { app, BrowserWindow, ipcMain, dialog } from "electron"
import { fileURLToPath } from "node:url"
import path from "node:path"
import fs from "node:fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, "..")

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"]
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron")
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST

let window: BrowserWindow | null
let currentFilePath: string | null = null

function createWindow() {
    window = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        titleBarStyle: "hidden",
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
        },
        icon: path.join(process.env.VITE_PUBLIC, "favicon.png"),
    })
    window.webContents.on("did-finish-load", () => {
        window?.webContents.send("main-process-message", new Date().toLocaleString())
    })

    window.on("close", async e => {
        e.preventDefault()
        window?.webContents.send("request-unsaved-files")
        const unsavedFiles = await new Promise(resolve => {
            const timeout = setTimeout(() => {
                console.error("Timeout waiting for unsaved files")
                resolve([])
            }, 3000)

            ipcMain.once("reply-unsaved-files", (event, files) => {
                clearTimeout(timeout)
                resolve(files)
            })
        })

        const files = unsavedFiles as Array<{ id: string; name: string }>
        if (!files || files.length === 0) {
            window?.destroy()
            return
        }

        for (const file of files) {
            const { response } = await dialog.showMessageBox(window!, {
                type: "warning",
                buttons: ["Save", "Don't Save", "Cancel"],
                defaultId: 0,
                cancelId: 2,
                title: "Unsaved Changes",
                message: `Do you want to save changes to ${file.name}?`,
            })

            if (response === 0) {
                window?.webContents.send("request-save-file", file.id)

                // 等待保存完成
                await new Promise(resolve => {
                    const timeout = setTimeout(() => {
                        console.error("Timeout waiting for file save")
                        resolve(null)
                    }, 5000)

                    ipcMain.once("reply-save-file", (event, success) => {
                        clearTimeout(timeout)
                        resolve(success)
                    })
                })
            } else if (response === 2) {
                return
            }
        }

        window?.destroy()
    })

    if (VITE_DEV_SERVER_URL) {
        window.loadURL(VITE_DEV_SERVER_URL)
    } else {
        window.loadFile(path.join(RENDERER_DIST, "index.html"))
    }
}

ipcMain.on("window-minimize", () => {
    window?.minimize()
})
ipcMain.on("window-maximize", () => {
    if (window?.isMaximized()) {
        window.unmaximize()
    } else {
        window?.maximize()
    }
})
ipcMain.on("window-close", () => {
    window?.close()
})

ipcMain.handle("file-open", async () => {
    const result = await dialog.showOpenDialog(window!, {
        properties: ["openFile"],
        filters: [
            { name: "All Files", extensions: ["*"] },
            { name: "JavaScript Files", extensions: ["js", "jsx"] },
            { name: "TypeScript Files", extensions: ["ts", "tsx"] },
            { name: "CSS Files", extensions: ["css", "scss", "sass", "less"] },
            { name: "Vue Template Files", extensions: ["vue"] },
            { name: "Markdown Files", extensions: ["md"] },
            { name: "JSON Files", extensions: ["json"] },
            { name: "Text Files", extensions: ["txt"] },
        ],
    })
    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        const content = fs.readFileSync(filePath, "utf-8")
        currentFilePath = filePath
        return { content, filePath }
    }
    return null
})

ipcMain.handle("file-save", async (_event, content: string) => {
    if (currentFilePath) {
        fs.writeFileSync(currentFilePath, content, "utf-8")
        return currentFilePath
    }
    return null
})

ipcMain.handle("file-save-as", async (_event, content: string) => {
    const result = await dialog.showSaveDialog(window!, {
        filters: [
            { name: "All Files", extensions: ["*"] },
            { name: "Text Files", extensions: ["txt"] },
            { name: "Markdown Files", extensions: ["md"] },
            { name: "JSON Files", extensions: ["json"] },
            { name: "JavaScript Files", extensions: ["js", "jsx"] },
            { name: "TypeScript Files", extensions: ["ts", "tsx"] },
            { name: "Vue Template Files", extensions: ["vue"] },
        ],
    })
    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, "utf-8")
        currentFilePath = result.filePath
        return result.filePath
    }
    return null
})

ipcMain.handle("get-current-work-dir", async () => {
    return process.cwd()
})

// events of MacOS to close the app
app.on("window-all-closed", () => {
    window = null
    if (process.platform !== "darwin") {
        app.quit()
    }
})
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// create window if ready
app.whenReady().then(createWindow)
