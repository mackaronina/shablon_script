// ==UserScript==
// @name         UkrpixelShablon
// @namespace    https://tampermonkey.net/
// @version      1.43
// @description  UkrpixelShablon
// @author       Ukrpixel
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/mackaronina/shablon_script/main/index.user.js
// @updateURL    https://raw.githubusercontent.com/mackaronina/shablon_script/main/index.user.js
// @icon         https://raw.githubusercontent.com/mackaronina/shablon_script/main/icon.png
// @connect      githubusercontent.com
// @connect      github.com
// @connect      fuckyouarkeros.fun
// @connect      pixelplanet.fun
// @connect      pixmap.fun
// @connect      chillpixel.xyz
// @connect      pixelya.fun
// @connect      pixuniverse.fun
// @connect      globepixel.fun
// @connect      pixelroyal.fun
// @connect      localhost
// @connect      pixel-bot-5lns.onrender.com
// @match        *://fuckyouarkeros.fun/*
// @match        *://pixelplanet.fun/*
// @match        *://pixmap.fun/*
// @match        *://chillpixel.xyz/*
// @match        *://pixelya.fun/*
// @match        *://pixuniverse.fun/*
// @match        *://globepixel.fun/*
// @match        *://pixelroyal.fun/*
// ==/UserScript==

const src_picture = 'https://pixel-bot-5lns.onrender.com/shablon_picture'
const src_info = 'https://pixel-bot-5lns.onrender.com/shablon_info'
const templateName = 'UKRPIXEL'

let notificationRadius = 300;
const NOTIFICATION_TIME = 2000;

let pixelList = [];
let canvas;
let notifCircle;

const args = window.location.href.split(',');
let globalScale = 1;
let viewX = parseInt(args[args.length - 3]);
let viewY = parseInt(args[args.length - 2]);

const PING_OP = 0xB0;
const REG_MCHUNKS_OP = 0xA3;
const PIXEL_UPDATE_OP = 0xC1;
const REG_CANVAS_OP = 0xA0;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

function init() {
    addButton();
    radarMain();
}

async function addButton() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <button id="my_main_button" style="
    cursor: pointer; 
    user-select: none; 
    position: fixed; 
    padding: 3px; 
    top: 16px; 
    right: 16px; 
    width: 36px; 
    height: 36px; 
    border-radius: 10px; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    overflow: hidden; 
    background-color: rgba(0, 0, 234, 0.9); 
    border: rgba(230, 217, 0, 1) 1px solid;">
    <img src="https://raw.githubusercontent.com/mackaronina/shablon_script/main/icon.png" width="36" height="36">
    </button>
    `
    document.body.appendChild(wrapper);
    const button = document.querySelector('#my_main_button');
    button.addEventListener('click', buttonClick);
}

async function buttonClick() {
    const info = await loadInfo(src_info);
    showInfo(info);
    const file = await loadFile(src_picture);
    if (isTemplateExists(templateName)) {
        updateTemplate(file, info, templateName);
    } else {
        addTemplate(file, info, templateName);
    }
}

function showInfo(info) {
    if (info.text.length > 0) {
        closeModal();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="Alert show" id="my_modal">
        <h2>Останній закріп</h2>
        <p>${info.text}</p>
        <button type="button" id="my_button">OK</button>
        </div>
        `;
        document.body.appendChild(wrapper);
        const button = document.querySelector('#my_button');
        button.addEventListener('click', closeModal);
    }
}

function closeModal() {
    const modal = document.querySelector('#my_modal');
    if (modal) modal.remove();
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
    templateLoader.deleteTemplate(name);
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


function worldToScreen(x, y) {
    return [
        ((x - viewX) * globalScale) + (canvas.width / 2),
        ((y - viewY) * globalScale) + (canvas.height / 2),
    ];
}

function render() {
    try {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (globalScale < 0.8) {
            const curTime = Date.now();
            let index = pixelList.length;
            while (index > 0) {
                index--;
                let [setTime, x, y, i, j] = pixelList[index];
                const timePassed = curTime - setTime;
                if (timePassed > NOTIFICATION_TIME) {
                    pixelList.splice(index, 1);
                    continue;
                }
                const [sx, sy] = worldToScreen(x, y)
                    .map((z) => z + globalScale / 2);
                if (sx < 0 || sy < 0 || sx > canvas.width || sx > canvas.height) {
                    pixelList.splice(index, 1);
                    continue;
                }
                const notRadius = timePassed / NOTIFICATION_TIME * notificationRadius;
                const circleScale = notRadius / 100;
                ctx.save();
                ctx.scale(circleScale, circleScale);
                ctx.drawImage(
                    notifCircle,
                    Math.round(sx / circleScale - 100),
                    Math.round(sy / circleScale - 100),
                );
                ctx.restore();
            }
        }
    } catch (err) {
        console.error(`Render error`, err,);
    }
    setTimeout(render, 10);
}

function addPixel(x, y, i, j) {
    for (let k = 0; k < pixelList.length; k++) {
        if (pixelList[k][3] === i && pixelList[k][4] === j) {
            pixelList[k][0] = Date.now();
            pixelList[k][1] = x;
            pixelList[k][2] = y;
            return;
        }
    }
    pixelList.unshift([Date.now(), x, y, i, j]);
}

function getPixelFromChunkOffset(i, j, offset, canvasSize) {
    const tileSize = 256;
    const x = i * tileSize - canvasSize / 2 + offset % tileSize;
    const y = j * tileSize - canvasSize / 2 + Math.trunc(offset / tileSize);
    //const x = i * tileSize - canvasSize / 2 + 128;
    //const y = j * tileSize - canvasSize / 2 + 128;
    return [x, y];
}

function renderPixel(i, j, offset) {
    const canvasSize = 65536;
    const [x, y] = getPixelFromChunkOffset(i, j, offset, canvasSize);
    addPixel(x, y, i, j);
}

function renderPixels({i, j, pixels}) {
    pixels.forEach((pxl) => {
        const [offset, color] = pxl;
        renderPixel(i, j, offset);
    });
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(n, max));
}

