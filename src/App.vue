<template>
    <div class="h-screen flex flex-col bg-gray-900">
        <TitleBar />
        <MenuBar
            :content="content"
            :current-file-path="currentFilePath"
            :is-modified="isModified"
            @new="handleNew"
            @open="handleOpen"
            @save="handleSave"
            @save-as="handleSaveAs"
        />
        <div class="flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto no-scroll-bar">
                <div
                    v-for="tab in tabs"
                    :key="tab.id"
                    class="flex items-center px-4 py-2 text-sm cursor-pointer whitespace-nowrap border-r border-gray-700 transition-colors"
                    :class="tab.id === activeTabId ? 'bg-gray-900 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
                    @click="switchTab(tab.id)"
                >
                    <span class="mr-1 truncate">
                        {{ tab.filePath ? tab.filePath.split('/').pop() : 'Untitled' }}
                    </span>
                    <span v-if="tab.isModified" class="text-red-400">●</span>
                    <button
                        class="ml-2 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                        @click.stop="closeTab(tab.id)"
                        title="Close tab"
                    >
                        ×
                    </button>
                </div>
            </div>
            <div
                v-if="currentFilePath"
                class="px-4 py-1 bg-gray-800 text-xs text-gray-500 border-b border-gray-700 truncate"
            >
                {{ currentFilePath }}
            </div>
            <Editor 
                v-model="content" 
                :current-file-path="currentFilePath"
                ref="editorRef"
            />
        </div>
        <div class="flex items-center justify-between px-4 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
            <span>{{ isModified ? "Modified" : "Saved" }}</span>
            <span>{{ lineCount }} lines</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
import TitleBar from "./components/TitleBar.vue";
import MenuBar from "./components/MenuBar.vue";
import Editor from "./components/Editor.vue";

interface Tab {
    id: string;
    filePath: string | null;
    content: string;
    isModified: boolean;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

const tabs = ref<Tab[]>([]);
const activeTabId = ref<string | null>(null);
const activeTab = computed(() => {
    return tabs.value.find(tab => tab.id === activeTabId.value) || null;
});

const content = computed({
    get: () => activeTab.value?.content || "",
    set: (value) => {
        if (activeTab.value) {
            activeTab.value.content = value;
            activeTab.value.isModified = true;
        }
    }
});

const currentFilePath = computed(() => activeTab.value?.filePath || null);
const isModified = computed(() => activeTab.value?.isModified || false);
const lineCount = computed(() => {
    const lines = content.value.split("\n");
    return lines.length === 1 && lines[0] === "" ? 0 : lines.length;
});

function createNewTab(filePath: string | null = null, initialContent: string = ""): Tab {
    const newTab: Tab = {
        id: generateId(),
        filePath,
        content: initialContent,
        isModified: false
    };
    tabs.value.push(newTab);
    activeTabId.value = newTab.id;
    return newTab;
}

createNewTab();

function switchTab(tabId: string) {
    activeTabId.value = tabId;
}

function closeTab(tabId: string) {
    const tabIndex = tabs.value.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;
    const tab = tabs.value[tabIndex];
    if (tab.isModified) {
        const confirmClose = confirm("You have unsaved changes. Close tab anyway?");
        if (!confirmClose) return;
    }

    tabs.value.splice(tabIndex, 1);
    if (tabId === activeTabId.value) {
        if (tabs.value.length > 0) {
            const newActiveIndex = Math.min(tabIndex, tabs.value.length - 1);
            activeTabId.value = tabs.value[newActiveIndex].id;
        } else {
            createNewTab();
        }
    }
}

function handleNew() {
    createNewTab();
}

async function handleOpen() {
    try {
        const result = await (window as any).electronAPI.fileOpen();
        if (result) {
            const existingTab = tabs.value.find(tab => tab.filePath === result.filePath);
            if (existingTab) {
                activeTabId.value = existingTab.id;
            } else {
                createNewTab(result.filePath, result.content);
            }
        }
    } catch (error) {
        console.error("Failed to open file:", error);
    }
}

async function handleSave() {
    if (!activeTab.value) return;
    if (!activeTab.value.filePath) {
        await handleSaveAs();
        return;
    }
    try {
        const result = await (window as any).electronAPI.fileSave(activeTab.value.content);
        if (result) {
            activeTab.value.isModified = false;
        }
    } catch (error) {
        console.error("Failed to save file:", error);
    }
}

async function handleSaveAs() {
    if (!activeTab.value) return;
    try {
        const result = await (window as any).electronAPI.fileSaveAs(activeTab.value.content);
        if (result) {
            activeTab.value.filePath = result;
            activeTab.value.isModified = false;
        }
    } catch (error) {
        console.error("Failed to save file:", error);
    }
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        handleNew();
    } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        handleOpen();
    } else if (event.ctrlKey && event.key === "s" && !event.shiftKey) {
        event.preventDefault();
        handleSave();
    } else if (event.ctrlKey && event.shiftKey && event.key === "s") {
        event.preventDefault();
        handleSaveAs();
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
    
    (window as any).ipcRenderer.on("request-unsaved-files", () => {
        const unsavedFiles = tabs.value
            .filter(tab => tab.isModified)
            .map(tab => ({
                id: tab.id,
                name: tab.filePath ? tab.filePath.split("/").pop() : 'Untitled'
            }));
        (window as any).electronAPI.replyUnsavedFiles(unsavedFiles);
    });

    (window as any).ipcRenderer.on("request-save-file", (event, tabId: string) => {
        const tab = tabs.value.find(t => t.id === tabId);
        if (tab) {
            if (tab.filePath) {
                (window as any).electronAPI.fileSave(tab.content).then((result: string | null) => {
                    if (result) {
                        tab.isModified = false;
                    }
                    (window as any).electronAPI.replySaveFile(!!result);
                }).catch(() => {
                    (window as any).electronAPI.replySaveFile(false);
                });
            } else {
                (window as any).electronAPI.fileSaveAs(tab.content).then((result: string | null) => {
                    if (result) {
                        tab.filePath = result;
                        tab.isModified = false;
                    }
                    (window as any).electronAPI.replySaveFile(!!result);
                }).catch(() => {
                    (window as any).electronAPI.replySaveFile(false);
                });
            }
        } else {
            (window as any).electronAPI.replySaveFile(false);
        }
    });
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
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