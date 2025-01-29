// ==UserScript==
// @name         UkrpixelShablon
// @namespace    https://tampermonkey.net/
// @version      1.3
// @description  UkrpixelShablon
// @author       Ukrpixel
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/mackaronina/shablon_script/main/index.user.js
// @updateURL    https://raw.githubusercontent.com/mackaronina/shablon_script/main/index.user.js
// @connect      githubusercontent.com
// @connect      github.com
// @connect      fuckyouarkeros.fun
// @connect      pixelplanet.fun
// @connect      pixmap.fun
// @connect      chillpixel.xyz
// @connect      pixelya.fun
// @connect      pixuniverse.fun
// @connect      globepixel.fun
// @connect      localhost
// @connect      pixel-bot-5lns.onrender.com
// @match        *://fuckyouarkeros.fun/*
// @match        *://pixelplanet.fun/*
// @match        *://pixmap.fun/*
// @match        *://chillpixel.xyz/*
// @match        *://pixelya.fun/*
// @match        *://pixuniverse.fun/*
// @match        *://globepixel.fun/*
// ==/UserScript==

const src_picture = 'https://pixel-bot-5lns.onrender.com/shablon_picture'
const src_info = 'https://pixel-bot-5lns.onrender.com/shablon_info'
const templateName = 'UKRPIXEL'

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

async function main() {
    const file = await loadFile(src_picture);
    const info = await loadInfo(src_info);
    if (isTemplateExists(templateName)) {
        updateTemplate(file, info);
    } else {
        addTemplate(file, info, templateName);
    }
    if (info.text.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="Alert show">
        <h2>Останній закріп</h2>
        <p>${info.text}</p>
        <button type="button" id="my_button">OK</button>
        </div>
        `;
        document.body.appendChild(wrapper);
        const button = document.querySelector('#my_button');
        button.addEventListener('click', () => {
            wrapper.remove();
        });
    }
}


function addTemplate(file, coords, name) {
    templateLoader.addFile(
        file,
        name,
        "0",
        coords.x,
        coords.y
    );
}

function isTemplateExists(name) {
    return findTemplate(name) !== undefined;
}

function findTemplate(name) {
    const list = getNativeTemplates();
    return list.find(t => name === t.title);
}


function getNativeTemplates() {
    return JSON.parse(JSON.parse(localStorage['persist:tem']).list);
}

function updateTemplate(file, coords, name) {
    const found = findTemplate(name);
    if (!found) return;
    templateLoader.deleteTemplate(found.imageId);
    addTemplate(file, coords, name);
}

async function loadFile(src) {
    const resp = await fetch(src);
    const blob = await resp.blob();
    return new File([blob], 'result.png', {
        type: 'image/png',
    });
}

async function loadInfo(src) {
    const resp = await fetch(src);
    return await resp.json();
}