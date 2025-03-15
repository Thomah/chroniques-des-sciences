import pygetwindow as gw
import win32gui
import win32con
import win32com.client
import serial
from pynput.keyboard import Controller, Key
from serial.tools import list_ports
import time
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
import shutil

GECKODRIVER_PATH = "D:\\Dev\\Outils\\geckodriver.exe"
FIREFOX_PATH = "C:\\Program Files\\Mozilla Firefox\\firefox.exe"

def bring_window_to_front(window_title):
    try:
      window = gw.getWindowsWithTitle(window_title)
      if not window:
          print(f"Window with title '{window_title}' not found.")
          return

      hwnd = window[0]._hWnd

      win32gui.ShowWindow(hwnd, win32con.SW_SHOWMAXIMIZED)
      win32gui.SetWindowPos(hwnd,win32con.HWND_NOTOPMOST, 0, 0, 0, 0, win32con.SWP_NOMOVE + win32con.SWP_NOSIZE)  
      win32gui.SetWindowPos(hwnd,win32con.HWND_TOPMOST, 0, 0, 0, 0, win32con.SWP_NOMOVE + win32con.SWP_NOSIZE)  
      win32gui.SetWindowPos(hwnd,win32con.HWND_NOTOPMOST, 0, 0, 0, 0, win32con.SWP_SHOWWINDOW + win32con.SWP_NOMOVE + win32con.SWP_NOSIZE)

      shell = win32com.client.Dispatch("WScript.Shell")
      shell.SendKeys('%')
      win32gui.SetForegroundWindow(hwnd)

      print(f"Window '{window_title}' brought to the front.")
      return True
    except Exception as e:
      print(f"Error: {e}")
      return False

def open_localhost():
    options = Options()
    options.binary_location = FIREFOX_PATH

    # Enable audio autoplay
    options.set_preference("media.autoplay.default", 0)  # 0 = allow all, 1 = block audio, 5 = block all
    options.set_preference("media.autoplay.allow-extension-background-pages", True)
    options.set_preference("media.autoplay.block-webaudio", False)
    
    # Disable Firefox popup asking for permission
    options.set_preference("media.volume_scale", "1.0")

    service = Service(GECKODRIVER_PATH)
    driver = webdriver.Firefox(service=service, options=options)
    
    try:
        driver.get("http://localhost:8080")
        print("Opened http://localhost:8080 in Firefox")
        return driver
    except Exception as e:
        print(f"Error opening localhost: {e}")
        driver.quit()
        return None

def list_serial_ports():
    ports = list_ports.comports()
    return [port.device for port in ports]

def choose_serial_port():
    available_ports = list_serial_ports()
    print("Available serial ports:")
    if not available_ports:
        print("No serial ports available.")
    else:
        for i, port in enumerate(available_ports, start=1):
            print(f"{i}: {port}")
    
    print("0: Proceed without a serial port")
    
    choice = input("Choose a serial port (number): ")
    
    try:
        choice = int(choice)
        if choice == 0:
            return None
        elif 1 <= choice <= len(available_ports):
            return available_ports[choice - 1]
        else:
            print("Invalid choice. Using no serial port.")
            return None
    except ValueError:
        print("Invalid input. Using no serial port.")
        return None

port = choose_serial_port()
keyboard = Controller()

driver = open_localhost()
if driver is None:
    print("Failed to open localhost. Exiting program.")
    exit()

window_title = "Des cailloux aux octets — Mozilla Firefox"
if not bring_window_to_front(window_title):
    print(f"Window '{window_title}' not found. Exiting program.")
    exit()

if port:
    ser = serial.Serial(port, 9600)
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode('utf-8').strip()
            
            if data == "ARCADE_RED_BUTTON_PRESSED":
                print("Arcade Red Button pressed")
                bring_window_to_front(window_title)
                keyboard.press('&')
                keyboard.release('&')
            
            elif data == "ARCADE_BLUE_BUTTON_PRESSED":
                print("Arcade Blue Button pressed")
                bring_window_to_front(window_title)
                keyboard.press('à')
                keyboard.release('à')
else:
    print("No serial port selected. Serial-related features are disabled.")