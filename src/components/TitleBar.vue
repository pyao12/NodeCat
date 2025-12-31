<template>
    <div
        class="flex h-8 select-none items-center justify-between bg-gray-800"
        style="-webkit-app-region: drag"
    >
        <div class="flex-1"></div>
        <div class="flex" style="-webkit-app-region: no-drag">
            <button
                class="flex h-8 w-8 items-center justify-center text-gray-300 transition-colors hover:bg-gray-700"
                @click="windowMinimize"
            >
                <font-awesome-icon icon="fa-solid fa-minimize" />
            </button>
            <button
                class="flex h-8 w-8 items-center justify-center text-gray-300 transition-colors hover:bg-gray-700"
                @click="windowMaximize"
            >
                <font-awesome-icon icon="fa-solid fa-window-maximize" />
            </button>
            <button
                class="flex h-8 w-8 items-center justify-center text-gray-300 transition-colors hover:bg-red-600"
                @click="windowClose"
            >
                <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
const windowMinimize = window.electronAPI?.windowMinimize
const windowMaximize = window.electronAPI?.windowMaximize
const windowClose = window.electronAPI?.windowClose
</script>
