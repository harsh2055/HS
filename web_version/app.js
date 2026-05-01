const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const fpsElement = document.getElementById('fps');
const loadingElement = document.getElementById('loading');

let lastFrameTime = performance.now();
let fps = 0;

function onResults(results) {
  // Hide loading text once results start coming in
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }

  // Calculate FPS
  const currentFrameTime = performance.now();
  fps = Math.round(1000 / (currentFrameTime - lastFrameTime));
  lastFrameTime = currentFrameTime;
  fpsElement.innerText = `FPS: ${fps}`;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  // Draw the video frame
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
      
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      // The python code draws a filled magenta circle on the first landmark (id == 0)
      const lm0 = landmarks[0];
      if (lm0) {
        const cx = lm0.x * canvasElement.width;
        const cy = lm0.y * canvasElement.height;
        
        canvasCtx.beginPath();
        canvasCtx.arc(cx, cy, 10, 0, 2 * Math.PI);
        canvasCtx.fillStyle = '#ff00ff';
        canvasCtx.fill();
      }

      // Draw the rest of the landmarks and connections
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1, radius: 3});
    }
  }
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

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});

// Start the camera
camera.start().catch(err => {
    console.error(err);
    alert("Camera failed to start. Please allow camera permissions.");
});
