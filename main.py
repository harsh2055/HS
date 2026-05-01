import cv2
import time
import pyautogui
from core.hand_detector import HandDetector
from core.gesture_recognizer import GestureRecognizer
from core.event_engine import EventEngine
from core.system_controller import SystemController
from core.action_mapper import ActionMapper

def main():
    wCam, hCam = 640, 480
    cap = cv2.VideoCapture(0)
    cap.set(3, wCam)
    cap.set(4, hCam)

    # Core Components
    detector = HandDetector(max_num_hands=1)
    recognizer = GestureRecognizer(detector)
    engine = EventEngine(buffer_size=5) # 5 frames smoothing
    sys_ctrl = SystemController()
    
    # Action Mapping
    mapper = ActionMapper(engine, sys_ctrl)
    # Set screen sizes dynamically
    wScr, hScr = pyautogui.size()
    mapper.w_scr, mapper.h_scr = wScr, hScr
    mapper.w_cam, mapper.h_cam = wCam, hCam

    # UI Variables
    pTime = 0
    volBar = 400

    print("🚀 Advanced Gesture Interaction System Running!")
    print("Press 'q' to quit.")

    while True:
        success, img = cap.read()
        if not success:
            break

        img = cv2.flip(img, 1)

        # 1. Detection Phase
        img = detector.process_frame(img, draw=True)
        lmList, center_pos = detector.get_landmarks(img, draw=False)

        # 2. Recognition Phase
        raw_gesture = recognizer.get_raw_gesture(lmList)

        # 3. Event Phase (Emits actions via mapper)
        smoothed_gesture = engine.update(raw_gesture, center_pos, lmList)

        # UI Overlays
        cTime = time.time()
        fps = int(1 / (cTime - pTime)) if pTime != 0 else 0
        pTime = cTime

        cv2.putText(img, f'FPS: {fps}', (20, 50), cv2.FONT_HERSHEY_DUPLEX, 1, (255, 100, 100), 2)
        cv2.putText(img, f'State: {smoothed_gesture}', (20, 90), cv2.FONT_HERSHEY_DUPLEX, 1, (0, 255, 100), 2)
        
        # Guide Rectangle for Mouse
        cv2.rectangle(img, (100, 100), (wCam - 100, hCam - 100), (255, 0, 255), 2)

        cv2.imshow("Advanced Gesture System", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
