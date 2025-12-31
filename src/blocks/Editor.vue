<template>
    <!-- eslint-disable vue/no-v-html -->
    <div class="flex h-full flex-col bg-gray-900">
        <div class="relative flex-1 overflow-hidden">
            <div class="absolute inset-0 flex">
                <div
                    ref="lineNumbersRef"
                    class="line-numbers w-10 select-none overflow-auto border-r border-gray-700 bg-gray-800 pr-2 pt-4 text-right"
                    style="scrollbar-width: none; -ms-overflow-style: none"
                    @scroll="syncScrollFromLineNumbers"
                >
                    <div
                        v-for="line in visibleLineCount"
                        :key="line"
                        class="font-mono text-xs leading-6 text-gray-500"
                    >
                        {{ line <= lineCount ? line : "" }}
                    </div>
                </div>
                <div class="relative flex-1">
                    <textarea
                        ref="textareaRef"
                        v-model="code"
                        :class="[
                            'h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-sm leading-6 caret-white focus:outline-none',
                            isComposing ? 'text-gray-200' : 'text-transparent',
                        ]"
                        spellcheck="false"
                        style="
                            word-wrap: normal;
                            white-space: pre;
                            overflow-wrap: normal;
                            min-height: 100%;
                        "
                        @input="onInput"
                        @scroll="syncScroll"
                        @keydown="handleKeyDown"
                        @compositionstart="onCompositionStart"
                        @compositionend="onCompositionEnd"
                    ></textarea>
                    <pre
                        ref="preRef"
                        class="pointer-events-none absolute inset-0 m-0 overflow-auto"
                        aria-hidden="true"
                        style="
                            white-space: pre;
                            word-wrap: normal;
                            overflow-wrap: normal;
                            min-height: 100%;
                        "
                        @scroll="syncScrollFromPre"
                    ><code
                        ref="codeRef"
                        class="font-mono text-sm leading-6 p-4 block"
                        :class="`text-white language-${selectedLanguage}`"
                        style="white-space: pre; word-wrap: normal; overflow-wrap: normal; min-height: 100%"
                        v-html="highlightedCode"
                    ></code></pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from "vue"
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-dark.css"

const props = defineProps<{
    modelValue: string
    currentFilePath?: string | null
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
}>()

const extensionLanguageMap: Record<string, string> = {
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    vue: "xml",
    jsx: "javascript",
    tsx: "typescript",
    html: "xml",
    htm: "xml",
    css: "css",
    scss: "css",
    less: "css",
    sass: "css",
    json: "json",
}

const selectedLanguage = ref("javascript")
const code = ref(props.modelValue || "")
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const preRef = ref<HTMLElement | null>(null)
const lineNumbersRef = ref<HTMLDivElement | null>(null)
const isComposing = ref(false)

const lineCount = computed(() => {
    const lines = code.value.split("\n")
    return lines.length
})

const visibleLineCount = computed(() => {
    const lines = code.value.split("\n")
    const minVisibleLines = Math.max(lines.length, 100)
    return Math.max(minVisibleLines, lines.length + 50)
})

const highlightedCode = computed(() => {
    try {
        const result = hljs.highlight(code.value, {
            language: selectedLanguage.value,
            ignoreIllegals: true,
        })
        return result.value
    } catch {
        return escapeHtml(code.value)
    }
})

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function onInput() {
    emit("update:modelValue", code.value)
}

function onCompositionStart() {
    isComposing.value = true
}

function onCompositionEnd() {
    isComposing.value = false
}

function syncScroll() {
    if (textareaRef.value && preRef.value && lineNumbersRef.value) {
        preRef.value.scrollTop = textareaRef.value.scrollTop
        preRef.value.scrollLeft = textareaRef.value.scrollLeft
        lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
    }
}

function syncScrollFromPre() {
    if (preRef.value && textareaRef.value && lineNumbersRef.value) {
        textareaRef.value.scrollTop = preRef.value.scrollTop
        textareaRef.value.scrollLeft = preRef.value.scrollLeft
        lineNumbersRef.value.scrollTop = preRef.value.scrollTop
    }
}

function syncScrollFromLineNumbers() {
    if (lineNumbersRef.value && textareaRef.value && preRef.value) {
        textareaRef.value.scrollTop = lineNumbersRef.value.scrollTop
        preRef.value.scrollTop = lineNumbersRef.value.scrollTop
    }
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Tab") {
        e.preventDefault()
        const start = (e.target as HTMLTextAreaElement).selectionStart
        const end = (e.target as HTMLTextAreaElement).selectionEnd
        const value = code.value

        const newValue = value.substring(0, start) + "    " + value.substring(end)
        code.value = newValue
        emit("update:modelValue", newValue)

        nextTick(() => {
            if (textareaRef.value) {
                textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + 4
            }
        })
    }
}

function detectLanguage(filePath: string | null | undefined) {
    if (!filePath) return
    const ext = filePath.split(".").pop()?.toLowerCase() || ""
    const lang = extensionLanguageMap[ext]
    if (lang) {
        selectedLanguage.value = lang
    }
}

watch(
    () => props.currentFilePath,
    newPath => {
        detectLanguage(newPath)
    }
)

watch(
    () => props.modelValue,
    newValue => {
        if (newValue !== code.value) {
            code.value = newValue || ""
            nextTick(() => {
                if (textareaRef.value) {
                    textareaRef.value.focus()
                }
            })
        }
    }
)

onMounted(() => {
    detectLanguage(props.currentFilePath)
})
</script>

<style>
textarea::-webkit-scrollbar,
pre::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
textarea::-webkit-scrollbar-track,
pre::-webkit-scrollbar-track {
    background: #1f2937;
}
textarea::-webkit-scrollbar-thumb,
pre::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 3px;
}
textarea::-webkit-scrollbar-thumb:hover,
pre::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}

.line-numbers::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
}
</style>
