<!-- GrillStatusIndicator.vue -->
<script setup>
const props = defineProps({
  status: {
    type: Number,
    required: true,
  },
});

const statusColor = computed(() => {
  switch (props.status) {
    case 1: // Offline
      return "#C61013";
    case 2: // Sleeping
      return "#3D10C6";
    case 3: // Idle
      return "#C6C610";
    // need to add 4-9 here except 7
    default:
      return "#C610B9"; // Default color for unknown status
  }
});
</script>

<template>
  <div class="grill-status-indicator" :style="{ backgroundColor: statusColor }" />
</template>

<style scoped>
.grill-status-indicator {
  position: absolute;
  width: 24px;
  height: 24px;
  left: 20px; /* Relative to the grill card */
  top: 160px; /* Relative to the grill card */
  background: #10C61C;
  border-radius: 50%;
}
</style>