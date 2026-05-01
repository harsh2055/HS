# Aether: Advanced Gesture Interaction System

A highly polished, extensible, and intelligent hand tracking and gesture interaction framework. It features a robust Python backend for OS-level control (virtual mouse, volume) and a premium Web Interface for browser-based interactions.

**Live Web Demo:** [https://hs-sand.vercel.app/](https://hs-sand.vercel.app/)

---

## 🏗️ Architecture

The system has been completely rewritten into a modular, event-driven architecture suitable for production:

### 1. `core/hand_detector.py`
A wrapper around MediaPipe Hands that extracts landmarks, calculates center points, and tracks finger states.

### 2. `core/gesture_recognizer.py`
Performs raw, frame-by-frame gesture classification (e.g., Pinch, Fist, Open Palm).

### 3. `core/event_engine.py` (The Brain)
Implements temporal smoothing (majority voting over a rolling buffer) to eliminate flickering. It tracks gesture state transitions (`Start`, `Hold`, `End`) and calculates velocity for dynamic gestures (`SwipeLeft`, `SwipeRight`). Emits clean events to subscribers.

### 4. `core/system_controller.py`
Handles all OS-level side effects (moving the mouse via `pyautogui`, controlling Windows volume via `pycaw`).

### 5. `core/action_mapper.py` & `config.json`
Provides a decoupled configuration layer. You can dynamically map engine events to system actions by simply editing `config.json` (e.g., mapping `"onPinchStart": "click"`).

---

## 💻 Web Version (Showcase)

The `web_version/` directory contains a portfolio-grade JavaScript implementation of the Aether architecture. 

**Features:**
* **Premium Landing Page:** Glassmorphism UI with CSS grid layout.
* **JS Event Engine:** Temporal smoothing and pub/sub event logging built natively in ES6 JavaScript.
* **Smart HUD:** Real-time state logging, FPS tracking, and visual feedback overlays on the canvas.

To run locally:
```bash
cd web_version
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## 🚀 Running the Python OS Controller

Ensure you are using **Python 3.11** (due to MediaPipe legacy module compatibility on Windows).

**Install Dependencies:**
```bash
py -3.11 -m pip install opencv-python mediapipe==0.10.14 pyautogui pycaw comtypes
```

**Run the System:**
```bash
py -3.11 main.py
```

**Default Controls (`config.json`):**
* **Hold 'Point' (Index up):** Move virtual mouse.
* **Pinch:** Click mouse.
* **Hold 'Fist':** Control master volume (mapped to hand distance from center).
* **Open Palm:** Idle/Reset.
