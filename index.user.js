// ==UserScript==
// @name         UkrpixelShablon
// @namespace    http://tampermonkey.net/
// @version      1.0
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

const src = 'https://pixel-bot-5lns.onrender.com/shablon'
const templateName = 'UKRPIXEL_TEMPLATE'

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

function main() {
    const template = loadFile(src);
    if(isTemplateExists(template)) {
        updateTemplate(template);
    } else {
        addTemplate(template);
    }
}

function getFilenameFromUrl(url) {
    const parts = new URL(url).pathname.split('/');
    return parts[parts.length - 1];
}

function removeExtensionFromFilename(filename) {
    return filename.split('.')[0];
}

function addTemplate(template) {
    templateLoader.addFile(
        template.file,
        template.name,
        0,
        template.x,
        template.y
    );
}

function isTemplateExists(template) {
    return findTemplate(template) !== undefined;
}

function findTemplate(template) {
    const list = getNativeTemplates();
    return list.find(t => template.name === t.title);
}


function getNativeTemplates() {
    return JSON.parse(JSON.parse(localStorage['persist:tem']).list);
}

function updateTemplate(template) {
    const found = findTemplate(template);
    if(!found) return;
    templateLoader.updateFile(found.imageId, template.file);
}

function loadFile(src) {
    const res = fetch(src);
    const data = res.blob();
    const filename = removeExtensionFromFilename(getFilenameFromUrl(src));
    const x = filename.split('_')[0];
    const y = filename.split('_')[1];
    return {
        file: new File(data, filename, {
            type: res.headers.get('Content-Type') ?? 'image/png',
        }),
        x: x,
        y: y,
        name: templateName
    };
}

