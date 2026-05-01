# Hand Tracking Live 🖐️

A real-time, high-performance hand tracking application built with MediaPipe and JavaScript. This project allows users to track hand landmarks directly in their web browser using their webcam, with zero backend processing required.

**Live Demo:** [https://hs-sand.vercel.app/](https://hs-sand.vercel.app/)

---

## 🌟 Features

- **Real-time Tracking:** Instant detection and tracking of hand landmarks.
- **FPS Monitoring:** Live frames-per-second display to monitor performance.
- **Interactive Visuals:** Dynamic rendering of hand connections and key points on an HTML5 Canvas.
- **Mirror Mode:** The video feed is mirrored to provide a natural "mirror-like" user experience.
- **Privacy-First:** All processing happens locally on the user's device using WebAssembly—no video data is sent to any server.

---

## 🛠️ Technologies Used

- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html):** A high-fidelity hand and finger tracking solution.
- **JavaScript (ES6+):** Core logic for processing video frames and rendering visuals.
- **HTML5 Canvas:** High-performance drawing of landmarks and connectors.
- **CSS3:** Modern, dark-themed responsive UI.
- **Vercel:** Cloud hosting for seamless deployment.

---

## 🚀 How it Works

### 1. Camera Initialization
The application utilizes the `navigator.mediaDevices.getUserMedia` API (via MediaPipe's `Camera` utility) to request access to the user's webcam and start a live video stream.

### 2. MediaPipe Hand Model
We initialize the MediaPipe `Hands` model with the following configuration:
- **Model Complexity:** Balanced for performance and accuracy.
- **Min Detection Confidence:** 0.5 (Ensures a hand is actually present).
- **Min Tracking Confidence:** 0.5 (Maintains tracking even during fast movement).

### 3. Frame Processing
For every frame captured by the webcam:
- The frame is passed to the MediaPipe `hands.send()` method.
- MediaPipe processes the image using a machine learning pipeline to identify 21 unique hand landmarks (joints).

### 4. Real-time Rendering
The results are passed to a callback function where:
- The raw video frame is drawn onto an HTML5 Canvas.
- The 21 landmarks and their corresponding connections are overlaid on the canvas using `drawing_utils`.
- A special highlight is applied to the wrist landmark (ID 0) for visual emphasis.

---

## 💻 Running Locally

To run this project on your own machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harsh2055/HS.git
   cd HS/web_version
   ```

2. **Serve the files:**
   Since webcam access requires a secure context or a local server, use a tool like `npx serve`:
   ```bash
   npx serve .
   ```

3. **Open in Browser:**
   Navigate to `http://localhost:3000`.

---

## 📦 Deployment

This project is optimized for **Vercel**. To deploy your own version:
1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Set the **Root Directory** to `web_version`.
4. Click **Deploy**.

---

## 📜 License
Distributed under the MIT License.
