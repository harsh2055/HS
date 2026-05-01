import json

class ActionMapper:
    """Reads configuration and maps events to system actions."""
    def __init__(self, event_engine, sys_controller):
        self.engine = event_engine
        self.sys = sys_controller
        self.w_cam, self.h_cam = 640, 480
        self.w_scr, self.h_scr = 1920, 1080 # Defaults, overridden later
        
        # Default Config Fallback
        self.config = {
            "onPinchStart": "click",
            "onPointHold": "move_mouse",
            "onFistHold": "change_volume"
        }
        self.load_config()
        self._bind_events()

    def load_config(self):
        try:
            with open('config.json', 'r') as f:
                self.config = json.load(f)
        except Exception:
            print("Using default action mappings.")

    def _bind_events(self):
        # Dynamically bind events based on config
        for event, action in self.config.items():
            if action == "click":
                self.engine.subscribe(event, self._action_click)
            elif action == "move_mouse":
                self.engine.subscribe(event, self._action_move_mouse)
            elif action == "change_volume":
                self.engine.subscribe(event, self._action_change_volume)

    def _action_click(self, **kwargs):
        self.sys.click()

    def _action_move_mouse(self, **kwargs):
        lmList = kwargs.get('landmarks', [])
        if len(lmList) > 8:
            x, y = lmList[8][1], lmList[8][2]
            self.sys.move_mouse(x, y, self.w_cam, self.h_cam, self.w_scr, self.h_scr)

    def _action_change_volume(self, **kwargs):
        lmList = kwargs.get('landmarks', [])
        if len(lmList) > 8:
            import math
            # Calculate pinch distance dynamically for volume
            x1, y1 = lmList[4][1], lmList[4][2]
            x2, y2 = lmList[8][1], lmList[8][2]
            length = math.hypot(x2 - x1, y2 - y1)
            self.sys.set_volume(length)
