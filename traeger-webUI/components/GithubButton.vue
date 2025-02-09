<template>
    <a href="https://github.com/wes-brook/Traeger-WebUI/tree/main" target="_blank" rel="noopener noreferrer">
        <svg 
            :style="{ fill: currentFill }" 
            :width="width" 
            :height="height" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            @mouseenter="currentFill = hoverFill"
            @mouseleave="currentFill = fill"
        >
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M12 .296c-6.63 0-12 5.372-12 12 0 5.303 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577v-2.165c-3.338.724-4.033-1.416-4.033-1.416-.547-1.39-1.335-1.758-1.335-1.758-1.091-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.834 2.809 1.304 3.495.996.108-.775.418-1.305.762-1.605-2.665-.302-5.466-1.332-5.466-5.93 0-1.31.469-2.383 1.235-3.222-.123-.303-.535-1.52.116-3.163 0 0 1.008-.322 3.3 1.23a11.61 11.61 0 013.005-.404c1.02.005 2.047.138 3.005.404 2.291-1.552 3.3-1.23 3.3-1.23.653 1.643.24 2.86.117 3.163.77.839 1.234 1.912 1.234 3.222 0 4.61-2.807 5.625-5.479 5.922.43.372.823 1.104.823 2.226v3.293c0 .32.192.693.8.577C20.565 22.094 24 17.598 24 12.296c0-6.628-5.373-12-12-12z" />
        </svg>
    </a>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    width: {
        type: String,
        default: "20"
    },
    height: {
        type: String,
        default: "20"
    },
    fill: {
        type: String,
        default: "rgba(216, 216, 216, 1)" 
    },
    hoverFill: {
        type: String,
        default: "rgba(176, 176, 176, 1)" 
    },
});

const currentFill = ref(props.fill);
</script>