const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const fpsElement = document.getElementById('fps');
const gestureLabelElement = document.getElementById('gestureLabel');
const loadingElement = document.getElementById('loading');
const toggleBtn = document.getElementById('toggleCamera');

let lastFrameTime = performance.now();
let fps = 0;
let isCameraRunning = true;
let camera = null;

// Helper function to detect fingers up
function getFingers(landmarks) {
    const tipIds = [4, 8, 12, 16, 20];
    let fingers = [];
    
    // Thumb (Right Hand check, mirrored for UI)
    if (landmarks[tipIds[0]].x > landmarks[tipIds[0] - 1].x) {
        fingers.push(1);
    } else {
        fingers.push(0);
    }

    // 4 fingers
    for (let i = 1; i < 5; i++) {
        if (landmarks[tipIds[i]].y < landmarks[tipIds[i] - 2].y) {
            fingers.push(1);
        } else {
            fingers.push(0);
        }
    }
    return fingers;
}

// Helper function to recognize gestures
function recognizeGesture(fingers, landmarks, canvasW, canvasH) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const dx = (thumbTip.x * canvasW) - (indexTip.x * canvasW);
    const dy = (thumbTip.y * canvasH) - (indexTip.y * canvasH);
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 40) return "Pinch";
    
    const fStr = fingers.join('');
    if (fStr === '11111') return "Open Palm";
    if (fStr === '00000') return "Fist";
    if (fStr === '01100' || fStr === '11100') return "Peace";
    if (fStr === '10000' || fStr === '10001') return "Thumbs Up";
    
    return "Unknown";
}

function onResults(results) {
  if (loadingElement) loadingElement.style.display = 'none';

  // Calculate FPS
  const currentFrameTime = performance.now();
  fps = Math.round(1000 / (currentFrameTime - lastFrameTime));
  lastFrameTime = currentFrameTime;
  fpsElement.innerText = `FPS: ${fps}`;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      
  let detectedGesture = "None";

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (const landmarks of results.multiHandLandmarks) {
      
      const fingers = getFingers(landmarks);
      detectedGesture = recognizeGesture(fingers, landmarks, canvasElement.width, canvasElement.height);

      // Draw standard landmarks
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#58a6ff', lineWidth: 4});
      drawLandmarks(canvasCtx, landmarks, {color: '#ff7b72', lineWidth: 2, radius: 4});

      // Special highlight for pinch
      if (detectedGesture === "Pinch") {
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const cx = (thumbTip.x + indexTip.x) / 2 * canvasElement.width;
          const cy = (thumbTip.y + indexTip.y) / 2 * canvasElement.height;
          canvasCtx.beginPath();
          canvasCtx.arc(cx, cy, 15, 0, 2 * Math.PI);
          canvasCtx.fillStyle = '#3fb950';
          canvasCtx.fill();
      }
    }
  }
  
  gestureLabelElement.innerText = `Gesture: ${detectedGesture}`;
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);

camera = new Camera(videoElement, {
  onFrame: async () => {
    if (isCameraRunning) {
        await hands.send({image: videoElement});
    }
  },
  width: 800,
  height: 600
});

camera.start().catch(err => {
    console.error(err);
    alert("Camera failed to start. Please allow camera permissions.");
});

// Start/Stop Camera Toggle
toggleBtn.addEventListener('click', () => {
    isCameraRunning = !isCameraRunning;
    if (isCameraRunning) {
        toggleBtn.innerText = "Stop Camera";
        toggleBtn.classList.remove('stopped');
        videoElement.play();
    } else {
        toggleBtn.innerText = "Start Camera";
        toggleBtn.classList.add('stopped');
        videoElement.pause();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        fpsElement.innerText = `FPS: 0`;
        gestureLabelElement.innerText = `Gesture: None`;
    }
});
