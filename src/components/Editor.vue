<template>
    <div class="h-full flex flex-col bg-gray-900">
        <div class="flex-1 relative overflow-hidden">
            <div class="absolute inset-0 flex">
                <div class="w-10 bg-gray-800 border-r border-gray-700 text-right pr-2 pt-4 select-none">
                    <div
                        v-for="line in lineCount"
                        :key="line"
                        class="text-xs text-gray-500 leading-6 font-mono"
                    >
                        {{ line }}
                    </div>
                </div>
                <div class="flex-1 relative">
                    <textarea
                        ref="textareaRef"
                        v-model="code"
                        class="w-full h-full bg-gray-900 text-gray-200 font-mono text-sm leading-6 p-4 resize-none focus:outline-none"
                        spellcheck="false"
                        @input="onInput"
                        @scroll="syncScroll"
                        @keydown="handleKeyDown"
                    ></textarea>
                    <pre
                        ref="preRef"
                        class="absolute inset-0 pointer-events-none m-0"
                        aria-hidden="true"
                    ><code
                        ref="codeRef"
                        class="font-mono text-sm leading-6 p-4 block"
                        :class="`text-white language-${selectedLanguage}`"
                        v-html="highlightedCode"
                    ></code></pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed, watch, onMounted, nextTick } from "vue";
    import hljs from "highlight.js";
    import "highlight.js/styles/atom-one-dark.css";

    const props = defineProps<{
        modelValue: string;
        currentFilePath?: string | null;
    }>();

    const emit = defineEmits<{
        "update:modelValue": [value: string];
    }>();

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
    };

    const selectedLanguage = ref("javascript");
    const code = ref(props.modelValue || "");
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const preRef = ref<HTMLElement | null>(null);

    const lineCount = computed(() => {
        const lines = code.value.split("\n");
        return lines.length;
    });

    const highlightedCode = computed(() => {
        try {
            const result = hljs.highlight(code.value, {
                language: selectedLanguage.value,
                ignoreIllegals: true,
            });
            return result.value;
        } catch {
            return escapeHtml(code.value);
        }
    });

    function escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function onInput() {
        emit("update:modelValue", code.value);
    }

    function syncScroll() {
        if (textareaRef.value && preRef.value) {
            preRef.value.scrollTop = textareaRef.value.scrollTop;
            preRef.value.scrollLeft = textareaRef.value.scrollLeft;
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = (e.target as HTMLTextAreaElement).selectionStart;
            const end = (e.target as HTMLTextAreaElement).selectionEnd;
            const value = code.value;
            
            const newValue = value.substring(0, start) + "    " + value.substring(end);
            code.value = newValue;
            emit("update:modelValue", newValue);
            
            nextTick(() => {
                if (textareaRef.value) {
                    textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + 4;
                }
            });
        }
    }

    function detectLanguage(filePath: string | null | undefined) {
        if (!filePath) return;
        const ext = filePath.split(".").pop()?.toLowerCase() || "";
        const lang = extensionLanguageMap[ext];
        if (lang) {
            selectedLanguage.value = lang;
        }
    }

    watch(
        () => props.currentFilePath,
        (newPath) => {
            detectLanguage(newPath);
        }
    );

    watch(
        () => props.modelValue,
        (newValue) => {
            if (newValue !== code.value) {
                code.value = newValue || "";
                nextTick(() => {
                    if (textareaRef.value) {
                        textareaRef.value.focus();
                    }
                });
            }
        }
    );

    onMounted(() => {
        detectLanguage(props.currentFilePath);
    });
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
</style>
