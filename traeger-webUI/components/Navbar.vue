<script setup>
const refreshPage = (event) => {
    event.preventDefault(); 
    window.location.reload(); 
};

</script>

<template>
    <header class="header">
        <div class="header-content">
            <NuxtLink to="/" class="text-lg font-bold text-[#ffffff] hover:text-[#B0B0B0]" @click.native="refreshPage">TragSync</NuxtLink>
            <GithubButton width="30" height="30" fill="rgba(100, 100, 100, 1)" hoverFill="rgba(80, 80, 80, 1)" />
        </div>
    </header>
</template>

<style scoped>
/* Header */
.header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2em 0;
    color: #F5F5F5;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    transition: transform 0.2s cubic-bezier(0.65, 0.05, 0, 1.5);
}

.header-content {
    width: 80%; /* Keep the width constrained */
    max-width: 1200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>