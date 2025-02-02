<script setup>
import { ref, onMounted, computed } from 'vue';
import { getGrillData } from '~/services/api';
import GrillStatusIndicator from '~/components/GrillStatusIndicator.vue';

const smokerData = ref({
  grillName: "Grill Name",
  currentTemp: 0,
  setTemp: 0,
  probeTemp: 0,
  time: "n/a",
  grillSystemStatus: 99, // Default status
});

// Computed property to determine the temperature display
const temperatureDisplay = computed(() => {
  if (smokerData.value.grillSystemStatus === 1) {
    return "---°F"; // Offline
  } else {
    return `${smokerData.value.currentTemp}°F`; // Sleeping or Idle
  }
});

// Computed property to determine the status text display
const statusTextDisplay = computed(() => {
  switch (smokerData.value.grillSystemStatus) {
    case 1: // Offline
      return "OFFLINE";
    case 2: // Sleeping
      return "SLEEPING";
    case 3: // Idle
      return "IDLE";
    case 4: // Igniting
      return "IGNITING";
    case 5: // Preheating
      return "PREHEATING";
    case 6: // Manual Cook
      return "COOKING";
    case 8: // Cool Down
        return "COOLING";
    case 9: // Shut Down
        return "SHUT DOWN";
    case 10: // Unknown Status - Server Side AWS error (bad)
        return "AWS ERR"
    default:
      return "CLIENT ERROR"; // Unknown Status - Client Side error (very bad)
  }
});

// Computed property to determine the opacity of SET TEMP and PROBE TEMP
// Opacity 1 if grillSystemStatus is 3, 4, 5, 6 or 7
const infoOpacity = computed(() => {
    return [3, 4, 5, 6, 7].includes(smokerData.value.grillSystemStatus) ? 1 : 0.5; // 100% for Idle, 50% otherwise
});

const fetchGrillData = async () => {
  const data = await getGrillData();
  if (data && data.currentTemp !== 0) {
    smokerData.value = {
      grillName: data.grillName,
      currentTemp: data.currentTemp,
      setTemp: data.setTemp,
      probeTemp: data.probeTemp,
      time: new Date(data.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/^0/, ''),
      grillSystemStatus: data.systemStatus || 99,
    };
  }
};

onMounted(() => {
  fetchGrillData();
  setInterval(fetchGrillData, 10000); // 10s refresh
});
</script>

<template>
  <!-- Grill Card -->
  <div class="grill-card">
    <!-- Grill Name -->
    <div class="grill-name">{{ smokerData.grillName }}</div>

    <!-- Grill Temperature Circle -->
    <div class="grill-temp-layer-1">
      <div class="grill-temp-layer-2">
        <span class="grill-temp">{{ temperatureDisplay }}</span>
      </div>
    </div>

    <!-- Grill Logo -->
    <div class="grill-logo">
      <img src="@/assets/grill.png" alt="Grill Logo" class="grill-logo-img" />
    </div>

    <!-- Grill Status Indicator -->
    <GrillStatusIndicator :status="smokerData.grillSystemStatus" />

    <!-- Time and Temperature Info -->
    <div class="grill-info">
      <p class="grill-time">{{ statusTextDisplay }} {{ smokerData.time }}</p>
      <p class="grill-set-temp" :style="{ opacity: infoOpacity }">SET TEMP: {{ smokerData.setTemp }}°F</p>
      <p class="grill-probe-temp" :style="{ opacity: infoOpacity }">PROBE TEMP: {{ smokerData.probeTemp }}°F</p>
    </div>
  </div>
</template>

<style scoped>
/* Grill Card */
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

.grill-time {
  position: absolute;
  width: 200px;
  height: 29px;
  left: -15px;
  top: 0;
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