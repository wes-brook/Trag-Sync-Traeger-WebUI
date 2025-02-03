<script setup>

</script>

<template>
    <div class="home">
        <!-- Background -->
        <div class="background"></div>

        <!-- Header -->
        <header class="header flex justify-between items-center p-4 bg-gray-800 text-white">
            <!-- Home Button -->
            <NuxtLink to="/" class="text-lg font-bold">Home</NuxtLink>

            <!-- GitHub Link -->
            <a href="https://github.com/wes-brook/Traeger-WebUI/tree/main" target="_blank" rel="noopener noreferrer">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M12 .296c-6.63 0-12 5.372-12 12 0 5.303 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577v-2.165c-3.338.724-4.033-1.416-4.033-1.416-.547-1.39-1.335-1.758-1.335-1.758-1.091-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.834 2.809 1.304 3.495.996.108-.775.418-1.305.762-1.605-2.665-.302-5.466-1.332-5.466-5.93 0-1.31.469-2.383 1.235-3.222-.123-.303-.535-1.52.116-3.163 0 0 1.008-.322 3.3 1.23a11.61 11.61 0 013.005-.404c1.02.005 2.047.138 3.005.404 2.291-1.552 3.3-1.23 3.3-1.23.653 1.643.24 2.86.117 3.163.77.839 1.234 1.912 1.234 3.222 0 4.61-2.807 5.625-5.479 5.922.43.372.823 1.104.823 2.226v3.293c0 .32.192.693.8.577C20.565 22.094 24 17.598 24 12.296c0-6.628-5.373-12-12-12z" />
                </svg>
            </a>
        </header>


        <!-- Landing Title -->
        <h1 class="landing-title">Finally, a way to monitor my pellet smoker on the web</h1>

        <!-- Landing Description -->
        <p class="landing-description">Your favorite pellet smoker company doesn’t have an official web solution to monitor your grill, so I made one myself.</p>

        <!-- Get Started Button -->
        <div class="buttons">
            <div class="get-started-button">
                <NuxtLink to="/grill" class="button-text">Get Started</NuxtLink>
            </div>
            <a href="https://github.com" class="github-link"></a>
        </div>

        <!-- Section Divider Background -->>
        <div class="section-divider-background">

        </div>

        <!-- Footer -->
        <footer class="footer">
            <p class="footer-text">© Wesly Barayuga | MIT License</p>
        </footer>
    </div>
</template>

<style scoped>
.home {
    display: flex;
    flex-direction: column;
}

/* Background */
.background {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: linear-gradient(90deg, #535353 0.01%, rgba(196, 113, 62, 0.99) 65.5%, #ffffff 100%);
    z-index: -1;
}

/* Landing Title */
.landing-title {
    position: absolute;
    width: 1366px;
    height: 232px;
    left: calc(50% - 1366px / 2);
    top: 270px;
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 900;
    font-size: 96px;
    line-height: 116px;
    text-align: center;
    color: #000000;
    opacity: 0.9;
}

/* Landing Description */
.landing-description {
    position: absolute;
    width: 1169px;
    height: 78px;
    left: calc(50% - 1169px / 2);
    top: 553px;
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 32px;
    line-height: 39px;
    text-align: center;
    color: #000000;
    opacity: 0.7;
}

/* Get Started Button */
.get-started-button {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 12px;
    gap: 8px;
    position: absolute;
    width: 134px;
    height: 47px;
    left: calc(50% - 134px / 2);
    top: 660px;
    background: #2c2c2c;
    border: 1px solid #2c2c2c;
    border-radius: 20px;
    cursor: pointer;
}

.button-text {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 100%;
    color: #f5f5f5;
}

/* Footer */
.footer {
    position: absolute;
    width: 100%;
    height: 64px;
    left: 0;
    top: calc(100% - 64px);
    background: rgba(0, 0, 0, 0.25);
    opacity: 0.5;
    display: flex;
    justify-content: center;
    align-items: center;
}

.footer-text {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    color: #000000;
    opacity: 0.6;
}

/* Header */
.header {
    position: absolute;
    width: 100%;
    height: 64px;
    left: 0px;
    top: 0px;

    background: rgba(0, 0, 0, 0.25);
    opacity: 0.5;

}

.header-text {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    color: #000000;
    opacity: 0.6;
}

/* Section Divider Background*/
.section-divider-background {
position: absolute;
width: 4132px;
height: 1088.66px;
left: -665px;
top: 1107.06px;

background: #FFFFFF;
transform: rotate(-8deg);
}
</style>
