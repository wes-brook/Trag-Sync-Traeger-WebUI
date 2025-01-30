<script setup>
import { ref, onMounted } from 'vue';
import { getGrillData } from '~/services/api';

const smokerData = ref({
  grillName: "Grill Name",
  currentTemp: 0,
  setTemp: 0,
  probeTemp: 0,
  time: "LOADING..."
});

const fetchGrillData = async () => {
  const data = await getGrillData();
  if (data && data.currentTemp !== 0) {
    smokerData.value = {
      grillName: data.grillName,
      currentTemp: data.currentTemp,
      setTemp: data.setTemp,
      probeTemp: data.probeTemp,
      time: data.time,
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
          <span class="grill-temp">{{ smokerData.currentTemp }}°F</span>
        </div>
      </div>

      <!-- Grill Logo -->
      <div class="grill-logo">
        <img src="@/assets/grill.png" alt="Grill Logo" class="grill-logo-img" />
      </div>

      <!-- Grill Status Indicator -->
      <div class="grill-status-indicator"></div>

      <!-- Time and Temperature Info -->
      <div class="grill-info">
        <p class="grill-time">{{ smokerData.time }}</p>
        <p class="grill-set-temp">SET TEMP: {{ smokerData.setTemp }}°F</p>
        <p class="grill-probe-temp">PROBE TEMP: {{ smokerData.probeTemp }}°F</p>
      </div>
    </div>
</template>

<style scoped>
/* Grill Card */
.grill-card {
  position: relative; 
  width: 580px;
  height: 399px;
  background: rgba(66, 66, 66, 0.7); 
  box-shadow: 0px 4px 29.7px 18px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
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

/* Grill Status Indicator */
.grill-status-indicator {
  position: absolute;
  width: 24px;
  height: 24px;
  left: 20px; /* Relative to the grill card */
  top: 160px; /* Relative to the grill card */
  background: #10C61C;
  border-radius: 50%;
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
  width: 204px;
  height: 29px;
  left: 5px;
  top: 40px;
}

.grill-probe-temp {
  position: absolute;
  width: 228px;
  height: 29px;
  left: 20px;
  top: 80px;
}
</style>