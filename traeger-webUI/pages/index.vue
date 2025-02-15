<script setup>
import { useHead } from 'nuxt/app';
// import './styles.css';         // moved to style section
// import '../assets/styles.css'; // moved to style section

useHead({
  title: 'TragSync — Monitor your smoker on the web.',
  meta: [
    { charset: 'utf-8' },
    { name: 'description', content: 'A platform by Wesly Barayuga to give people a way to monitor their pellet smokers on the web.' },
    { property: 'og:title', content: 'TragSync — Monitor your pellet smoker on the web' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
});
</script>

<template>
  <div data-barba="wrapper" data-scrolling-direction="" data-scrolling-started="false" data-nav-status="closed"
    class="body">
    <!-- ****START HEADER**** -->
    <header class="header">
      <div class="container no-pad">
        <nav class="nav-row"> <!-- NAVIGATION BAR -->
          <div class="nav-inner">
            <a href="/" data-nav-button="" aria-current="page" class="nav-logo-row w-inline-block w--current">
              <h3>TragSync</h3>
              <p class="p-reg opacity--70">*Not affiliated with Traeger</p>
            </a>
            <div class="nav-menu">
              <div data-menu-reveal="" class="nav-menu-eyebrow">
                <div class="eyebrow">menu</div>
              </div>
              <div class="nav-menu__links">
                <a href="/" aria-label="home" data-barba-update="" data-menu-reveal="" aria-current="page"
                  class="link nav-link w-inline-block w--current">
                  <p data-letters-delay="" data-split="letters" class="nav-link-text">
                    Home
                  </p>
                </a>
                <div data-menu-reveal="" class="u--rel">
                  <a href="/updates" aria-label="Updates" data-barba-update="" class="link nav-link w-inline-block">
                    <p data-letters-delay="" data-split="letters" class="nav-link-text">
                      Updates
                    </p>
                    <div class="nav-menu-divider bottom"></div>
                  </a>
                  <div class="updates-count">
                    <p data-updates-nr="" class="eyebrow">1</p>
                  </div>
                </div>
                <a href="/faq" aria-label="FAQ" data-barba-update="" data-menu-reveal=""
                  class="link nav-link w-inline-block">
                  <p data-letters-delay="" data-split="letters" class="nav-link-text">
                    FAQ
                  </p>
                </a>
              </div>
            </div>
            <div class="nav-button-row">
              <div data-o-anonymous="1" data-nav-button="" class="login-wrap">
                <a aria-label="Log in" data-barba-prevent="" href="" class="link u--clip w-inline-block">
                  <p data-letters-delay="" data-split="letters" class="p-reg">
                    Log in
                  </p>
                </a>
              </div>
              <NuxtLink to="/grill" class="button small w-inline-block">
                <div class="u--clip">
                  <p data-letters-delay="" data-split="letters" class="p-reg">
                    Get Started
                  </p>
                </div>
                <div class="button-bg"></div>
              </NuxtLink>
            </div>
          </div>
        </nav>
      </div>
    </header>
    <!-- ****END HEADER**** -->

    <!-- ****START HERO**** -->
    <div data-barba-namespace="home" data-barba="container" class="main-w">
      <section data-hero-section="" class="section u--rel z--2">
        <div class="bg__unicorn-dark-overlay"></div> <!-- NOTE: This adds the bottom dark shadow on the hero -->
        <div class="container">
          <div class="home-hero">
            <div class="home-hero__inner">
              <div data-load-items="wrap-p" class="hero-col-info">
                <div class="flex-col">
                  <div class="p-reg mask">
                    <p>Real Time View</p>
                  </div>
                  <div class="p-reg mask">
                    <p>Smoker Temp</p>
                  </div>
                  <div class="p-reg mask">
                    <p>Probe Temp</p>
                  </div>
                  <div class="p-reg mask">
                    <p>Clock</p>
                  </div>
                  <div class="p-reg mask">
                    <p>Timer</p>
                  </div>
                </div>
                <div class="flex-col">
                  <div class="p-reg mask">
                    <p>Free To Use</p>
                  </div>
                  <div class="p-reg mask">
                    <a href="https://github.com/wes-brook/Trag-Sync-Traeger-WebUI" target="_blank" rel="noopener" class="link opacity-100">
                      Open Source <
                    </a>
                  </div>
                  <div class="p-reg mask">
                    <p>Any Browser</p>
                  </div>
                  <div class="p-reg mask">
                    <p>WebPit</p>
                  </div>
                </div>
              </div>
              <div class="hero-col-title">
                <h1 aria-hidden="true" data-split="lines" data-reveal="load" class="h-display">
                  TragSync —Track<br>your smoker online.
                </h1>
                <div data-load-items="wrap-buttons" class="flex-row gap--tiny">
                  <NuxtLink to="/grill" class="button w-inline-block">
                    <div class="u--clip">
                      <p data-letters-delay="" data-split="letters" class="p-reg">
                        Get Started
                      </p>
                    </div>
                    <div class="button-bg"></div>
                  </NuxtLink>
                  <a href="https://www.linkedin.com/in/b-wes/" target="_blank" rel="noopener"
                    class="button is--secondary" aria-label="about us">
                    <div class="button-inner-row">
                      <img loading="lazy" src="../assets/me.png" alt="Wes Brook" class="button-faces rounded-full" />
                      <div class="u--clip">
                        <p data-letters-delay="" data-split="letters" class="p-reg">
                          Meet The Creator
                        </p>
                      </div>
                    </div>
                    <div class="button-bg is--secondary"></div>
                  </a>
                </div>
              </div>
              <div id="w-node-_2aacde1c-7b79-249f-2926-1a8bf2560dfe-b4ef2fa0" class="md--hide"></div>
              <div id="w-node-_2aacde1c-7b79-249f-2926-1a8bf2560dff-b4ef2fa0" class="home-col-cta">
                <div class="hero-p__wrap">
                  <p aria-hidden="true" data-split="lines" data-reveal="load" class="p-reg">
                    Never lose track of your Traeger (not affiliated). TragSync is a free, open-source
                    web application that lets you monitor your grill’s temperature and status
                    in real time—right from your web browser. Whether you’re smoking brisket
                    or BBQ ribs, stay in control with live updates and peace of mind.
                    Created by a solo web developer who happens to love smoking briskets.
                  </p>
                </div>
              </div>
              <div id="w-node-_2aacde1c-7b79-249f-2926-1a8bf2560e03-b4ef2fa0" class="home-hero-pic">
                <div class="hero-pic-bg"></div>
                <div class="hero-pic-wrap">
                  <img src="../assets/grillCard.png" />
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 220 220" fill="none"
                  class="home-pic-accent">
                  <g opacity="0.3">
                    <rect x="220" y="109.498" width="1.00457" height="220" transform="rotate(90 220 109.498)"
                      fill="currentColor"></rect>
                    <rect x="187.426" y="31.8638" width="1.00457" height="220" transform="rotate(45 187.426 31.8638)"
                      fill="currentColor"></rect>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="bg__unicorn-dark-overlay-top"></div> <!-- Intensify dark gradient in hero -->
      </section>
      <!-- ****END HERO****-->

      <!-- ****DEMO SECTION**** -->
      <section id="dashboard" class="section">
        <div class="bg__unicorn-dark-overlay-below-hero"></div>
        <div class="container c-pad-top">
          <div class="spacer md--hide"></div>
          <div class="text-container text-center">
            <div class="container-small">
              <div class="flex-col a--center gap--med">
                <h2 aria-hidden="true" data-split="lines" data-reveal="scroll" class="h-medium">
                  The platform I wish we had, so I built it myself —Wes
                </h2>
                <div class="db-text-row">
                  <p aria-hidden="true" data-split="lines" data-reveal="scroll" class="p-reg opacity--70">
                    As a solo web developer who enjoys cooking on my pellet grill,
                    I noticed our favorite pellet smoker company lacked a web application for monitoring
                    our grills, so I built one myself. This web app gives you you a
                    platform to keep an eye on your pellet smoker during those long cooks, 
                    <strong>all in your browser</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="db-container">
            <div class="db-wrapper">
              <div class="db-base"></div>
              <!-- TragSync demo will go here, just an image or gif -->
            </div>
          </div>
        </div>
      </section>

      <!-- ****MOTIVE SECTION**** -->
      <section class="section">
        <div class="container c-pad-top">
          <div class="text-container text-center">
            <div class="flex-col gap--xxlarge a--center">
              <div class="container-small">
                <h3 aria-hidden="true" data-split="lines" data-reveal="scroll" class="h-medium">
                  I created TragSync to monitor my pellet
                  smoker directly on any browser, eliminating
                  the need to pull out the mobile app —Wes
                </h3>
              </div>
              <div class="divider motive"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ****EXTRA SECTION**** -->
      <section class="section u--rel">
        <div class="container c-pad-top">
          <div data-start-wrap="" class="text-container text-center">
            <div class="container-medium">
              <div class="flex-col a--center gap--70">
                <div class="u--rel">
                  <h3 data-start-heading="" data-split="letters" aria-hidden="true" class="h-large">
                    The mobile app is cool. This one is BETTER.
                  </h3>
                </div>
                <div class="about-button-row">
                  <NuxtLink to="/grill" class="button w-inline-block">
                    <div class="u--clip">
                      <p data-letters-delay="" data-split="letters" class="p-reg">
                        Get Started
                      </p>
                    </div>
                    <div class="button-bg"></div>
                  </NuxtLink>
                  <a href="https://www.linkedin.com/in/b-wes/" target="_blank" rel="noopener"
                    class="button is--secondary" aria-label="about us">
                    <div class="button-inner-row">
                      <img loading="lazy" src="../assets/me.png" alt="Wes Brook" class="button-faces rounded-full" />
                      <div class="u--clip">
                        <p data-letters-delay="" data-split="letters" class="p-reg">
                          About The Creator
                        </p>
                      </div>
                    </div>
                    <div class="button-bg is--secondary"></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fade-wrap">
          <div class="fade-wrap-overlay"></div>
        </div>
      </section>

      <!-- ****FEATURES SECTION**** -->
      <section class="section u--rel">
        <div data-tabs="wrapper" class="layout c-pad-top">
          <div class="layout-col md--full">
            <div class="container-large is-half">
              <div class="tab-container">
                <div class="tab-container-top">
                  <h3 aria-hidden="true" data-split="lines" data-reveal="scroll" class="h-medium">
                    Explore the features of TragSync
                  </h3>
                  <div data-flip-button="wrap" data-tabs="nav" class="filter-bar">
                    <button data-tabs="button" data-flip-button="button" class="filter-button">
                      <div class="p-med">WebPit</div>
                      <div data-flip-button="bg" class="tab-button__bg"></div>
                    </button>
                    <button data-tabs="button" data-flip-button="button" class="filter-button">
                      <div class="p-med">Community</div>
                    </button>
                  </div>
                </div>
                <div class="flex-col a--left gap--xlarge">
                  <div data-tabs="content-wrap" class="tab-content-wrap">
                    <div data-tabs="content-item" class="tab-content-item active">
                      <h4 data-split="lines" class="h-small">
                        The Virtual BBQ PitStop
                      </h4>
                      <p aria-hidden="true" data-split="lines" class="p-reg opacity--70">
                        WebPit is your virtual pitstop where your pellet smoker lives. Organized into
                        clear categories , it’s designed to make monitoring your smoker easily.
                        Whether you’re monitoring temperature, cook time,
                        or probe temperature, this quick-use interface has you covered.
                        Simple, organized, and ready to help you master the flame.
                      </p>
                    </div>
                    <div data-tabs="content-item" class="tab-content-item">
                      <h4 data-split="lines" class="h-small">
                        in <progress></progress>
                      </h4>
                      <p aria-hidden="true" data-split="lines" class="p-reg opacity--70">
                        The word ‘community’ gets thrown around a lot these
                        days, but we genuinely believe it’s the best way to
                        connect with other creators. Whether it’s solving tricky
                        problems together, sharing ideas, or just finding people
                        who get what you’re trying to build, this is where those
                        connections happen. We &#x27;re on Slack, so no need to
                        go to some dedicated tool online that you &#x27;ll
                        forget about.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="layout-col md--full">
            <div data-tabs="visual-wrap" class="tab-visual-wrap">
              <div data-tabs-content="video" data-tabs="visual-item" class="tab-visual-item active">
                <div class="tabs-vid-wrap">
                  <div class="tabs-vid-wrap-inner">
                    <!-- Something here -->
                  </div>
                </div>
              </div>
              <div data-tabs-content="video" data-tabs="visual-item" class="tab-visual-item">
                <div class="tabs-vid-wrap">
                  <div class="tabs-vid-wrap-inner">
                    <!-- Something here -->
                  </div>
                </div>
              </div>
              <div data-tabs="visual-item" class="tab-visual-item">
                <div class="tabs-vid-wrap">
                  <div class="tabs-vid-wrap-inner">
                    <!-- Something here -->
                    <div class="slack-overlay"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ****START FOOTER**** -->
      <footer class="footer section">
        <div class="container">
          <div class="footer-cta">
            <div class="u--abs top">
              <div class="divider opacity--25"></div>
            </div>
            <div class="container-small">
              <div class="flex-col a--center gap--med">
                <h2 aria-hidden="true" data-split="lines" data-reveal="scroll" class="h-medium">
                  Let’s get to grilling. Sign up and get started.
                </h2>
              </div>
            </div>
            <NuxtLink to="/grill" class="button w-inline-block">
              <div class="u--clip">
                <p data-letters-delay="" data-split="letters" class="p-reg">
                  Get Started
                </p>
              </div>
              <div class="button-bg"></div>
            </NuxtLink>
            <div class="u--abs bottom">
              <div class="divider opacity--25"></div>
            </div>
          </div>
          <div class="footer-main">
            <div class="footer-top-row">
              <div class="footer-content-row">
                <div class="footer-link-col">
                  <h3 class="eyebrow opacity--50">sitemap</h3>
                  <ul class="flex-col a--left">
                    <li class="p-reg mask">
                      <a href="/" aria-current="page" class="link w--current">Home</a>
                    </li>
                    <div class="u--rel">
                      <li class="p-reg mask">
                        <a href="/updates" class="link">Updates</a>
                      </li>
                      <div class="updates-count footer">
                        <p data-updates-nr="" class="eyebrow">1</p>
                      </div>
                    </div>
                    <li class="p-reg mask">
                      <a href="/faq" class="link">FAQ</a>
                    </li>
                    <li class="p-reg mask">
                      <a href="/grill" class="link">Log In</a>
                    </li>
                    <li class="p-reg mask">
                      <NuxtLink to="/grill">
                        <p class="link">Get Started</p>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

              </div>
              <div class="footer-form-col">
                <div class="footer-link-col full">
                  <h3 class="eyebrow opacity--50">contact</h3>
                  <div>
                    <p class="p-reg">
                      Have a question, shoot me an email!
                    </p>
                    <div class="p-reg mask"></div>
                    <div data-form-validate="" class="footer-form w-form">
                      <form method="get"
                        data-mapping='{"emailListUid":"z9Mzy7W4","formId":"677a641f2b80576f18353331","fieldMappings":[{"formField":"Name 2","outsetaField":"Person.FirstName"},{"formField":"Email 3","outsetaField":"Person.Email"}]}'
                        name="email-form" data-name="Email Form" data-o-email-form="1" id="email-form"
                        class="footer-form-grid" data-wf-page-id="67791bd7ad8b4863b4ef2fa0"
                        data-wf-element-id="bcb30f9c-ba4d-1896-2ca4-79a602332dce">
                        <div data-validate="" class="footer-field-group">
                          <input class="footer-form-field w-input" maxlength="256" name="name-2" data-name="Name 2"
                            min="2" placeholder="First name" type="text" id="name-2" required="" />
                        </div>
                        <div data-validate="" class="footer-field-group">
                          <input class="footer-form-field w-input" maxlength="256" name="Email-3" data-name="Email 3"
                            placeholder="Email" type="email" id="Email-3" required="" />
                        </div>
                        <div data-submit="" class="footer-form-button">
                          <a id="form-button" aria-label="sign up" href="#"
                            class="button small is--secondary w-inline-block">
                            <div class="u--clip">
                              <p data-letters-delay="" data-split="letters" class="p-reg">
                                Send
                              </p>
                            </div>
                            <div class="button-bg is--secondary"></div>
                          </a>
                          <input type="submit" data-wait="Please wait..." class="u--hide w-button" value="Submit" />
                        </div>
                      </form>
                      <div class="form-sucess w-form-done">
                        <div class="eyebrow">
                          amazing, we &#x27;ll keep you in the loop!
                        </div>
                      </div>
                      <div class="form-error w-form-fail">
                        <div class="eyebrow">
                          hmmm, something went wrong. sorry!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h1 class="footer-logo text-9xl">TragSync</h1> <!-- The cool opaque web app logo at the bottom -->
            <div class="footer-bottom-row">
              <div class="footer-bottom-col">
                <div class="footer-copyright">
                  <p class="eyebrow">
                    ©<span data-current-year="">2025</span>
                    TragSync. All rights reserved.
                  </p>
                </div>
                <ul class="flex-row gap--small sm--hide">
                  <li class="footer-li">
                    <a href="https://www.linkedin.com/in/wesly-barayuga" target="_blank" rel="noopener"
                      class="eyebrow link">linkedin</a>
                    <div class="eyebrow">,</div>
                  </li>
                  <li class="footer-li">
                    <a href="https://github.com/wes-brook/Trag-Sync-Traeger-WebUI" target="_blank" rel="noopener"
                      class="eyebrow link">github repo</a>
                    <div class="eyebrow">,</div>
                  </li>
                  <li class="footer-li">
                    <a href="https://www.youtube.com/@Cheff_Wes" target="_blank" rel="noopener"
                      class="eyebrow link">youtube</a>
                  </li>
                </ul>
                <p class="eyebrow">
                  built by
                  <a href="" target="_blank" class="link">Wes Brook</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <!-- ****END FOOTER**** -->

    </div>
  </div>
</template>

<style>
/* @import '../assets/styles.css'; commented out, unsure if needed*/
@import '../assets/main.css';

.body {
  background: linear-gradient(90deg, #000 0.01%, #5b5a5afc 65.5%, #fff);
  /* background: linear-gradient(90deg, #000000 0.01%, rgba(196, 113, 62, 0.99) 65.5%, #ffffff 100%); */
}

/* added 10:29am  */
/* body {
  margin: 0;
}

.body {
  background-color: var(--color-black);
  color: var(--color-neutral-200);
  justify-content: center;
  align-items: center;
  font-family: PP Neue Montreal, Arial, sans-serif;
  font-weight: 500;
  line-height: 1;
}

.body.is--dashboard {
  background-color: var(--color-light);
  color: var(--color-dark);
} */

/* added 10:29am  */

/* ------------------------- Variables -------------------------------------------------- */
:root {
  --cubic-default: cubic-bezier(0.65, 0.05, 0, 1);
  --duration-default: 0.735s;
  --animation-default: var(--duration-default) var(--cubic-default);
  --one-col-width: calc(8.33% - var(--gap-size));
  --three-col-width: calc(25% - 2 * var(--gap-size));
  /* Colors (not changing with Dark/Light Theme) */
  --color-ignore-neutral-100: #ffffff;
  --color-ignore-neutral-200: #efeeec;
  --color-ignore-neutral-300: #e3e1de;
  --color-ignore-neutral-400: #d0cfcd;
  --color-ignore-neutral-500: #818180;
  --color-ignore-neutral-600: #2c2c2c;
  --color-ignore-neutral-700: #1f1f1f;
  --color-ignore-neutral-800: #131313;
  --color-ignore-neutral-900: #000000;
  --color-ignore-white: var(--color-ignore-neutral-100);
  --color-ignore-light: var(--color-ignore-neutral-200);
  --color-ignore-dark: var(--color-ignore-neutral-800);
  --color-ignore-black: var(--color-ignore-neutral-900);
  --color-ignore-rgb-dark: 19, 19, 19;
  --color-ignore-rgb-light: 239, 238, 236;
  --color-ignore-rgb-black: 0, 0, 0;
  --color-ignore-rgb-white: 255, 255, 255;
}

/* ------------------------- Scaling System -------------------------------------------------- */
/* Desktop */
:root {
  --size-unit: 16;
  /* body font-size in design - no px */
  --size-container-ideal: 1440;
  /* screen-size in design - no px */
  --size-container-min: 992px;
  --size-container-max: 1920px;
  --size-container: clamp(var(--size-container-min),
      100vw,
      var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
}

/* Tablet */
@media screen and (max-width: 991px) {
  :root {
    --size-container-ideal: 1080;
    /* screen-size in design - no px */
    --size-container-min: 768px;
    --size-container-max: 991px;
  }
}

/* Mobile Landscape */
@media screen and (max-width: 767px) {
  :root {
    --size-container-ideal: 550;
    /* screen-size in design - no px */
    --size-container-min: 480px;
    --size-container-max: 767px;
    --container-padding: 1.25em;
  }
}

/* Mobile Portrait */
@media screen and (max-width: 479px) {
  :root {
    --size-container-ideal: 402;
    /* screen-size in design - no px */
    --size-container-min: 320px;
    --size-container-max: 479px;
  }
}

/* Apply to body */
body {
  font-size: var(--size-font);
}

/* ------------------------- Hide Scrollbar -------------------------------------------------- */
/* body ::-webkit-scrollbar {
  display: none;
} */

/* Chrome, Safari, Opera */
/* body {
  -ms-overflow-style: none;
} */

/* IE & Edge */
/* html {
  scrollbar-width: none;
} */

/* Firefox */
/* ------------------------- body -------------------------------------------------- */
*,
*:after,
*:before {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

html {
  scroll-behavior: initial;
}

html,
body {
  -webkit-font-smoothing: antialiased;
}

svg {
  max-width: none;
  height: auto;
  box-sizing: border-box;
  vertical-align: middle;
}

/* Selection */
::selection {
  background-color: var(--color-primary);
  color: var(--color-neutral-800);
  text-shadow: none;
}

::-moz-selection {
  background-color: var(--color-primary);
  color: var(--color-neutral-800);
  text-shadow: none;
}

a {
  /* color: inherit; */
  text-decoration: none;
}

.sr-only:not(:focus):not(:active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.bg-wrapper canvas {
  position: absolute;
}

.single-line-wrap {
  overflow: hidden;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
}

.video-player .hero-pic-wrap {
  margin-bottom: 0em;
  inset: 0em;
  position: absolute;
}

.home-hero-pic .hero-pic-wrap {
  opacity: 1 !important;
}

.button p,
.link p {
  text-shadow: 0px 1.25em currentColor;
}

.button .single-letter,
.link .single-letter {
  transition: transform var(--animation-default);
}

.button-bg {
  transition: transform var(--animation-default),
    background-color 0.2s ease-in-out;
}

.faq-link p {
  transition: transform 0.6s var(--cubic-default);
}

.faq-item[data-state="open"] .faq-link-icon {
  transform: rotate(-225deg);
  opacity: 1;
}

.faq-item[data-state="open"] .faq-link p {
  transform: translate(0em, 0px) !important;
}

.inline-link::after,
.link::after,
.rich-text a::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: 0px;
  left: 0px;
  transform-origin: center left;
  transition: transform var(--animation-default);
  background: currentColor;
  transform: scale(1, 1);
}

.link::after {
  transform: scale(0, 1);
  transition-delay: 0.1s;
  transform-origin: center right;
}

.link.w--current::after {
  transform: scale(1, 1);
}

@media screen and (max-width: 767px) {
  .nav-link::after {
    transform: scale(0, 1) !important;
  }
}

/* Field: Error */
[data-validate].is--error input,
[data-validate].is--error textarea {
  border-color: var(--color-error);
}

[data-validate].is--error .form-field-icon.is--error {
  opacity: 1;
}

/* Field: Success */
[data-validate].is--success .form-field-icon.is--success {
  opacity: 1;
}

body[data-scrolling-started="true"] .header-bg {
  transform: scale(1);
}

body[data-scrolling-started="true"][data-nav-status="closed"] .header {
  padding: calc(var(--container-padding) / 2) calc(var(--container-padding) / 2) 0px calc(var(--container-padding) / 2);
}

.trusted-nav-list:has(.trusted-nav-item.active) .trusted-nav-item.active {
  position: relative;
  z-index: 3;
}

.menu-button.close .button-bg {
  background: var(--color-dark);
}

.menu-button.close .menu-button__icon {
  transform: rotate(135deg);
}

.menu-button.close {
  color: var(--color-light);
}

.header-bg,
.home-hero-bg {
  background-image: linear-gradient(rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.15) 65%,
      rgba(0, 0, 0, 0.075) 75.5%,
      rgba(0, 0, 0, 0.037) 82.85%,
      rgba(0, 0, 0, 0.019) 88%,
      rgba(0, 0, 0, 0) 100%);
}

.gradient-overlay {
  background-image: linear-gradient(rgba(14, 14, 14, 1) 0%,
      rgba(14, 14, 14, 0.3) 50%,
      rgba(14, 14, 14, 0.15) 65%,
      rgba(14, 14, 14, 0.075) 75.5%,
      rgba(14, 14, 14, 0.037) 82.85%,
      rgba(14, 14, 14, 0.019) 88%,
      rgba(14, 14, 14, 0) 100%);
}

.db-notification {
  transition: transform var(--animation-default),
    opacity var(--animation-default);
  transform: translateY(2em) rotate(0.001deg);
  opacity: 0;
}

.db-notification[data-notification-status="active"] {
  transition: transform var(--duration-default-half) cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(0em) rotate(0.001deg);
  opacity: 1;
}

@media screen and (max-width: 767px) {
  .db-content__card:nth-of-type(1n + 7) {
    display: none;
  }
}

@media screen and (max-width: 479px) {
  .db-content__card:nth-of-type(1n + 4) {
    display: none;
  }
}

.nav-logo-row .dash-side__logo-icon {
  transition: transform var(--animation-default);
  transform: rotate(0.001deg);
}

.nav-logo-row:hover .dash-side__logo-icon {
  transform: rotate(-180deg);
}

[data-about-divider="left"] {
  transform-origin: center right;
}

[data-about-divider="right"] {
  transform-origin: center left;
}

/* Hover Stuff*/
@media (hover: hover) and (pointer: fine) {
  .faq-link:hover p {
    transform: translate(1em, 0px);
  }

  .faq-link:hover .faq-link-icon {
    opacity: 1;
  }

  .button:hover .single-letter,
  .link:not(.w--current):hover .single-letter {
    transform: translate(0px, -1.25em);
  }

  .button:hover .button-bg {
    transform: scale(0.95);
  }

  .form-submit-btn:hover .button-bg {
    transform: scale(0.99, 0.95);
  }

  .home-hero-pic:hover .hero-pic-bg {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .square-button:hover .button-bg {
    transform: scale(0.95);
  }

  .square-button:hover .close-icon {
    transform: rotate(-135deg);
  }

  .inline-link:hover::after,
  .rich-text a:hover::after {
    transform-origin: center right;
    transform: scale(0, 1);
  }

  .link:hover::after {
    transform-origin: center left;
    transform: scale(1, 1);
    transition-delay: 0s;
  }
}

/* Dashboard */
.db-nav__item:hover .db-nav__icon {
  color: var(--color-light);
}

/* 'Trusted by' / Testimonial section */
.trusted-nav-item::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 100em;
  z-index: -1;
  border: 1px solid var(--color-primary);
  transition: all 0.5s var(--cubic-default);
}

.trusted-nav-item .trusted-nav-item__tag {
  transition: all 0.5s var(--cubic-default);
}

.trusted-nav-item:hover::after,
.trusted-nav-item.active::after {
  inset: -5px;
}

.trusted-nav-item.active .trusted-nav-item__tag {
  opacity: 1;
  transform: translate(0px, 140%);
}

.testimonial-row:has(.testimonial-item.active) .testimonial-item:not(.active) {
  opacity: 0.45;
}

/* https://css-tip.com/corner-only-border-image/ */
[data-slider="slide"]::after {
  --s: 1em;
  /* corner size */
  --b: 1px;
  /* border width */
  --g: 0.5em;
  /* gap */
  content: "";
  position: absolute;
  inset: calc(var(--g) * -1);
  z-index: 1;
  opacity: 0;
  padding: calc(var(--g) + var(--b));
  outline: var(--b) solid var(--color-primary);
  outline-offset: calc(var(--g) / -1);
  mask: conic-gradient(at var(--s) var(--s), #0000 75%, #000 0) 0 0 / calc(100% - var(--s)) calc(100% - var(--s)),
    linear-gradient(#000 0 0) content-box;
  transition: all 0.4s var(--cubic-default);
}

[data-slider="slide"].active::after {
  outline-offset: calc(-1 * var(--b));
  opacity: 1;
}

/* Price Card Lifetime overlay */
[data-card-state="overlay"] .price-overlay__close {
  transform: translate(-125%, 0px) rotate(-90deg);
}

[data-card-state="overlay"] .price-card-tag {
  transform: translate(0.75em, 0px);
}

.price-overlay__close:hover .close-icon,
.price-card-tag:hover .close-icon {
  transform: rotate(-135deg);
}

.price-overlay__close,
.price-card-tag {
  transition: transform var(--animation-default);
}

.single-vimeo-player iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.single-vimeo-player[data-vimeo-player-target] {
  cursor: pointer;
}

/* Overlay Dark */
.single-vimeo-player .vimeo-overlay-dark {
  background: black;
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
  z-index: 2;
  pointer-events: none;
}

.single-vimeo-player[data-vimeo-status-activated="true"] .vimeo-overlay-dark {
  opacity: 0.2;
}

.single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-loaded="true"] .vimeo-overlay-dark,
.single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-loaded="true"] .vimeo-placeholder {
  opacity: 0;
}

@media (hover: hover) {
  .single-vimeo-player [data-vimeo-status-hover="true"]:hover .vimeo-overlay-dark {
    opacity: 0.3 !important;
  }
}

/* Interface */
.single-vimeo-player .vimeo-overlay-interface {
  pointer-events: none;
  z-index: 4;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: flex-end;
  padding: calc(var(--container-padding) / 1.5);
  gap: 1rem;
}

.single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-play="false"] .vimeo-overlay-interface,
.single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-hover="true"]:hover .vimeo-overlay-interface {
  opacity: 1;
}

@media screen and (max-width: 1024px) {
  .single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-play="true"] .vimeo-overlay-interface {
    opacity: 0 !important;
  }
}

.single-vimeo-player .vimeo-overlay-interface * {
  pointer-events: all;
}

.single-vimeo-player .vimeo-mute {
  height: 1.5em;
  width: 1.5em;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.single-vimeo-player .vimeo-mute svg {
  width: 100%;
  display: block;
}

.single-vimeo-player .vimeo-mute svg path {
  fill: white;
}

.single-vimeo-player .vimeo-mute svg:nth-child(2) {
  display: none;
}

.single-vimeo-player[data-vimeo-status-muted="true"] .vimeo-mute svg:nth-child(1) {
  display: none;
}

.single-vimeo-player[data-vimeo-status-muted="true"] .vimeo-mute svg:nth-child(2) {
  display: block;
}

.single-vimeo-player .vimeo-duration {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
}

.single-vimeo-player .vimeo-duration span {
  color: var(--color-neutral-300);
  white-space: nowrap;
  text-transform: uppercase;
  font-family: RM Mono, sans-serif;
  font-size: 0.75em;
  font-weight: 400;
}

/* Timeline */
.single-vimeo-player .vimeo-timeline {
  height: 1.5em;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: -0.35em;
  --timeline-rounded-corners: 0px;
  --progress-value: var(--color-neutral-300);
  --progress-background: rgba(100, 100, 100, 0.2);
  --progress-height: 2px;
  --dot-height: 0.75em;
  --dot-color: var(--color-primary);
}

.single-vimeo-player .vimeo-timeline>input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  position: absolute;
  display: block;
  background: transparent;
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.single-vimeo-player .vimeo-timeline>progress {
  width: 100%;
  position: absolute;
  left: 0;
  height: var(--progress-height);
  margin: 0;
  padding: 0;
  vertical-align: top;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0px;
  overflow: hidden;
  z-index: 0;
  background: transparent;
  border: none;
  color: var(--progress-value);
  cursor: pointer;
}

/* Progress */
.single-vimeo-player progress::-webkit-progress-bar {
  border-radius: var(--timeline-rounded-corners);
  background-color: var(--progress-background);
  box-shadow: 0;
}

.single-vimeo-player progress::-webkit-progress-value {
  background: var(--progress-value);
}

.single-vimeo-player progress::-moz-progress-bar {
  border-radius: var(--timeline-rounded-corners);
  background: var(--progress-value);
  box-shadow: 0;
}

.single-vimeo-player progress::-ms-fill {
  border-radius: var(--timeline-rounded-corners);
}

/* Range */
.single-vimeo-player [type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
}

.single-vimeo-player [type="range"]:focus {
  outline: none;
}

.single-vimeo-player [type="range"]::-ms-track {
  width: 100%;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

.single-vimeo-player [type="range"].time::-webkit-slider-runnable-track {
  width: 100%;
  height: var(--progress-height);
  cursor: pointer;
  background: var(--progress-background);
  border-radius: var(--timeline-rounded-corners);
}

.single-vimeo-player [type="range"]::-webkit-slider-thumb {
  box-shadow: 0;
  height: var(--dot-height);
  width: var(--dot-height);
  border-radius: var(--timeline-rounded-corners);
  background: var(--dot-color);
  cursor: pointer;
  -webkit-appearance: none;
}

.single-vimeo-player [type="range"]:focus::-webkit-slider-runnable-track {
  background: transparent;
}

.single-vimeo-player [type="range"]::-moz-range-track {
  width: 100%;
  height: var(--progress-height);
  cursor: pointer;
  background: var(--progress-background);
  border-radius: 0;
  border: 0;
  border-radius: var(--timeline-rounded-corners);
  overflow: hidden;
}

.single-vimeo-player [type="range"]::-moz-range-thumb {
  box-shadow: 0;
  border: 0;
  height: var(--dot-height);
  width: var(--dot-height);
  border-radius: var(--timeline-rounded-corners);
  background: var(--dot-color);
  cursor: pointer;
  box-shadow: 0;
}

/* Icon (Play + Pause) */
.single-vimeo-player .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3em;
  height: 3em;
  transform: scale(1) rotate(0.001deg);
  transition: opacity 0.3s ease-in-out;
  background: rgba(30, 30, 30, 0.2);
  backdrop-filter: blur(16px);
  border-radius: 50%;
}

.single-vimeo-player .icon svg {
  width: 60%;
}

/* Play */
.single-vimeo-player .vimeo-overlay-play {
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 1;
}

.single-vimeo-player[data-vimeo-status-play="true"] .vimeo-overlay-play {
  opacity: 0;
}

.single-vimeo-player .vimeo-overlay-play .icon svg path {
  fill: var(--color-dark);
}

/* Pause */
.single-vimeo-player .vimeo-overlay-pause {
  z-index: 3;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.single-vimeo-player[data-vimeo-status-play="true"] .vimeo-overlay-pause {
  display: flex;
}

.single-vimeo-player .vimeo-overlay-pause .icon {
  opacity: 0;
}

.single-vimeo-player .vimeo-overlay-pause .icon svg path {
  stroke: var(--color-dark);
}

.single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-play="false"] .vimeo-overlay-pause .icon,
.single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-hover="true"]:hover .vimeo-overlay-pause .icon {
  opacity: 1;
}

@media screen and (max-width: 1024px) {
  .single-vimeo-player[data-vimeo-status-activated="true"][data-vimeo-status-play="true"] .vimeo-overlay-pause .icon {
    opacity: 0 !important;
  }
}

/*  Loading */
.single-vimeo-player .vimeo-overlay-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9;
  transition: all 0.3s ease-in-out 0.5s;
  opacity: 0;
  pointer-events: none;
  background-color: rgba(var(--color-dark-rgb), 0.5);
}

.single-vimeo-player[data-vimeo-status-play="true"] .vimeo-overlay-loading {
  opacity: 1;
}

.single-vimeo-player[data-vimeo-status-play="true"][data-vimeo-status-loaded="true"] .vimeo-overlay-loading {
  opacity: 0;
}

.single-vimeo-player .vimeo-overlay-loading svg {
  width: 8em;
}

.single-vimeo-player .vimeo-overlay-loading svg path {
  fill: var(--color-white);
}
</style>
