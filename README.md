# TragSync

## Overview
Hey what's up. Traeger doesn't have an official web interface that let's us monitor our grills on our browsers. So I'm making it myself. Free & Open Source. FullStack everything (Nuxt.js, Vue.js, Node.js, Express.js, Tailwind, Vercel, Render, FireBase Auth), and I'm doing all the UI/UX design (Figma, Photoshop). The goal is to provide an seamless, user-friendly way to monitor and (potentially) interact with your Traeger Grill on the web because I'm not a fan of their official mobile app.

## Status Quo Feb/25: 
Communication pipeline between my frontend client, AWS, and my Traeger Grill works and displays 10s-20s polled updates in my browser. Laymen's terms, this web app works yo. Designed a fully custom and functioning Rest API, MQTT Client, deployed custom Express.js server with Node on Render, deployed Nuxt3 web app on Vercel, designed/implemented web app landing page and grill interface. TODO: Begin FireBase Auth, hook up PostgreSQL and build UI/UX and implement design for "Get Started" user-flow.

## Features
- User-friendly web interface
- Real-time data visualization (10s-20s polling)
- Easy configuration and management of Traeger settings (maybe)
- Responsive design for use on various devices

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact
For any questions or inquiries, contact me at w.barayuga@u.pacific.edu
