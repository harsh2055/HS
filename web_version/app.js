// --- EVENT ENGINE ---
class EventEngine {
    constructor() {
        this.history = [];
        this.state = "None";
        this.subscribers = {};
        this.bufferSize = 5;
    }

    on(event, callback) {
        if (!this.subscribers[event]) this.subscribers[event] = [];
        this.subscribers[event].push(callback);
    }

    emit(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(cb => cb(data));
        }
    }

    update(rawGesture, data) {
        // Temporal Smoothing
        this.history.push(rawGesture);
        if (this.history.length > this.bufferSize) this.history.shift();
        
        const counts = this.history.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
        let smoothed = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

        if (smoothed !== this.state) {
            if (this.state !== "None") this.emit(`on${this.state}End`, data);
            this.state = smoothed;
            if (this.state !== "None") this.emit(`on${this.state}Start`, data);
        }

        if (this.state !== "None") {
            this.emit(`on${this.state}Hold`, data);
        }
        return this.state;
    }
}

// --- GESTURE RECOGNIZER ---
function getFingers(landmarks) {
    const tipIds = [4, 8, 12, 16, 20];
    let fingers = [];
    fingers.push(landmarks[tipIds[0]].x > landmarks[tipIds[0] - 1].x ? 1 : 0);
    for (let i = 1; i < 5; i++) {
        fingers.push(landmarks[tipIds[i]].y < landmarks[tipIds[i] - 2].y ? 1 : 0);
    }
    return fingers;
}

function recognizeRaw(fingers, landmarks) {
    const dx = landmarks[4].x - landmarks[8].x;
    const dy = landmarks[4].y - landmarks[8].y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 0.05) return "Pinch";
    
    const fStr = fingers.join('');
    if (fStr === '11111') return "OpenPalm";
    if (fStr === '00000') return "Fist";
    if (fStr === '01100' || fStr === '11100') return "Peace";
    if (fStr === '10000' || fStr === '10001') return "ThumbsUp";
    if (fStr === '01000' || fStr === '11000') return "Point";
    return "Unknown";
}

// --- APP CORE ---
const engine = new EventEngine();
const ui = {
    landing: document.getElementById('landingSection'),
    app: document.getElementById('appSection'),
    launchBtn: document.getElementById('launchAppBtn'),
    closeBtn: document.getElementById('closeAppBtn'),
    video: document.querySelector('.input_video'),
    canvas: document.querySelector('.output_canvas'),
    ctx: document.querySelector('.output_canvas').getContext('2d'),
    fps: document.getElementById('fpsCount'),
    state: document.getElementById('gestureState'),
    loading: document.getElementById('loadingOverlay'),
    eventList: document.getElementById('eventList')
};

let lastTime = performance.now();
let isRunning = false;
let camera = null;

// UI Event Logging
function logEvent(msg) {
    const li = document.createElement('li');
    li.innerText = `> ${msg}`;
    ui.eventList.prepend(li);
    if (ui.eventList.children.length > 6) {
        ui.eventList.lastChild.remove();
    }
}

// Map Engine Events to UI
engine.on('onPinchStart', () => logEvent('Pinch Started'));
engine.on('onPinchEnd', () => logEvent('Pinch Ended'));
engine.on('onSwipeLeft', () => logEvent('Swiped Left'));
engine.on('onSwipeRight', () => logEvent('Swiped Right'));

// Main Frame Processing
function onResults(results) {
    if (!isRunning) return;
    ui.loading.style.display = 'none';

    const now = performance.now();
    ui.fps.innerText = Math.round(1000 / (now - lastTime));
    lastTime = now;

    ui.ctx.save();
    ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    ui.ctx.drawImage(results.image, 0, 0, ui.canvas.width, ui.canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Render aesthetic landmarks
        drawConnectors(ui.ctx, landmarks, HAND_CONNECTIONS, {color: 'rgba(88, 166, 255, 0.5)', lineWidth: 2});
        drawLandmarks(ui.ctx, landmarks, {color: '#58a6ff', lineWidth: 1, radius: 2});

        const fingers = getFingers(landmarks);
        const raw = recognizeRaw(fingers, landmarks);
        const smoothed = engine.update(raw, { landmarks });
        
        ui.state.innerText = smoothed;
        ui.state.className = `value ${smoothed !== 'None' ? 'text-green' : ''}`;

        // Visual feedback for Pinch
        if (smoothed === 'Pinch') {
            const cx = (landmarks[4].x + landmarks[8].x) / 2 * ui.canvas.width;
            const cy = (landmarks[4].y + landmarks[8].y) / 2 * ui.canvas.height;
            ui.ctx.beginPath();
            ui.ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
            ui.ctx.fillStyle = 'rgba(63, 185, 80, 0.5)';
            ui.ctx.fill();
        }
    } else {
        engine.update("None", {});
        ui.state.innerText = "Idle";
        ui.state.className = "value";
    }
    ui.ctx.restore();
}

// MediaPipe Init
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7});
hands.onResults(onResults);

camera = new Camera(ui.video, {
    onFrame: async () => { if (isRunning) await hands.send({image: ui.video}); },
    width: 800, height: 600
});

// Routing
ui.launchBtn.onclick = () => {
    ui.landing.style.display = 'none';
    ui.app.style.display = 'flex';
    isRunning = true;
    camera.start();
};

ui.closeBtn.onclick = () => {
    isRunning = false;
    ui.video.pause();
    ui.app.style.display = 'none';
    ui.landing.style.display = 'flex';
    ui.loading.style.display = 'flex';
};
