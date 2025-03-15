import subprocess
import serial
from pynput.keyboard import Controller
from serial.tools import list_ports

def bring_window_to_front(window_title):
    try:
        result = subprocess.run(["xdotool", "search", "--name", window_title], capture_output=True, text=True)
        windows = result.stdout.strip().split("\n")
        
        if not windows or windows[0] == '':
            print(f"Window with title '{window_title}' not found.")
            return False
        
        window_id = windows[0]
        subprocess.run(["xdotool", "windowactivate", window_id])
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
