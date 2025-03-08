import sys
import subprocess
import time
import platform
import os
import threading
import tkinter as tk
from tkinter import scrolledtext

# Import modules common to both platforms
import serial
from serial.tools import list_ports
from pynput.keyboard import Controller
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options

# Configure paths for GeckoDriver and Firefox
if sys.platform.startswith("win"):
    GECKODRIVER_PATH = "D:\\Dev\\Outils\\geckodriver.exe"
    FIREFOX_PATH = "C:\\Program Files\\Mozilla Firefox\\firefox.exe"
else:
    GECKODRIVER_PATH = "/usr/local/bin/geckodriver"
    FIREFOX_PATH = "/usr/bin/firefox"

# Define bring_window_to_front for Windows
if sys.platform.startswith("win"):
    import pygetwindow as gw
    import win32gui
    import win32con
    import win32com.client

    def bring_window_to_front(window_title):
        try:
            windows = gw.getWindowsWithTitle(window_title)
            if not windows:
                print(f"Window with title '{window_title}' not found.")
                return False

            hwnd = windows[0]._hWnd

            win32gui.ShowWindow(hwnd, win32con.SW_SHOWMAXIMIZED)
            win32gui.SetWindowPos(hwnd, win32con.HWND_NOTOPMOST, 0, 0, 0, 0,
                                  win32con.SWP_NOMOVE + win32con.SWP_NOSIZE)
            win32gui.SetWindowPos(hwnd, win32con.HWND_TOPMOST, 0, 0, 0, 0,
                                  win32con.SWP_NOMOVE + win32con.SWP_NOSIZE)
            win32gui.SetWindowPos(hwnd, win32con.HWND_NOTOPMOST, 0, 0, 0, 0,
                                  win32con.SWP_SHOWWINDOW + win32con.SWP_NOMOVE + win32con.SWP_NOSIZE)

            shell = win32com.client.Dispatch("WScript.Shell")
            shell.SendKeys('%')
            win32gui.SetForegroundWindow(hwnd)

            print(f"Window '{window_title}' brought to the front.")
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False

# Define bring_window_to_front for Linux (using xdotool)
else:
    def bring_window_to_front(window_title):
        try:
            # Find window ID by title using xdotool
            window_id = subprocess.check_output(["xdotool", "search", "--name", window_title]).decode().strip()
            if not window_id:
                print(f"Window with title '{window_title}' not found.")
                return False
            # Activate and raise the window
            subprocess.run(["xdotool", "windowactivate", window_id])
            subprocess.run(["xdotool", "windowraise", window_id])
            print(f"Window '{window_title}' brought to the front.")
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False

# Function to open localhost in Firefox using Selenium
def open_localhost():
    options = Options()
    options.binary_location = FIREFOX_PATH

    # Enable audio autoplay and adjust Firefox preferences
    options.set_preference("media.autoplay.default", 0)
    options.set_preference("media.autoplay.allow-extension-background-pages", True)
    options.set_preference("media.autoplay.block-webaudio", False)
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

# Serial port selection
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

# Function to run HTTP server in the current directory
def run_http_server():
    # Use the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print("Starting HTTP server in", script_dir)
    # Start the HTTP server in a subprocess
    proc = subprocess.Popen([sys.executable, "-m", "http.server", "8080", "--directory", script_dir])
    return proc

# Global variables to be accessed in the GUI update loop
driver = None
ser = None
keyboard = Controller()
window_title = "Des cailloux aux octets — Mozilla Firefox"

def update_gui(url_label, serial_text):
    """Update the Tkinter label with the current URL and process serial input."""
    global driver, ser

    # Update URL from Firefox
    try:
        current_url = driver.current_url
        url_label.config(text="Current URL: " + current_url)
    except Exception as e:
        url_label.config(text="Error retrieving current URL: " + str(e))
    
    # Process serial input if available
    if ser:
        try:
            if ser.in_waiting > 0:
                data = ser.readline().decode('utf-8').strip()
                # Append incoming serial data to the text area
                serial_text.insert(tk.END, data + "\n")
                serial_text.see(tk.END)
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
        except Exception as e:
            print("Error reading from serial port:", e)
    
    # Schedule next update after 1000 ms
    url_label.after(1000, update_gui, url_label, serial_text)

def send_strobe():
    def worker():
        global ser
        if ser:
            try:
                ser.write(b"strobe\n")
                ser.flush()
                print("Sent 'strobe' to serial port.")
            except Exception as e:
                print("Error sending 'strobe':", e)
        else:
            print("No serial port open. Cannot send 'strobe'.")
    
    threading.Thread(target=worker, daemon=True).start()

# Main execution flow
def main():
    global driver, ser

    port = choose_serial_port()
    if port:
        try:
            ser = serial.Serial(port, 9600)
        except Exception as e:
            print(f"Error opening serial port: {e}")
            ser = None

    # Start HTTP server serving the current directory
    http_server_proc = run_http_server()
    time.sleep(1)

    driver = open_localhost()
    if driver is None:
        print("Failed to open localhost. Exiting program.")
        sys.exit()

    # Update window title as needed; this is an example title for Firefox.
    if not bring_window_to_front(window_title):
        print(f"Window '{window_title}' not found. Exiting program.")
        sys.exit()

    # Create a small Tkinter interface to display the current URL
    root = tk.Tk()
    root.title("M.A.V.Hi.")
    root.geometry("600x400")

    url_label = tk.Label(root, text="Retrieving URL...", font=("Arial", 14), padx=10, pady=10)
    url_label.pack(fill='x')

    # Add a button to send "strobe" on the serial port
    strobe_button = tk.Button(root, text="Send 'strobe'", font=("Arial", 12), command=send_strobe)
    strobe_button.pack(pady=5)

    # Scrolled text widget to display incoming serial data
    serial_text = scrolledtext.ScrolledText(root, wrap=tk.WORD, font=("Arial", 12), height=10)
    serial_text.pack(expand=True, fill='both', padx=10, pady=10)
    
    # Start the periodic update loop
    root.after(1000, update_gui, url_label, serial_text)

    print("Interface launched. Close the window or press Ctrl+C in the terminal to exit.")
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("Exiting program...")
    finally:
        http_server_proc.terminate()

if __name__ == '__main__':
    main()
