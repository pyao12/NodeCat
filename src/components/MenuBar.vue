<template>
    <div class="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-2">
        <!-- File Menu -->
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
                    <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
                    New
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('open')"
                >
                    <font-awesome-icon icon="fa-solid fa-file" class="mr-2" />
                    Open
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('save')"
                >
                    <font-awesome-icon icon="fa-solid fa-floppy-disk" class="mr-2" />
                    Save
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('saveAs')"
                >
                    <font-awesome-icon icon="fa-solid fa-bookmark" class="mr-2" />
                    Save As
                </button>
                <div class="my-1 border-t border-gray-700"></div>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('quit')"
                >
                    <font-awesome-icon icon="fa-solid fa-power-off" class="mr-2" />
                    Quit
                </button>
            </div>
        </div>

        <!-- Edit Menu -->
        <div class="relative">
            <button
                class="rounded px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-700"
                @click="toggleEditMenu"
            >
                Edit
            </button>
            <div
                v-if="showEditMenu"
                class="absolute left-0 top-full z-50 mt-1 min-w-32 rounded border border-gray-700 bg-gray-800 shadow-lg"
            >
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    :disabled="!canUndo"
                    @click="closeMenuAndEmit('undo')"
                >
                    <font-awesome-icon icon="fa-solid fa-rotate-left" class="mr-2" />
                    Undo
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    :disabled="!canRedo"
                    @click="closeMenuAndEmit('redo')"
                >
                    <font-awesome-icon icon="fa-solid fa-rotate-right" class="mr-2" />
                    Redo
                </button>
                <div class="my-1 border-t border-gray-700"></div>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('cut')"
                >
                    <font-awesome-icon icon="fa-solid fa-scissors" class="mr-2" />
                    Cut
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('copy')"
                >
                    <font-awesome-icon icon="fa-solid fa-copy" class="mr-2" />
                    Copy
                </button>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('paste')"
                >
                    <font-awesome-icon icon="fa-solid fa-paste" class="mr-2" />
                    Paste
                </button>
                <div class="my-1 border-t border-gray-700"></div>
                <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-700"
                    @click="closeMenuAndEmit('selectAll')"
                >
                    <font-awesome-icon icon="fa-solid fa-object-group" class="mr-2" />
                    Select All
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
    canUndo?: boolean
    canRedo?: boolean
}>()
const emit = defineEmits<{
    new: []
    open: []
    save: []
    saveAs: []
    quit: []
    undo: []
    redo: []
    cut: []
    copy: []
    paste: []
    selectAll: []
    contentChange: [content: string]
}>()

const showFileMenu = ref(false)
const showEditMenu = ref(false)

function toggleFileMenu() {
    showFileMenu.value = !showFileMenu.value
    showEditMenu.value = false
}

function toggleEditMenu() {
    showEditMenu.value = !showEditMenu.value
    showFileMenu.value = false
}

function closeMenuAndEmit(
    event:
        | "new"
        | "open"
        | "save"
        | "saveAs"
        | "quit"
        | "undo"
        | "redo"
        | "cut"
        | "copy"
        | "paste"
        | "selectAll"
) {
    showFileMenu.value = false
    showEditMenu.value = false
    ;(emit as any)(event)
}

function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    const menuContainers = document.querySelectorAll(".relative")
    let isInsideMenu = false

    menuContainers.forEach(container => {
        if (container.contains(target)) {
            isInsideMenu = true
        }
    })

    if (!isInsideMenu) {
        showFileMenu.value = false
        showEditMenu.value = false
    }
}

onMounted(() => {
    document.addEventListener("click", handleClickOutside)
})
onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside)
})
</script>
