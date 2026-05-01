import collections
import time

class EventEngine:
    """
    Handles temporal smoothing of gestures, state management, 
    and event dispatching (Observer Pattern).
    """
    def __init__(self, buffer_size=10):
        self.history = collections.deque(maxlen=buffer_size)
        self.current_state = "None"
        self.subscribers = {}
        
        self.last_center = None
        self.last_time = time.time()
        
    def subscribe(self, event_name, callback):
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        self.subscribers[event_name].append(callback)
        
    def emit(self, event_name, **kwargs):
        if event_name in self.subscribers:
            for callback in self.subscribers[event_name]:
                callback(**kwargs)

    def update(self, raw_gesture, center_pos, lmList):
        if raw_gesture == "None":
            self.history.clear()
            smoothed_gesture = "None"
        else:
            self.history.append(raw_gesture)
            # Majority vote
            smoothed_gesture = collections.Counter(self.history).most_common(1)[0][0]
            
        # 1. State Transitions
        if smoothed_gesture != self.current_state:
            if self.current_state != "None":
                self.emit(f"on{self.current_state}End")
            
            self.current_state = smoothed_gesture
            
            if self.current_state != "None":
                self.emit(f"on{self.current_state}Start", center=center_pos)
                
        # 2. Hold events
        if self.current_state != "None":
            self.emit(f"on{self.current_state}Hold", center=center_pos, landmarks=lmList)

        # 3. Dynamic Gestures (Swipe/Drag)
        curr_time = time.time()
        if self.last_center and center_pos and (curr_time - self.last_time > 0):
            dx = center_pos[0] - self.last_center[0]
            dy = center_pos[1] - self.last_center[1]
            dt = curr_time - self.last_time
            vx = dx / dt
            vy = dy / dt
            
            # Swipe Threshold
            if abs(vx) > 800 and abs(vx) > abs(vy) * 1.5:
                if vx > 0:
                    self.emit("onSwipeRight")
                else:
                    self.emit("onSwipeLeft")
                # Clear to prevent double triggering
                self.last_center = None 
                return smoothed_gesture

        if center_pos is not None:
            self.last_center = center_pos
        self.last_time = curr_time
        
        return smoothed_gesture
