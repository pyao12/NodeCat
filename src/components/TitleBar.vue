<template>
    <div class="h-8 bg-gray-800 flex items-center justify-between select-none" style="-webkit-app-region: drag">
        <div class="flex-1"></div>
            <div class="flex" style="-webkit-app-region: no-drag">
                <button @click="windowMinimize" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
            </button>
            <button @click="windowMaximize" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>
            <button @click="windowClose" class="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-red-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
    const windowMinimize = window.electronAPI?.windowMinimize;
    const windowMaximize = window.electronAPI?.windowMaximize;
    const windowClose = window.electronAPI?.windowClose;
</script>