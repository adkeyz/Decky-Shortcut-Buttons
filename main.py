import os
import json
import time
import struct
import fcntl

import decky

# ---- Linux uinput constants (virtual keyboard) ----
UI_SET_EVBIT = 0x40045564
UI_SET_KEYBIT = 0x40045565
UI_DEV_SETUP = 0x405C5503
UI_DEV_CREATE = 0x5501
UI_DEV_DESTROY = 0x5502
EV_SYN = 0x00
EV_KEY = 0x01

# Key name -> Linux evdev key code. Keep in sync with KEYS in src/index.tsx
KEYMAP = {
    "esc": 1, "enter": 28, "tab": 15, "space": 57, "backspace": 14,
    "delete": 111, "insert": 110, "home": 102, "end": 107,
    "pageup": 104, "pagedown": 109, "printscreen": 99,
    "up": 103, "down": 108, "left": 105, "right": 106,
    "f1": 59, "f2": 60, "f3": 61, "f4": 62, "f5": 63, "f6": 64,
    "f7": 65, "f8": 66, "f9": 67, "f10": 68, "f11": 87, "f12": 88,
    "1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 7, "7": 8, "8": 9,
    "9": 10, "0": 11,
    "q": 16, "w": 17, "e": 18, "r": 19, "t": 20, "y": 21, "u": 22,
    "i": 23, "o": 24, "p": 25, "a": 30, "s": 31, "d": 32, "f": 33,
    "g": 34, "h": 35, "j": 36, "k": 37, "l": 38, "z": 44, "x": 45,
    "c": 46, "v": 47, "b": 48, "n": 49, "m": 50,
}
MODMAP = {"ctrl": 29, "shift": 42, "alt": 56, "meta": 125}

DEFAULT_SHORTCUTS = [
    {"id": "1", "name": "Close window (Alt+F4)", "mods": ["alt"], "key": "f4"},
    {"id": "2", "name": "Fullscreen (Alt+Enter)", "mods": ["alt"], "key": "enter"},
    {"id": "3", "name": "Switch window (Alt+Tab)", "mods": ["alt"], "key": "tab"},
]


class Plugin:
    fd = None

    # ---------- virtual keyboard ----------
    def _open_device(self):
        if self.fd is not None:
            return
        fd = os.open("/dev/uinput", os.O_WRONLY | os.O_NONBLOCK)
        fcntl.ioctl(fd, UI_SET_EVBIT, EV_KEY)
        for code in list(KEYMAP.values()) + list(MODMAP.values()):
            fcntl.ioctl(fd, UI_SET_KEYBIT, code)
        # struct uinput_setup: input_id (4x u16) + name[80] + ff_effects_max (u32)
        name = b"Decky Shortcut Buttons"
        setup = struct.pack("HHHH80sI", 0x03, 0x1234, 0x5678, 1, name, 0)
        fcntl.ioctl(fd, UI_DEV_SETUP, setup)
        fcntl.ioctl(fd, UI_DEV_CREATE)
        time.sleep(0.3)  # give the system a moment to register the device
        self.fd = fd

    def _emit(self, etype, code, value):
        os.write(self.fd, struct.pack("llHHi", 0, 0, etype, code, value))

    def _key(self, code, down):
        self._emit(EV_KEY, code, 1 if down else 0)
        self._emit(EV_SYN, 0, 0)

    # ---------- settings ----------
    def _settings_path(self):
        return os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "shortcuts.json")

    # ---------- methods callable from the UI ----------
    async def get_shortcuts(self):
        try:
            with open(self._settings_path(), "r") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_SHORTCUTS

    async def save_shortcuts(self, shortcuts):
        os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
        with open(self._settings_path(), "w") as f:
            json.dump(shortcuts, f, indent=2)
        return True

    async def send_shortcut(self, mods, key):
        try:
            self._open_device()
            codes = [MODMAP[m] for m in mods if m in MODMAP]
            main = KEYMAP[key]
            for c in codes:
                self._key(c, True)
                time.sleep(0.02)
            self._key(main, True)
            time.sleep(0.05)
            self._key(main, False)
            for c in reversed(codes):
                time.sleep(0.02)
                self._key(c, False)
            return True
        except Exception as e:
            decky.logger.error(f"send_shortcut failed: {e}")
            return False

    # ---------- lifecycle ----------
    async def _main(self):
        decky.logger.info("Shortcut Buttons loaded")

    async def _unload(self):
        if self.fd is not None:
            try:
                fcntl.ioctl(self.fd, UI_DEV_DESTROY)
                os.close(self.fd)
            except Exception:
                pass
            self.fd = None
