if(!self.define){let e,i={};const r=(r,n)=>(r=new URL(r+".js",n).href,i[r]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=i,document.head.appendChild(e)}else e=r,importScripts(r),i()})).then((()=>{let e=i[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(n,s)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(i[d])return;let o={};const t=e=>r(e,d),l={module:{uri:d},exports:o,require:t};i[d]=Promise.all(n.map((e=>l[e]||t(e)))).then((e=>(s(...e),o)))}}define(["./workbox-3625d7b0"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index.97e9e91e.js",revision:null},{url:"assets/index.cd2a5d88.css",revision:null},{url:"index.html",revision:"e741286e13aabc8a877bfb2ba28673d1"},{url:"registerSW.js",revision:"4536f5d50f6f502874377b8c96904ee0"},{url:"script-reference.js",revision:"b6761f39dd059e6bdd831cb433891c1b"},{url:"android-chrome-192x192.png",revision:"b7d75bcb13b221205c5dd23fa2e13749"},{url:"android-chrome-512x512.png",revision:"e3448b244598b5de653b22efa11360f6"},{url:"manifest.webmanifest",revision:"658b3617f0642ddb695640337e8e9d42"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
