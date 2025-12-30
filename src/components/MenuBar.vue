<template>
    <div class="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div class="relative">
            <button
                @click="toggleFileMenu"
                class="px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
            >
                File
            </button>
            <div
                v-if="showFileMenu"
                class="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-32"
            >
                <button
                    @click="closeMenuAndEmit('new')"
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                    New
                </button>
                <button
                    @click="closeMenuAndEmit('open')"
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                    Open
                </button>
                <button
                    @click="closeMenuAndEmit('save')"
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                    Save
                </button>
                <button
                    @click="closeMenuAndEmit('saveAs')"
                    class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                    Save As
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted, onUnmounted } from "vue";
    defineProps<{
        content: string;
        currentFilePath: string | null;
        isModified: boolean;
    }>();
    const emit = defineEmits<{
        new: [];
        open: [];
        save: [];
        saveAs: [];
        contentChange: [content: string];
    }>();

    const showFileMenu = ref(false);
    function toggleFileMenu() {
        showFileMenu.value = !showFileMenu.value;
    }

    function closeMenuAndEmit(event: "new" | "open" | "save" | "saveAs") {
        showFileMenu.value = false;
        (emit as any)(event);
    }

    function handleClickOutside(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest(".relative")) {
            showFileMenu.value = false;
        }
    }

    onMounted(() => {
        document.addEventListener("click", handleClickOutside);
    });
    onUnmounted(() => {
        document.removeEventListener("click", handleClickOutside);
    });
</script>