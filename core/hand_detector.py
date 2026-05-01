import cv2
import mediapipe as mp
import math

class HandDetector:
    def __init__(self, static_image_mode=False, max_num_hands=2, model_complexity=1, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mpHands = mp.solutions.hands
        self.hands = self.mpHands.Hands(
            static_image_mode=static_image_mode, 
            max_num_hands=max_num_hands, 
            model_complexity=model_complexity, 
            min_detection_confidence=min_detection_confidence, 
            min_tracking_confidence=min_tracking_confidence
        )
        self.mpDraw = mp.solutions.drawing_utils
        self.tipIds = [4, 8, 12, 16, 20]
        self.results = None
        self.lmList = []

    def process_frame(self, img, draw=True):
        """Processes the frame and draws landmarks. Returns the image."""
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.hands.process(imgRGB)

        if self.results.multi_hand_landmarks:
            for handLms in self.results.multi_hand_landmarks:
                if draw:
                    self.mpDraw.draw_landmarks(img, handLms, self.mpHands.HAND_CONNECTIONS)
        return img

    def get_landmarks(self, img, handNo=0, draw=True):
        """Extracts and returns landmark coordinates."""
        self.lmList = []
        center_pos = None
        if self.results and self.results.multi_hand_landmarks:
            myHand = self.results.multi_hand_landmarks[handNo]
            h, w, c = img.shape
            
            # Calculate hand center (approximate using wrist and middle finger MCP)
            cx = int(myHand.landmark[9].x * w)
            cy = int(myHand.landmark[9].y * h)
            center_pos = (cx, cy)
            
            for id, lm in enumerate(myHand.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                self.lmList.append([id, cx, cy])
                if draw:
                    cv2.circle(img, (cx, cy), 5, (255, 0, 255), cv2.FILLED)
        return self.lmList, center_pos

    def get_fingers_up(self):
        """Returns binary array of fingers up [Thumb, Index, Middle, Ring, Pinky]"""
        fingers = []
        if len(self.lmList) != 0:
            # Thumb (Checking x axis, right hand heuristic)
            if self.lmList[self.tipIds[0]][1] > self.lmList[self.tipIds[0] - 1][1]:
                fingers.append(1)
            else:
                fingers.append(0)

            # 4 Fingers (Checking y axis)
            for id in range(1, 5):
                if self.lmList[self.tipIds[id]][2] < self.lmList[self.tipIds[id] - 2][2]:
                    fingers.append(1)
                else:
                    fingers.append(0)
        return fingers

    def find_distance(self, p1, p2):
        """Find distance between two landmarks (returns length, point details)"""
        if len(self.lmList) < max(p1, p2) + 1:
            return 0, [0, 0, 0, 0, 0, 0]
            
        x1, y1 = self.lmList[p1][1], self.lmList[p1][2]
        x2, y2 = self.lmList[p2][1], self.lmList[p2][2]
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

        length = math.hypot(x2 - x1, y2 - y1)
        return length, [x1, y1, x2, y2, cx, cy]
