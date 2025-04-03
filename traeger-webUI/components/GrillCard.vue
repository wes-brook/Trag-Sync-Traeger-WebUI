<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { socket, isConnected } from '~/services/socketService';
import GrillStatusIndicator from '~/components/GrillStatusIndicator.vue';

// --- Reactive State ---
const smokerData = ref({
  grillName: "Connecting...",
  currentTemp: 0,
  setTemp: 0,
  probeTemp: 0,
  serverTime: null,
  lastGrillUpdate: null,
  grillTimestamp: null,
  systemStatus: 99,
  connected: false,
  units: 'F',
});

// New ref for the locally updated current time
const currentTime = ref('--:--');
// Variable to hold the interval timer ID for cleanup
let clockIntervalId = null;

// --- Computed Properties ---
const temperatureDisplay = computed(() => {
  if (!smokerData.value.connected) {
      return "---°" + (smokerData.value.units || 'F');
  } else {
      return `${smokerData.value.currentTemp}°${smokerData.value.units || 'F'}`;
  }
});

const statusTextDisplay = computed(() => {
   if (!smokerData.value.connected && smokerData.value.systemStatus === 99) {
        return "OFFLINE";
   }
  switch (smokerData.value.systemStatus) {
    case 2: return "SLEEPING";
    case 3: return "IDLE";
    case 4: return "IGNITING";
    case 5: return "PREHEATING";
    case 6: return "COOKING";
    case 8: return "COOLING";
    case 9: return "SHUT DOWN";
    case 10: return "AWS ERR";
    case 99: return "OFFLINE";
    default: return "UNKNOWN";
  }
});

const infoOpacity = computed(() => {
    return [3, 4, 5, 6].includes(smokerData.value.systemStatus) ? 1 : 0.5;
});

// --- WebSocket Update Handler ---
const handleGrillUpdate = (data) => {
  console.log('Received grillStateUpdate in component:', data);
  if (data) {
    smokerData.value = {
      grillName: data.grillName || "Grill Name",
      currentTemp: data.currentTemp ?? 0,
      setTemp: data.setTemp ?? 0,
      probeTemp: data.probeTemp ?? 0,
      serverTime: data.serverTime,
      lastGrillUpdate: data.lastGrillUpdate,
      grillTimestamp: data.grillTimestamp,
      systemStatus: data.systemStatus ?? 99,
      connected: data.connected ?? false,
      units: data.units || 'F',
    };
  } else {
    console.warn("Received empty/invalid data from grillStateUpdate event.");
  }
};

// --- Local Time Updater ---
const updateCurrentTime = () => {
    currentTime.value = new Date().toLocaleTimeString([], {
        hour: '2-digit', // e.g., '09' or '11'
        minute: '2-digit', // e.g., '05' or '30'
        // hour12: true // Optional: Set to true for AM/PM explicitly if needed
    }).replace(/^0/, ''); // Removes leading zero from hour (e.g., "09:30" -> "9:30")
};


// --- Lifecycle Hooks ---
onMounted(() => {
  console.log('GrillCard mounted. Setting up listeners and clock.');

  // Setup WebSocket listeners
  socket.on('grillStateUpdate', handleGrillUpdate);
  socket.on('grillStatus', (statusMsg) => {
     console.log('Received initial grillStatus:', statusMsg);
     if (statusMsg.status !== 'ok' && !isConnected.value) {
         smokerData.value.grillName = statusMsg.status.toUpperCase();
     }
  });

  // Setup local clock interval
  updateCurrentTime(); // Update time immediately on mount
  clockIntervalId = setInterval(updateCurrentTime, 1000); // Update every second

});

onUnmounted(() => {
  console.log('GrillCard unmounted. Removing listeners and clock.');

  // Clean up WebSocket listeners
  socket.off('grillStateUpdate', handleGrillUpdate);
  socket.off('grillStatus');

  // Clean up the clock interval timer
  if (clockIntervalId) {
    clearInterval(clockIntervalId);
  }
});

</script>

<template>
  <div class="grill-card">
    <div class="grill-name">{{ smokerData.grillName }}</div>

    <div class="grill-temp-layer-1">
      <div class="grill-temp-layer-2">
        <span class="grill-temp">{{ temperatureDisplay }}</span>
      </div>
    </div>

    <div class="grill-logo">
      <img src="@/assets/grill.png" alt="Grill Logo" class="grill-logo-img" />
    </div>

    <GrillStatusIndicator :status="smokerData.systemStatus" :connected="smokerData.connected" />

    <div class="grill-info">
      <p class="grill-time">{{ statusTextDisplay }} {{ currentTime }}</p>

      <p class="grill-set-temp" :style="{ opacity: infoOpacity }">SET TEMP: {{ smokerData.setTemp }}°{{ smokerData.units || 'F' }}</p>
      <p class="grill-probe-temp" :style="{ opacity: infoOpacity }">PROBE TEMP: {{ smokerData.probeTemp }}°{{ smokerData.units || 'F' }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Styles remain the same */
.grill-card {
  position: relative;
  width: 580px;
  height: 399px;
  background: rgba(0, 0, 0, 0.25);
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.27);
  border-radius: 20px;
  backdrop-filter: blur(18.5px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Grill Name */
.grill-name {
  position: absolute;
  max-width: calc(100% - 100px);
  height: 48px;
  left: 35px; /* Relative to the grill card */
  top: 30px; /* Relative to the grill card */
  font-family: 'Inter';
  font-style: normal;
  font-weight: 900;
  font-size: 40px;
  line-height: 48px;
  color: #D8D8D8;
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Hides overflow */
  text-overflow: ellipsis; /* Adds ellipsis for overflow text */
}

/* Grill Temperature Circle */
.grill-temp-layer-1 {
  position: absolute;
  width: 250px;
  height: 250px;
  left: 50px; /* Relative to the grill card */
  top: 100px; /* Relative to the grill card */
  background: rgba(182, 94, 40, 0.99);
  border-radius: 50%;
}

.grill-temp-layer-2 {
  position: absolute;
  width: 240px;
  height: 240px;
  left: 5px; /* Center inside layer 1 */
  top: 5px; /* Center inside layer 1 */
  background: #222222;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grill-temp {
  font-family: 'Inter';
  font-style: italic;
  font-weight: 900;
  font-size: 64px;
  line-height: 77px;
  color: #D8D8D8;
}

/* Grill Logo */
.grill-logo {
  position: absolute;
  width: 26.23px;
  height: 27.16px;
  left: 45px; /* Relative to the grill card */
  top: 110px; /* Relative to the grill card */
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  opacity: 75%;
}

.grill-logo-img {
  width: 100%;
  height: 100%;
}

/* Time and Temperature Info */
.grill-info {
  position: absolute;
  left: 300px; /* Relative to the grill card */
  top: 110px; /* Relative to the grill card */
  font-family: 'Inter';
  font-style: italic;
  font-weight: 900;
  font-size: 24px;
  line-height: 29px;
  color: #D8D8D8;
}

/* Modified to hold Status + Time */
.grill-time {
  position: absolute;
  width: 300px; /* Adjust width if needed */
  height: 29px;
  left: -15px;
  top: 0;
  white-space: nowrap; /* Prevent wrapping */
}

.grill-set-temp {
  position: absolute;
  width: 250px;
  height: 29px;
  left: 5px;
  top: 40px;
  transition: opacity 0.3s ease;
}

.grill-probe-temp {
  position: absolute;
  width: 228px;
  height: 29px;
  left: 20px;
  top: 80px;
  transition: opacity 0.3s ease;
}
</style>