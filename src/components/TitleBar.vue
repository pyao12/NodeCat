<template>
    <div class="h-8 bg-gray-800 flex items-center justify-between select-none" style="-webkit-app-region: drag">
        <div class="flex-1"></div>
        <div class="flex" style="-webkit-app-region: no-drag">
            <button @click="windowMinimize" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors">
                <font-awesome-icon icon="fa-solid fa-minimize" />
            </button>
            <button @click="windowMaximize" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors">
                <font-awesome-icon icon="fa-solid fa-window-maximize" />
            </button>
            <button @click="windowClose" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-red-600 transition-colors">
                <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
    const windowMinimize = window.electronAPI?.windowMinimize;
    const windowMaximize = window.electronAPI?.windowMaximize;
    const windowClose = window.electronAPI?.windowClose;
</script>