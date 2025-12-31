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
                <div
                    class="no-scroll-bar flex items-center overflow-x-auto border-b border-gray-700 bg-gray-800"
                >
                    <div
                        v-for="tab in tabs"
                        :key="tab.id"
                        class="flex cursor-pointer items-center whitespace-nowrap border-r border-gray-700 px-4 py-2 text-sm transition-colors"
                        :class="
                            tab.id === activeTabId
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        "
                        @click="switchTab(tab.id)"
                    >
                        <span class="mr-1 truncate">
                            {{ getTabDisplayName(tab) }}
                        </span>
                        <span v-if="tab.isModified" class="text-red-400">
                            <font-awesome-icon icon="fa-solid fa-circle-dot" />
                        </span>
                        <button
                            class="ml-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                            title="Close tab"
                            @click.stop="closeTab(tab.id)"
                        >
                            <font-awesome-icon icon="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>
                <div
                    v-if="currentFilePath"
                    class="truncate border-b border-gray-700 bg-gray-800 px-4 py-1 text-xs text-gray-500"
                >
                    {{ currentFilePath }}
                </div>
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
import Editor from "./blocks/Editor.vue"

interface Tab {
    id: string
    filePath: string | null
    content: string
    isModified: boolean
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

const tabs = ref<Tab[]>([])
const activeTabId = ref<string | null>(null)
const activeTab = computed(() => {
    return tabs.value.find(tab => tab.id === activeTabId.value) || null
})

const content = computed({
    get: () => activeTab.value?.content || "",
    set: value => {
        if (activeTab.value) {
            activeTab.value.content = value
            activeTab.value.isModified = true
        }
    },
})

const currentFilePath = computed(() => activeTab.value?.filePath || null)
const isModified = computed(() => activeTab.value?.isModified || false)
const lineCount = computed(() => {
    const lines = content.value.split("\n")
    return lines.length === 1 && lines[0] === "" ? 0 : lines.length
})

const canUndo = ref(false)
const canRedo = ref(false)

function createNewTab(filePath: string | null = null, initialContent: string = ""): Tab {
    const newTab: Tab = {
        id: generateId(),
        filePath,
        content: initialContent,
        isModified: false,
    }
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    return newTab
}

createNewTab()

function switchTab(tabId: string) {
    activeTabId.value = tabId
}

function getTabDisplayName(tab: Tab): string {
    if (!tab.filePath) return "Untitled"
    return tab.filePath.split("/").pop() || ""
}

function closeTab(tabId: string) {
    const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
    if (tabIndex === -1) return
    const tab = tabs.value[tabIndex]
    if (tab.isModified) {
        const confirmClose = confirm("You have unsaved changes. Close tab anyway?")
        if (!confirmClose) return
    }

    tabs.value.splice(tabIndex, 1)
    if (tabId === activeTabId.value) {
        if (tabs.value.length > 0) {
            const newActiveIndex = Math.min(tabIndex, tabs.value.length - 1)
            activeTabId.value = tabs.value[newActiveIndex].id
        } else {
            createNewTab()
        }
    }
}

function handleNew() {
    createNewTab()
}

async function handleOpen() {
    try {
        const result = await (window as any).electronAPI.fileOpen()
        if (result) {
            const existingTab = tabs.value.find(tab => tab.filePath === result.filePath)
            if (existingTab) {
                activeTabId.value = existingTab.id
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
            activeTab.value.isModified = false
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
            activeTab.value.filePath = result
            activeTab.value.isModified = false
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
                            tab.isModified = false
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
                            tab.filePath = result
                            tab.isModified = false
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
