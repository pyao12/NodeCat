<template>
    <div class="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-2">
        <div class="relative">
            <button
                class="rounded px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-700"
                @click="toggleFileMenu"
            >
                File
            </button>
            <div
                v-if="showFileMenu"
                class="absolute left-0 top-full z-50 mt-1 min-w-32 rounded border border-gray-700 bg-gray-800 shadow-lg"
            >
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('new')"
                >
                    New
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('open')"
                >
                    Open
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('save')"
                >
                    Save
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('saveAs')"
                >
                    Save As
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
defineProps<{
    content: string
    currentFilePath: string | null
    isModified: boolean
}>()
const emit = defineEmits<{
    new: []
    open: []
    save: []
    saveAs: []
    contentChange: [content: string]
}>()

const showFileMenu = ref(false)
function toggleFileMenu() {
    showFileMenu.value = !showFileMenu.value
}

function closeMenuAndEmit(event: "new" | "open" | "save" | "saveAs") {
    showFileMenu.value = false
    ;(emit as any)(event)
}

function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest(".relative")) {
        showFileMenu.value = false
    }
}

onMounted(() => {
    document.addEventListener("click", handleClickOutside)
})
onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside)
})
</script>
