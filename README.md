# 🌌 Aether Gesture Platform v3.0

**Production-grade, intelligent, and extensible gesture interaction system.**

Aether transforms standard webcam input into a powerful spatial interaction layer. It uses AI-enhanced landmark tracking to control your OS, browser, and applications with sub-millimeter precision.

---

## 🚀 Key Upgrades in v3.0

### 🧠 1. AI-Powered Recognition
The system now features an integrated **Scikit-Learn Random Forest Classifier**. 
* **Hybrid Logic:** Automatically falls back to high-precision rule-based detection if the AI confidence drops below 65%.
* **Training Kit:** Includes `scripts/collect_data.py` and `ml/train.py` to add your own custom gestures.

### 🛡️ 2. Stability & Smoothing
* **Temporal Filtering:** Uses rolling majority voting to eliminate "gesture flickering."
* **Confidence Gating:** Every gesture is verified against a confidence threshold before firing an event.
* **Interpolated Motion:** Mouse tracking uses exponential smoothing for buttery-smooth cursor movement.

### 🔌 3. Plugin Architecture
The `ActionMapper` is now a modular plugin system. 
* **Dynamic Loading:** Easily swap between `mouse`, `volume`, and `presentation` modes.
* **SDK Ready:** Developers can subscribe to events (`onPinchStart`, `onSwipeLeft`) and build custom integrations in minutes.

### 👐 4. Multi-Hand Interactions
Full support for dual-hand gestures including **Two-Hand Zoom** (distance based) and **Rotation**.

### 🎨 5. Premium Web Experience
The web version has been overhauled with a **Next-Gen HUD**:
* **Glow FX:** Real-time hand skeleton glow and aesthetic rendering.
* **Smart Dashboard:** Live event stream, plugin status, and confidence bars.
* **Responsive Design:** Dark-mode optimized for desktop and mobile displays.

---

## 🛠️ Installation & Setup

### 📦 Installable Tool
You can now install Aether as a local package:
```bash
pip install -e .
```
Then run simply with:
```bash
aether
```

### 🐍 Python Requirements
Ensure you have the core stack installed:
```bash
pip install opencv-python mediapipe numpy scikit-learn pyautogui pycaw comtypes
```

### 🧠 Training Your Own Model
1. **Collect Data:** `python scripts/collect_data.py <gesture_name>`
2. **Train:** `python ml/train.py`
3. **Run:** The system will automatically detect the new `ml/model.pkl`.

---

## ⌨️ Default Mappings (`config.json`)

| Gesture | Event | Action |
| :--- | :--- | :--- |
| **Point (Index)** | `onPointHold` | Smooth Mouse Move |
| **Pinch** | `onPinchStart` | Left Click |
| **Fist** | `onFistHold` | Drag & Drop |
| **Peace** | `onPeaceHold` | Vertical Scroll |
| **Thumbs Up** | `onThumbsUpStart`| Right Click |
| **Swipe (L/R)** | `onSwipe` | Next/Prev Slide |

---

## 💻 Web Version
Run the local web server:
```bash
cd web_version
python -m http.server 8000
```
Visit `http://localhost:8000` to experience the premium interactive dashboard.
