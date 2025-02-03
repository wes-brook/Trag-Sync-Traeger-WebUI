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
    // case 1: // Offline
    //   return "#C61013";
    case 2: // Sleeping
      return "#3D10C6";
    case 3: // Idle
      return "#C6C610";
    case 4: // Igniting
      return "#10C61C";
    case 5: // Preheating
      return "#10C61C"
    case 6: // Manual Cooking (Cooking)
      return "#10C0C6";
    case 8: // Cooling
      return "#C61013";
    case 9: // Shutdown
      return "#10C61C"
    case 10: // Unknown Status - Server Side AWS error (bad)
      return "#C610B9";
    case 99: // think this means server online but grill is physically off (unplugged or plugged but switched off)
      return "#C61013";
    default:
      return "#000000"; // Unknown Status - Client Side error (very bad)
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