<template>
    <div class="flex h-screen flex-col bg-gray-900">
        <TitleBar />
        <MenuBar
            :content="content"
            :current-file-path="currentFilePath"
            :is-modified="isModified"
            :can-undo="canUndo"
            :can-redo="canRedo"
            @new="handleNew"
            @open="handleOpen"
            @save="handleSave"
            @save-as="handleSaveAs"
            @quit="handleQuit"
            @undo="handleUndo"
            @redo="handleRedo"
            @cut="handleCut"
            @copy="handleCopy"
            @paste="handlePaste"
            @select-all="handleSelectAll"
        />
        <div class="flex flex-1 overflow-hidden">
            <div class="flex flex-1 flex-col overflow-hidden">
                <Tabs
                    :tabs="tabs"
                    :active-tab-id="activeTabId"
                    :current-file-path="currentFilePath"
                    @switch-tab="switchTab"
                    @close-tab="closeTab"
                />
                <Editor ref="editorRef" v-model="content" :current-file-path="currentFilePath" />
            </div>
        </div>
        <div
            class="flex items-center justify-between border-t border-gray-700 bg-gray-800 px-4 py-1 text-xs text-gray-500"
        >
            <span>{{ isModified ? "Modified" : "Saved" }}</span>
            <span>{{ lineCount }} lines</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import TitleBar from "./components/TitleBar.vue"
import MenuBar from "./components/MenuBar.vue"
import Tabs from "./components/Tabs.vue"
import Editor from "./blocks/Editor.vue"
import { useTabs } from "./composables/useTabs"

const {
    tabs,
    activeTabId,
    activeTab,
    currentFilePath,
    isModified,
    lineCount,
    createNewTab,
    switchTab,
    closeTab,
    updateTabContent,
    markTabAsSaved,
} = useTabs()

const content = computed({
    get: () => activeTab.value?.content || "",
    set: value => {
        if (activeTab.value) {
            updateTabContent(activeTab.value.id, value)
        }
    },
})

const canUndo = ref(false)
const canRedo = ref(false)

createNewTab()

function handleNew() {
    createNewTab()
}

async function handleOpen() {
    try {
        const result = await (window as any).electronAPI.fileOpen()
        if (result) {
            const existingTab = tabs.value.find(tab => tab.filePath === result.filePath)
            if (existingTab) {
                switchTab(existingTab.id)
            } else {
                createNewTab(result.filePath, result.content)
            }
        }
    } catch (error) {
        console.error("Failed to open file:", error)
    }
}

async function handleSave() {
    if (!activeTab.value) return
    if (!activeTab.value.filePath) {
        await handleSaveAs()
        return
    }
    try {
        const result = await (window as any).electronAPI.fileSave(activeTab.value.content)
        if (result) {
            markTabAsSaved(activeTab.value.id)
        }
    } catch (error) {
        console.error("Failed to save file:", error)
    }
}

async function handleSaveAs() {
    if (!activeTab.value) return
    try {
        const result = await (window as any).electronAPI.fileSaveAs(activeTab.value.content)
        if (result) {
            markTabAsSaved(activeTab.value.id, result)
        }
    } catch (error) {
        console.error("Failed to save file:", error)
    }
}

function handleQuit() {
    window.close()
}

function handleUndo() {
    const editor = document.querySelector("textarea")
    if (editor) {
        document.execCommand("undo")
    }
}

function handleRedo() {
    const editor = document.querySelector("textarea")
    if (editor) {
        document.execCommand("redo")
    }
}

function handleCut() {
    const editor = document.querySelector("textarea")
    if (editor) {
        document.execCommand("cut")
    }
}

function handleCopy() {
    const editor = document.querySelector("textarea")
    if (editor) {
        document.execCommand("copy")
    }
}

function handlePaste() {
    const editor = document.querySelector("textarea")
    if (editor) {
        document.execCommand("paste")
    }
}

function handleSelectAll() {
    const editor = document.querySelector("textarea")
    if (editor) {
        document.execCommand("selectAll")
    }
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "n") {
        event.preventDefault()
        handleNew()
    } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault()
        handleOpen()
    } else if (event.ctrlKey && event.key === "s" && !event.shiftKey) {
        event.preventDefault()
        handleSave()
    } else if (event.ctrlKey && event.shiftKey && event.key === "s") {
        event.preventDefault()
        handleSaveAs()
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeyDown)
    ;(window as any).ipcRenderer.on("request-unsaved-files", () => {
        const unsavedFiles = tabs.value
            .filter(tab => tab.isModified)
            .map(tab => ({
                id: tab.id,
                name: tab.filePath ? tab.filePath.split("/").pop() : "Untitled",
            }))
        ;(window as any).electronAPI.replyUnsavedFiles(unsavedFiles)
    })
    ;(window as any).ipcRenderer.on("request-save-file", (event, tabId: string) => {
        const tab = tabs.value.find(t => t.id === tabId)
        if (tab) {
            if (tab.filePath) {
                ;(window as any).electronAPI
                    .fileSave(tab.content)
                    .then((result: string | null) => {
                        if (result) {
                            markTabAsSaved(tab.id)
                        }
                        ;(window as any).electronAPI.replySaveFile(!!result)
                    })
                    .catch(() => {
                        ;(window as any).electronAPI.replySaveFile(false)
                    })
            } else {
                ;(window as any).electronAPI
                    .fileSaveAs(tab.content)
                    .then((result: string | null) => {
                        if (result) {
                            markTabAsSaved(tab.id, result)
                        }
                        ;(window as any).electronAPI.replySaveFile(!!result)
                    })
                    .catch(() => {
                        ;(window as any).electronAPI.replySaveFile(false)
                    })
            }
        } else {
            ;(window as any).electronAPI.replySaveFile(false)
        }
    })
})

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown)
})
</script>

<style>
.no-scroll-bar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.no-scroll-bar::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
}
</style>
