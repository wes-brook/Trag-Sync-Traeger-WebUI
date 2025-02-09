<script setup lang="js">
import { onMounted } from "vue";
import { stagger, animate } from "motion";

const item = ref(null);

onMounted(() => {
    console.clear();
    const featuresEl = document.querySelector(".features");
    const featureEls = document.querySelectorAll(".feature");

    featuresEl.addEventListener("pointermove", (ev) => {
        featureEls.forEach((featureEl) => {
            // Not optimized yet, I know
            const rect = featureEl.getBoundingClientRect();

            featureEl.style.setProperty("--x", ev.clientX - rect.left);
            featureEl.style.setProperty("--y", ev.clientY - rect.top);
        });
    });

    // Stagger animation observer
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.2 });
    if (item.value) observer.observe(item.value);
});

const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            if (entry.target === item.value) {
                animate(".feature",
                    {
                        y: -100,
                        opacity: [0, 1]
                    },
                    {
                        delay: stagger(0.1),
                        duration: 0.675,
                        easing: "cubic-bezier(0.65, 0.05, 0, 1)",
                    })
                observer.unobserve(entry.target);
            }
        }
    });
};
</script>

<template>
    <div ref="item" class="features">
        <div class="feature">
            <a href="#" class="feature-content">
                <strong>About TragSync</strong>
                <span>
                    Never lose track of your grill again.
                    TragSync is a free, open-source web application that lets you monitor your grill’s
                    temperature and status in real time—right from your web browser. Whether you’re
                    smoking brisket or grilling burgers, stay in control with live updates and peace of mind.
                    Created by a single web developer who happens to love smoking briskets.
                </span>
            </a>
        </div>
        <div class="feature">
            <a href="#" class="feature-content">
                <strong>Some feature</strong>
                <span>Description of the awesome feature</span>
            </a>
        </div>
        <div class="feature">
            <a href="#" class="feature-content">
                <strong>Some feature</strong>
                <span>Description of the awesome feature</span>
            </a>
        </div>
        <div class="feature">
            <a href="#" class="feature-content">
                <strong>Some feature</strong>
                <span>Description of the awesome feature</span>
            </a>
        </div>

    </div>
</template>

<style lang="css" scoped>
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: #060606;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
}

*,
*:before,
*:after {
    box-sizing: border-box;
    position: relative;
}

.features {
    width: 100%;
    height: 40rem;
    display: grid;
    grid-column-gap: 1%;
    grid-row-gap: 1%;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
}

.feature {
    --x-px: calc(var(--x) * 1px);
    --y-px: calc(var(--y) * 1px);
    --border: 0px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    overflow: hidden;

    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(18.5px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:before,
    &:after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        inset: 0px;
        border-radius: inherit;
        background: radial-gradient(800px circle at var(--x-px) var(--y-px),
                                                    rgba(255, 255, 255, 0.2),
                                                    transparent 40%);
    }

    &:before {
        z-index: 1;
    }

    &:after {
        opacity: 0;
        z-index: 2;
        transition: opacity 0.4s ease;
    }

    &:hover:after {
        opacity: 1;
    }
}

.feature-content {
    border-radius: inherit;
    color: white;
    text-decoration: none;
    border: none;
    z-index: 1;
    position: absolute;
    inset: var(--border);
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-row-gap: 0.5rem;
    padding: 2rem;

    >strong {
        align-self: self-end;
        font-size: 125%;
    }

    >span {
        opacity: 0.7;
    }
}

.feature {
    opacity: 0;
}
</style>