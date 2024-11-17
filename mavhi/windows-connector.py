import pygetwindow as gw
import win32gui
import win32con
import win32com.client
import serial
from pynput.keyboard import Controller, Key
from serial.tools import list_ports

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

def list_serial_ports():
    ports = list_ports.comports()
    return [port.device for port in ports]

def choose_serial_port():
    available_ports = list_serial_ports()
    if not available_ports:
        print("No serial ports available.")
        return None
    
    print("Available serial ports:")
    for i, port in enumerate(available_ports, start=1):
        print(f"{i}: {port}")
    
    choice = input("Choose a serial port (number): ")
    
    try:
        choice = int(choice)
        if 1 <= choice <= len(available_ports):
            return available_ports[choice - 1]
        else:
            print("Invalid choice. Using the first port.")
            return available_ports[0]
    except ValueError:
        print("Invalid choice. Using the first port.")
        return available_ports[0]

port = choose_serial_port()
if port is None:
    exit()

ser = serial.Serial(port, 9600)
keyboard = Controller()

window_title = "Des cailloux aux octets — Mozilla Firefox"

if not bring_window_to_front(window_title):
    print(f"Window '{window_title}' not found. Exiting program.")
    exit()

while True:
    if ser.in_waiting > 0:
        data = ser.readline().decode('utf-8').strip()
        
        if data == "Button1":
            bring_window_to_front(window_title)
            keyboard.press('&')
            keyboard.release('&')
        
        elif data == "Button2":
            bring_window_to_front(window_title)
            keyboard.press('à')
            keyboard.release('à')
