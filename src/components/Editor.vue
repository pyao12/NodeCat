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
    .hljs {
        color: #d4d4d4;
        background: transparent;
    }
    .hljs-keyword {
        color: #569cd6;
    }
    .hljs-string {
        color: #ce9178;
    }
    .hljs-number {
        color: #b5cea8;
    } 
    .hljs-comment {
        color: #6a9955;
    }
    .hljs-function {
        color: #dcdcaa;
    }
    .hljs-class {
        color: #4ec9b0;
    }
    .hljs-variable {
        color: #9cdcfe;
    }
    .hljs-operator {
        color: #d4d4d4;
    }
    .hljs-punctuation {
        color: #d4d4d4;
    }
    .hljs-property {
        color: #9cdcfe;
    }
    .hljs-tag {
        color: #569cd6;
    }
    .hljs-attr {
        color: #9cdcfe;
    }
    .hljs-title {
        color: #dcdcaa;
    }
    .hljs-built_in {
        color: #4ec9b0;
    }
</style>