function updateScale(viewscale) {
    globalScale = viewscale;
    notificationRadius = clamp(viewscale * 10, 20, 400);
}

function updateView(val) {
    viewX = val[0];
    viewY = val[1];
}

function onWindowResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function dehydratePing() {
    return new Uint8Array([PING_OP]).buffer;
}

function dehydrateRegMChunks(chunks) {
    const buffer = new ArrayBuffer(1 + 1 + chunks.length * 2);
    const view = new Uint16Array(buffer);
    // this will result into a double first byte, but still better than
    // shifting 16bit integers around later
    view[0] = REG_MCHUNKS_OP;
    for (let cnt = 0; cnt < chunks.length; cnt += 1) {
        view[cnt + 1] = chunks[cnt];
    }
    return buffer;
}

function hydratePixelUpdate(data) {
    const i = data.getUint8(1);
    const j = data.getUint8(2);
    /*
     * offset and color of every pixel
     * 3 bytes offset
     * 1 byte color
     */
    const pixels = [];
    let off = data.byteLength;
    while (off > 3) {
        const color = data.getUint8(off -= 1);
        const offsetL = data.getUint16(off -= 2);
        const offsetH = data.getUint8(off -= 1) << 16;
        pixels.push([offsetH | offsetL, color]);
    }
    return {
        i, j, pixels,
    };
}

function onBinaryMessage(buffer) {
    if (buffer.byteLength === 0) return;
    const data = new DataView(buffer);
    const opcode = data.getUint8(0);
    if (opcode === PIXEL_UPDATE_OP || opcode === 145) {
        renderPixels(hydratePixelUpdate(data));
    }
}

function dehydrateRegCanvas(canvasId) {
    const buffer = new ArrayBuffer(1 + 1);
    const view = new DataView(buffer);
    view.setInt8(0, REG_CANVAS_OP);
    view.setInt8(1, Number(canvasId));
    return buffer;
}

function onMessage({data: message}) {
    try {
        if (typeof message !== 'string') {
            onBinaryMessage(message);
        }
    } catch (err) {
        console.error(`An error occurred while parsing websocket message ${message}`, err,);
    }
}

function socketConnect(i, url, allChunks) {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
        console.log(`Socket ${i} opened`);
        ws.send(dehydrateRegCanvas(0));
        const chunkids = [];
        for (let j = 17000 * i; j < 17000 * (i + 1) && j < allChunks.length; j++) {
            chunkids.push(allChunks[j]);
        }
        ws.send(dehydrateRegMChunks(chunkids));
    };
    ws.onmessage = onMessage;
    ws.onclose = () => {
        console.log(`Socket ${i} closed`);
        setTimeout(() => {
            socketConnect(i, url, allChunks)
        }, 1000);
    };
    ws.onerror = (err) => {
        console.error('Socket encountered error, closing socket', err);
    };
    setInterval(() => {
        ws.send(dehydratePing())
    }, 23000)
}

function radarMain() {
    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    onWindowResize();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.body.appendChild(canvas);

    window.addEventListener('resize', onWindowResize);

    notifCircle = document.createElement('canvas');
    notifCircle.width = 200;
    notifCircle.height = 200;
    const notifcontext = notifCircle.getContext('2d');
    notifcontext.fillStyle = `rgba(255, 0, 0, 0.5)`;
    notifcontext.beginPath();
    notifcontext.arc(100, 100, 100, 0, 2 * Math.PI);
    notifcontext.closePath();
    notifcontext.fill();

    pixelPlanetEvents.on('setscale', updateScale);
    pixelPlanetEvents.on('setviewcoordinates', updateView);

    setTimeout(render, 10);

    const url = `${
        window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    }//${
        window.location.host
    }/ws`;
    const allChunks = []
    for (let i = 0; i <= 255; i++) {
        for (let j = 0; j <= 255; j++) {
            allChunks.push((i << 8) | j);
        }
    }
    for (let i = 0; i < 4; i++) {
        socketConnect(i, url, allChunks);
    }
}
