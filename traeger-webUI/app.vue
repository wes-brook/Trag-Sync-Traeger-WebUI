<script setup>
const smokerData = {
  grillName: "THE SMOKER",
  currentTemp: 149,
  setTemp: 170,
  probeTemp: 50,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};
</script>

<template>
  <div class="h-screen bg-gradient-to-r from-slate-50 via-[25%] via-[#C3713E] to-neutral-700 flex items-center justify-center">
    <UContainer>
      <UCard class="ring-neutral-800/60 bg-neutral-800/60 text-white rounded-2xl shadow-2xl w-[580px] h-[400px] relative">
        <!-- Header -->
        <div class="flex justify-between items-center ml-[10px]">
          <div class="font-inter text-[40px] text-[#D8D8D8] font-black">{{ smokerData.grillName }}</div>
        </div>

        <!-- Temperature Circle & Info -->
        <div class="absolute left-[50px] top-[100px]">
          <!-- Temperature Circle -->
          <div class="relative flex-shrink-0 mt-1 ml-3">
            <div class="w-[24px] h-[24px] bg-[#10C61C] rounded-full mt-2 absolute"></div>
            <div class="w-[250px] h-[250px] bg-[#222222] rounded-full flex items-center justify-center border-4 border-[#B65E28]">
              <span class="font-inter text-[64px] text-[#D8D8D8] font-black italic">{{ smokerData.currentTemp }}°F</span>
            </div>
          </div>

          <!-- Time & Temperature Info -->
          <div class="absolute left-[275px] top-[0px]"> 
            <p class="font-inter text-[24px] text-[#D8D8D8] font-black italic">{{ smokerData.time }}</p>
            <p class="font-inter text-[24px] text-[#D8D8D8] font-black italic">
              <span class="font-inter text-[24px] text-[#D8D8D8] font-black italic">SET TEMP:</span> {{ smokerData.setTemp }}°F
            </p>
            <p class="font-inter text-[24px] text-[#D8D8D8] font-black italic">
              <span class="font-inter text-[24px] text-[#D8D8D8] font-black italic">PROBE TEMP:</span> {{ smokerData.probeTemp }}°F
            </p>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>