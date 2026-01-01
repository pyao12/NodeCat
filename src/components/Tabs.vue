<template>
    <div>
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
                @click="$emit('switch-tab', tab.id)"
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
                    @click.stop="$emit('close-tab', tab.id)"
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
    </div>
</template>

<script setup lang="ts">
interface Tab {
    id: string
    filePath: string | null
    content: string
    isModified: boolean
}

interface Props {
    tabs: Tab[]
    activeTabId: string | null
    currentFilePath: string | null
}

defineProps<Props>()

defineEmits<{
    "switch-tab": [tabId: string]
    "close-tab": [tabId: string]
}>()

function getTabDisplayName(tab: Tab): string {
    if (!tab.filePath) return "Untitled"
    return tab.filePath.split("/").pop() || ""
}
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
