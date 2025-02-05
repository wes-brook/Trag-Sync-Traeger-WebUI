<script setup>
import { animate, spring} from "motion";
import { ref, onMounted } from 'vue';

const leftTitle = ref(null);
const leftDescription = ref(null);
const rightTitle = ref(null);
const rightDescription = ref(null);
let hasAnimated = false;

const handleScroll = () => {
  if (!hasAnimated && window.scrollY > 50) { // start landing-section-divider animation on first downward scroll
    hasAnimated = true;

    // Animate left column elements
    animate(leftTitle.value, { x: [150, 0], opacity: [0, 1] }, { type: spring, bounce: 0.5, duration: 0.8 });
    animate(leftDescription.value, { x: [150, 0], opacity: [0, 0.5] }, { type: spring, bounce: 0.3, duration: 0.8 });

    // Animate right column elements
    animate(rightTitle.value, { x: [-150, 0], opacity: [0, 1] }, { type: spring, bounce: 0.5, duration: 0.8 });
    animate(rightDescription.value, { x: [-150, 0], opacity: [0, 0.5] }, { type: spring, bounce: 0.3, duration: 0.8 });

    window.removeEventListener("scroll", handleScroll); // Remove event listener after animation
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const refreshPage = (event) => {
    event.preventDefault(); 
    window.location.reload(); 
};
</script>

<template>
    <div id="app">
        <!-- Background -->
        <div class="background"></div>

        <!-- Container for constrained content -->
        <div class="container">
            <!-- Header -->
            <header class="header">
                <div class="header-content">
                    <NuxtLink to="/" class="text-base font-bold text-[#D8D8D8] hover:text-[#B0B0B0]" @click.native="refreshPage">TW</NuxtLink>
                    <a href="https://github.com/wes-brook/Traeger-WebUI/tree/main" target="_blank" rel="noopener noreferrer">
                        <svg class="w-5 h-5 hover:fill-[#737373]" fill="#D8D8D8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M12 .296c-6.63 0-12 5.372-12 12 0 5.303 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577v-2.165c-3.338.724-4.033-1.416-4.033-1.416-.547-1.39-1.335-1.758-1.335-1.758-1.091-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.834 2.809 1.304 3.495.996.108-.775.418-1.305.762-1.605-2.665-.302-5.466-1.332-5.466-5.93 0-1.31.469-2.383 1.235-3.222-.123-.303-.535-1.52.116-3.163 0 0 1.008-.322 3.3 1.23a11.61 11.61 0 013.005-.404c1.02.005 2.047.138 3.005.404 2.291-1.552 3.3-1.23 3.3-1.23.653 1.643.24 2.86.117 3.163.77.839 1.234 1.912 1.234 3.222 0 4.61-2.807 5.625-5.479 5.922.43.372.823 1.104.823 2.226v3.293c0 .32.192.693.8.577C20.565 22.094 24 17.598 24 12.296c0-6.628-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </header>

            <!-- Landing Section -->
            <div class="landing-content">
                <h1 class="landing-title animate-text">Finally, a way to monitor <br> my pellet smoker on the web</h1>
                <p class="landing-description animate-text">
                    Your favorite pellet smoker company doesn’t have an official web solution to
                    <br> monitor your grill, so I made one myself.
                </p>
                <div class="flex items-center justify-center animate-text">
                    <NuxtLink to="/grill" class="get-started-button">
                        <span class="button-text">Get Started</span>
                    </NuxtLink>
                    <a href="https://github.com/wes-brook/Traeger-WebUI/tree/main" target="_blank" rel="noopener noreferrer">
                        <svg class="w-11 h-11 hover:fill-[#B0B0B0]" fill="#D8D8D8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M12 .296c-6.63 0-12 5.372-12 12 0 5.303 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577v-2.165c-3.338.724-4.033-1.416-4.033-1.416-.547-1.39-1.335-1.758-1.335-1.758-1.091-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.834 2.809 1.304 3.495.996.108-.775.418-1.305.762-1.605-2.665-.302-5.466-1.332-5.466-5.93 0-1.31.469-2.383 1.235-3.222-.123-.303-.535-1.52.116-3.163 0 0 1.008-.322 3.3 1.23a11.61 11.61 0 013.005-.404c1.02.005 2.047.138 3.005.404 2.291-1.552 3.3-1.23 3.3-1.23.653 1.643.24 2.86.117 3.163.77.839 1.234 1.912 1.234 3.222 0 4.61-2.807 5.625-5.479 5.922.43.372.823 1.104.823 2.226v3.293c0 .32.192.693.8.577C20.565 22.094 24 17.598 24 12.296c0-6.628-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>

        <!-- Section Divider -->
        <section class="section-with-background">
            <div class="flex items-center justify-evenly">
                <!-- Left Column -->
                <div class="flex flex-col justify-end items-end text-right mt-[18rem]">
                    <p ref="leftDescription" class="landing-section-description">
                        With this custom web interface you can grill<br>like a pro, even when you’re away from the smoker.
                    </p>
                    <h2 ref="leftTitle" class="landing-section-title">Monitor Your Grill<br>Anytime, Anywhere</h2>
                </div>
            
                <!-- Center Image -->
                <img src="../assets/traeger_web-ui-app.png" 
                    alt="grill app" 
                    class="max-w-[45%] min-w-[200px] rounded-[20px] 
                           shadow-[0px_4px_36.5px_15px_rgba(0,0,0,0.25)] 
                           z-[2] mx-4">
            
                <!-- Right Column -->
                <div class="flex flex-col justify-end items-start text-left mb-[18rem]">
                    <h2 ref="rightTitle" class="landing-section-title">Smart Grilling<br>Brought To The Web</h2>
                    <p ref="rightDescription" class="landing-section-description">
                        View your pellet smoker in real-time from your phone,<br>tablet, or computer. Track your cook—all from the<br>convenience of your web browser.
                    </p>
                </div>
            </div>
        </section>

        
        <!-- Footer -->
        <footer class="footer">
            <p class="footer-text">© Wesly Barayuga | MIT License</p>
        </footer>
    </div>
</template>

<style scoped>
/* Global Styles */
body,
html {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    height: 100%;
    overflow-x: hidden;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 250vh; 
    position: relative;
    overflow-x: hidden;
}

/* Background */
.background {
    position: absolute;
    width: 100%;
    height: 100%; /* Ensure it covers the full height */
    /* background: linear-gradient(90deg, #535353 0.01%, rgba(196, 113, 62, 0.99) 65.5%, #ffffff 100%); */
    background: linear-gradient(90deg, #3e3e3e 0.01%, rgba(196, 113, 62, 0.99) 65.5%, #ffffff 100%);
    z-index: -1;
    top: 0;
    left: 0;
}

/* Container to constrain content */
.container {
    width: 80%; /* Matches .landing-title */
    max-width: 1200px; /* Ensures a consistent max width */
    margin: 0 auto; /* Centers the content */
}

/* Header */
.header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 0;
    background: rgba(0, 0, 0, 0.15); /* Semi-transparent white background */
    
    color: #F5F5F5;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    /* box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2); Soft shadow */
}

.header-content {
    width: 80%; /* Keep the width constrained */
    max-width: 1200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem; /* Add horizontal padding */
}

/* Landing Section */
.landing-content {
margin: 0px;
}

.landing-content .flex {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px; /* Reduce the gap */
    margin-top: 1.5rem; /* Adjust spacing */
}

.landing-title {
    font-size: clamp(2rem, 6vw, 4.5rem); /* Scales between 2.5rem and 5rem */
    font-weight: 900;
    text-align: center;
    color: #000000;
    /* opacity: 0.9; */
    margin-top: 10rem;
    width: 100%;
}

.landing-description {
    font-size: clamp(1rem, 2.5vw, 1.5rem); /* Adjusts between 1rem and 1.5rem */
    font-weight: 400;
    text-align: center;
    color: #00000094;
    opacity: 0.85;
    margin-top: 1rem;
    width: 100%;
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
    position: relative;
    width: 134px;
    height: 47px;
    background: rgba(44, 44, 44, 0.45);
    border-radius: 20px;
    backdrop-filter: blur(18.5px);
    -webkit-backdrop-filter: blur(4px);
    margin: 0;
    transition: background-color 0.1s;
    text-align: center;
    cursor: pointer;
}

.get-started-button:hover {
    background: rgba(26, 26, 26, 0.50);
}

.button-text {
    font-size: clamp(0.875rem, 1.5vw, 1rem);
    color: #f5f5f5;
    text-decoration: none;
}

/* Container for the section with the rotated background */
.section-with-background {
    position: relative;
    /* overflow: hidden; /* Hide any overflow caused by the rotated background */
    padding: 11rem 0; /* Add padding for content spacing */
    margin-top: 8rem;
}

/* Rotated background using a pseudo-element */
.section-with-background::before {
    content: '';
    position: absolute;
    width: 120vw; /* Wider than the viewport to account for rotation */
    height: 100%; /* Full height of the container */
    left: 50%;
    top: 0;
    transform: translateX(-50%) rotate(-8deg); /* Center and rotate */
    background: #ffffff; /* Background color */
    z-index: -1; /* Place it behind the content */
}

.landing-section-title {
    font-size: clamp(2rem, 2vw, 4.5rem); /* Scales between 2.5rem and 5rem */
    font-weight: 900;
    /* text-align: center; */
    color: #000000;
    line-height: 55px;
    /* opacity: 0.9; */
    margin-top: 1rem;
    margin-bottom: 1rem;
    width: 100%;
}

.landing-section-description {
    font-size: clamp(1rem, 0.75vw, 2.5rem); /* Scales between 2.5rem and 5rem */
    font-weight: 900;
    /* text-align: center; */
    color: #000000;
    opacity: 0.5;
    /* margin-top: 10rem; */
    width: 100%;
}


/* Footer */
.footer {
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.25);
    opacity: 0.5;
    text-align: center;
    margin-top: auto;
}

.footer-text {
    font-size: 1rem;
    color: #000000;
    opacity: 0.6;
}

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
    .landing-title {
        font-size: clamp(2rem, 6vw, 3rem); /* Ensures readability */
    }

    .landing-description {
        font-size: clamp(0.9rem, 4vw, 1.2rem);
    }
}


/* Animation for text */
.animate-text {
    opacity: 0; /* Start with invisible text */
    transform: translateY(12px); /* Start slightly below */
    animation: fadeInUp 0.5s ease-out forwards; /* Apply animation */
}

/* Delay animations for each element */
.landing-title.animate-text {
    animation-delay: 0.1s; /* Delay for the title */
}

.landing-description.animate-text {
    animation-delay: 0.2s; /* Delay for the description */
}

.get-started-button.animate-text {
    animation-delay: 0.3s; /* Delay for the button */
}

/* Keyframes for the fadeInUp animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.landing-section-title,
.landing-section-description {
    opacity: 0; /* Ensure animation starts with invisible text */
}
</style>
