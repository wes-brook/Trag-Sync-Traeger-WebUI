<script setup>
import { computed } from 'vue'; // Import computed if not already

const props = defineProps({
  status: { // System status code
    type: Number,
    required: true,
    default: 99
  },
  connected: { // Whether the server considers the grill connected
      type: Boolean,
      required: true,
      default: false
  }
});

const statusColor = computed(() => {
  // If not connected, always show offline color (e.g., red) regardless of last known status
  if (!props.connected) {
      return "#C61013"; // Red for offline/disconnected
  }

  // If connected, determine color based on system status
  switch (props.status) {
    case 2: return "#3D10C6"; // Sleeping (Purple)
    case 3: return "#C6C610"; // Idle (Yellow)
    case 4: return "#10C61C"; // Igniting (Green)
    case 5: return "#10C61C"; // Preheating (Green)
    case 6: return "#10C0C6"; // Cooking (Teal/Blue)
    case 8: return "#C61013"; // Cooling (Red)
    case 9: return "#10C61C"; // Shut Down (Green - or maybe grey?)
    case 10: return "#C610B9"; // AWS ERR (Magenta)
    // Case 99 should be handled by the !props.connected check above now
    // case 99: return "#C61013";
    default: return "#808080"; // Unknown Status (Grey)
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
  /* Default background removed, relies solely on computed style */
  border-radius: 50%;
  transition: background-color 0.3s ease; /* Add smooth transition */
}
</style>