import { ref, computed } from "vue"

export interface Tab {
    id: string
    filePath: string | null
    content: string
    isModified: boolean
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

export function useTabs() {
    const tabs = ref<Tab[]>([])
    const activeTabId = ref<string | null>(null)

    const activeTab = computed(() => {
        return tabs.value.find(tab => tab.id === activeTabId.value) || null
    })

    const currentFilePath = computed(() => activeTab.value?.filePath || null)
    const isModified = computed(() => activeTab.value?.isModified || false)
    const lineCount = computed(() => {
        const lines = activeTab.value?.content.split("\n") || []
        return lines.length === 1 && lines[0] === "" ? 0 : lines.length
    })

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

    function switchTab(tabId: string) {
        activeTabId.value = tabId
    }

    function getTabDisplayName(tab: Tab): string {
        if (!tab.filePath) return "Untitled"
        return tab.filePath.split("/").pop() || ""
    }

    function closeTab(tabId: string): boolean {
        const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
        if (tabIndex === -1) return false
        const tab = tabs.value[tabIndex]

        if (tab.isModified) {
            const confirmClose = confirm("You have unsaved changes. Close tab anyway?")
            if (!confirmClose) return false
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
        return true
    }

    function updateTabContent(tabId: string, content: string) {
        const tab = tabs.value.find(t => t.id === tabId)
        if (tab && tab.content !== content) {
            tab.content = content
            tab.isModified = true
        }
    }

    function markTabAsSaved(tabId: string, filePath?: string) {
        const tab = tabs.value.find(t => t.id === tabId)
        if (tab) {
            tab.isModified = false
            if (filePath) {
                tab.filePath = filePath
            }
        }
    }

    return {
        tabs,
        activeTabId,
        activeTab,
        currentFilePath,
        isModified,
        lineCount,
        createNewTab,
        switchTab,
        getTabDisplayName,
        closeTab,
        updateTabContent,
        markTabAsSaved,
    }
}
