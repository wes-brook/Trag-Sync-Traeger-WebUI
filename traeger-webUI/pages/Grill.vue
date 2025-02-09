<script setup>
import GrillCard from "~/components/GrillCard.vue"; 
</script>

<template>
  <div class="traeger-background">
    <GrillCard />
  </div>
</template>

<style scoped>
.traeger-background {
  position: relative;
  width: 100vw; /* Full viewport width */
  height: 100vh; /* Full viewport height */
  background: linear-gradient(90deg, #FFFFFF 0%, rgba(196, 113, 62, 0.99) 34.5%, #000000 99.99%);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>