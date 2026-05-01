const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

const gestureLabel = document.getElementById('gestureLabel');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const fpsLabel = document.getElementById('fpsLabel');
const eventLogs = document.getElementById('eventLogs');

let lastTime = 0;
let history = [];

const gestureIcons = {
    "Pinch": "🤏",
    "Fist": "✊",
    "OpenPalm": "🖐️",
    "Peace": "✌️",
    "ThumbsUp": "👍",
    "Point": "☝️",
    "Idle": "⚪"
};

function logEvent(msg) {
    const li = document.createElement('li');
    li.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    eventLogs.prepend(li);
    if (eventLogs.children.length > 8) eventLogs.lastChild.remove();
}

function onResults(results) {
    // FPS Calc
    const now = performance.now();
    const fps = Math.round(1000 / (now - lastTime));
    lastTime = now;
    fpsLabel.innerText = `FPS: ${fps}`;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            // Aesthetic Drawing
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#58a6ff', lineWidth: 4});
            drawLandmarks(canvasCtx, landmarks, {color: '#ffffff', lineWidth: 1, radius: 2});
            
            // Simple rule-based logic for web demo (matching Python core)
            const gesture = recognizeWeb(landmarks);
            const confidence = 0.95; // Simulated confidence for web

            updateUI(gesture, confidence);
        }
    } else {
        updateUI("Idle", 0);
    }
    canvasCtx.restore();
}

function recognizeWeb(landmarks) {
    // Basic logic to determine fingers up
    const tips = [8, 12, 16, 20];
    let upCount = 0;
    tips.forEach(tip => {
        if (landmarks[tip].y < landmarks[tip - 2].y) upCount++;
    });
    
    // Dist for pinch
    const dist = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
    if (dist < 0.05) return "Pinch";
    
    if (upCount === 4) return "OpenPalm";
    if (upCount === 0) return "Fist";
    if (upCount === 1) return "Point";
    if (upCount === 2) return "Peace";
    
    return "Idle";
}

let lastGesture = "";
function updateUI(gesture, confidence) {
    if (gesture !== lastGesture) {
        logEvent(`Gesture changed to ${gesture}`);
        lastGesture = gesture;
    }
    
    gestureLabel.innerText = gesture;
    document.getElementById('gestureIcon').innerText = gestureIcons[gesture] || "❓";
    const confPercent = Math.round(confidence * 100);
    confidenceFill.style.width = `${confPercent}%`;
    confidenceText.innerText = `${confPercent}% Confidence`;
}

const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
});

camera.start();

// Modal logic
const modal = document.getElementById('settingsModal');
document.getElementById('settingsBtn').onclick = () => modal.style.display = 'flex';
document.getElementById('closeModal').onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }
