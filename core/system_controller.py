import pyautogui
import numpy as np
import platform

if platform.system() == "Windows":
    import comtypes
    from ctypes import cast, POINTER
    from comtypes import CLSCTX_ALL
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

pyautogui.FAILSAFE = False

class SystemController:
    """Handles OS-level interactions (Mouse, Audio)."""
    def __init__(self):
        self.volume_interface = None
        self.min_vol = 0
        self.max_vol = 0
        self.smooth_x = 0
        self.smooth_y = 0
        
        if platform.system() == "Windows":
            try:
                comtypes.CoInitialize()
                devices = AudioUtilities.GetSpeakers()
                self.volume_interface = devices.EndpointVolume
                vol_range = self.volume_interface.GetVolumeRange()
                self.min_vol = vol_range[0]
                self.max_vol = vol_range[1]
            except Exception as e:
                print("Could not initialize audio:", e)

    def set_volume(self, length, min_len=30, max_len=200):
        if not self.volume_interface: return 0, 0

        vol = np.interp(length, [min_len, max_len], [self.min_vol, self.max_vol])
        vol_per = np.interp(length, [min_len, max_len], [0, 100])
        self.volume_interface.SetMasterVolumeLevel(vol, None)
        return vol_per

    def move_mouse(self, x, y, w_cam, h_cam, w_scr, h_scr, smoothening=5):
        x_mapped = np.interp(x, [100, w_cam - 100], [0, w_scr])
        y_mapped = np.interp(y, [100, h_cam - 100], [0, h_scr])

        self.smooth_x += (x_mapped - self.smooth_x) / smoothening
        self.smooth_y += (y_mapped - self.smooth_y) / smoothening
        
        try:
            pyautogui.moveTo(w_scr - self.smooth_x, self.smooth_y)
        except Exception:
            pass

    def click(self):
        pyautogui.click()
