import sys
import subprocess
import time
import os
import re
import threading
import yaml
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext
from urllib.parse import urlparse

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

def log_to_serial_text(message):
    print(message)
    if ui_elements.get("serial_text") is not None:
        ui_elements.get("serial_text").insert(tk.END, f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")
        ui_elements.get("serial_text").see(tk.END)

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
                log_to_serial_text(f"Window with title '{window_title}' not found.")
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

            log_to_serial_text(f"Window '{window_title}' brought to the front.")
            return True
        except Exception as e:
            log_to_serial_text(f"Error: {e}")
            return False

# Define bring_window_to_front for Linux (using xdotool)
else:
    def bring_window_to_front(window_title):
        try:
            # Find window ID by title using xdotool
            window_id = subprocess.check_output(["xdotool", "search", "--name", window_title]).decode().strip()
            if not window_id:
                log_to_serial_text(f"Window with title '{window_title}' not found.")
                return False
            # Activate and raise the window
            subprocess.run(["xdotool", "windowactivate", window_id])
            subprocess.run(["xdotool", "windowraise", window_id])
            log_to_serial_text(f"Window '{window_title}' brought to the front.")
            return True
        except Exception as e:
            log_to_serial_text(f"Error: {e}")
            return False

# Function to open localhost in Firefox using Selenium
def open_slides():
    global driver

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
        log_to_serial_text("Opened http://localhost:8080 in Firefox")

        # Open a new tab and navigate to webcam.html
        driver.execute_script("window.open('http://localhost:8080/webcam.html', '_blank');")
        log_to_serial_text("Opened webcam.html in a new tab")

        # Update window title as needed; this is an example title for Firefox.
        if not bring_window_to_front(window_title):
            log_to_serial_text(f"Window '{window_title}' not found. Exiting program.")

        update_gui()

        # Replace "Open Firefox" button with "Close Slides"
        ui_elements["open_slides_button"].config(text="Close Slides", command=close_slides)

        return driver
    except Exception as e:
        log_to_serial_text(f"Error opening localhost: {e}")
        driver.quit()
        return None

def close_slides():
    global driver

    if driver:
        driver.quit()  # Close the Firefox browser
        driver = None
        log_to_serial_text("Slides closed successfully.")

    # Restore UI button to "Open Firefox"
    ui_elements["open_slides_button"].config(text="Open Firefox", command=open_slides)

# Serial port selection
def list_serial_ports():
    ports = list_ports.comports()
    return [port.device for port in ports]

def choose_serial_port():
    available_ports = list_ports.comports()
    ports = [port.device for port in available_ports]
    return ports

# Function to run HTTP server in the current directory
def run_http_server():
    # Use the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_to_serial_text(f"Starting HTTP server in {script_dir}")
    # Start the HTTP server in a subprocess
    proc = subprocess.Popen([sys.executable, "-m", "http.server", "8080", "--directory", script_dir])
    return proc

# Load states from YAML file
def load_states():
    try:
        with open("states.yaml", "r", encoding="utf-8") as file:
            return yaml.safe_load(file)
    except Exception as e:
        log_to_serial_text(f"Error loading states.yaml: {e}")
        return {}

def reload_state():
    global STATES
    STATES = load_states()
    log_to_serial_text("State reloaded successfully.")

# Function to parse URL and extract state
def get_current_state(url):
    parsed_url = urlparse(url)
    path_parts = parsed_url.fragment.strip('/').split('/')
    state = [int(part) for part in path_parts if part.isdigit()]
    if len(state) < 2:
        state = state + [0] * (2 - len(state))  # Ensure at least two elements
    state_key = "_".join(map(str, state[:2]))  # Use only first two elements as state key
    fragment_index = state[2] if len(state) > 2 else None  # Last number is fragment index, None if not set
    return state_key, fragment_index

def get_current_human_speach(state_key, fragment_index):
    state_data = STATES.get(state_key, [])
    args_list = []
    
    if fragment_index is None:
        for j in range(0, len(state_data)):
            next_entry = state_data[j]
            if next_entry.get("trigger") == "fragment" and next_entry.get("exec") != "human":
                break
            elif next_entry.get("trigger") == "fragment" and next_entry.get("exec") == "human":
                text = re.findall(r'\*\*(.*?)\*\*', next_entry.get("args", ""))
                args_list.extend(text)
            elif next_entry.get("exec") == "human":
                text = re.findall(r'\*\*(.*?)\*\*', next_entry.get("args", ""))
                args_list.extend(text)
            else:
                args_list.append("")
        return {
            "exec": "human",
            "args": "\n".join([arg for arg in args_list if arg.strip() != ""])
        }
    
    fragment_count = -1
    
    for i, entry in enumerate(state_data):
        if fragment_count == fragment_index:
            for j in range(i, len(state_data)):
                next_entry = state_data[j]
                if next_entry.get("trigger") == "fragment" and next_entry.get("exec") != "human":
                    break
                elif next_entry.get("trigger") == "fragment" and next_entry.get("exec") == "human":
                    text = re.findall(r'\*\*(.*?)\*\*', next_entry.get("args", ""))
                    args_list.extend(text)
                elif next_entry.get("exec") == "human":
                    text = re.findall(r'\*\*(.*?)\*\*', next_entry.get("args", ""))
                    args_list.extend(text)
                else:
                    args_list.append("")
            return {
                "exec": "human",
                "args": "\n".join([arg for arg in args_list if arg.strip() != ""])
            }
        if(entry.get("trigger") == "fragment"):
            fragment_count += 1
    
    return {"exec": "human", "args": "/"}

def get_next_speak_message(state_key, fragment_index):
    state_data = STATES.get(state_key, [])
    
    # If fragment_index is None, default to 0
    if fragment_index is None:
        next_fragment_index = 0
    else:
        next_fragment_index = fragment_index + 1
    
    # Initialize a counter for fragments
    fragment_count = 0
    
    for i, entry in enumerate(state_data):
        if entry.get("trigger") == "fragment":
            if fragment_count == next_fragment_index:
                for j in range(i, len(state_data)):
                    next_entry = state_data[j]
                    if next_entry.get("trigger") == "fragment":
                        return {
                            "state_key": state_key,
                            "next_fragment_index": next_fragment_index,
                            "exec": next_entry.get("exec", ""),
                            "args": next_entry.get("args", "")
                        }
            fragment_count += 1
    
    return {
        "state_key": state_key,
        "next_fragment_index": next_fragment_index,
        "exec": "No more fragment on current slide.",
        "args": ""
    }

def get_exec_color(exec_value):
    """Return a color based on the exec value."""
    colors = {
        "human": "red",
        "speak": "blue",
        "audio": "yellow"
    }
    return colors.get(exec_value, "white")

def open_serial_connection(port):
    if port:
        try:
            ser = serial.Serial(port, 9600)
            log_to_serial_text(f"Serial connection established on port {port}.")
            return ser
        except Exception as e:
            log_to_serial_text(f"Error opening serial port: {e}")
            return None
    return None

def serial_port_selected(event, serial_port_var, root):
    """Callback when a serial port is selected in the GUI dropdown."""
    selected_port = serial_port_var.get()
    
    # Open the serial connection based on selected port
    global ser
    ser = open_serial_connection(selected_port)
    
    # Update the label or text box with status
    if ser:
        log_to_serial_text(f"Serial port {selected_port} opened successfully")
    else:
        log_to_serial_text(f"Failed to open serial port {selected_port}")

def send_strobe():
    log_to_serial_text("Sending 'strobe' command to serial port...")
    def worker():
        global ser
        if ser:
            try:
                ser.write(b"strobe\n")
                ser.flush()
            except Exception as e:
                log_to_serial_text(f"Error sending 'strobe': {e}")
        else:
            log_to_serial_text(f"No serial port open. Cannot send 'strobe'")
    
    threading.Thread(target=worker, daemon=True).start()

def update_gui():
    """Update the Tkinter label with the current URL and process serial input."""
    global driver, ser
    
    state_label = ui_elements.get("state_label")
    current_args_label = ui_elements.get("current_args_label")
    next_args_label = ui_elements.get("next_args_label")
    serial_text = ui_elements.get("serial_text")

    # Update URL from Firefox
    if driver is not None:
        try:

            current_url = driver.current_url
            state_key, fragment_index = get_current_state(current_url)
            state_label.config(text=f"{state_key}_{fragment_index}")
            state_label.after(100, update_gui)
            
            current_speak_message = get_current_human_speach(state_key, fragment_index)
            current_args_label.config(state=tk.NORMAL, bg=get_exec_color(current_speak_message["exec"]))
            current_args_label.delete(1.0, tk.END)
            current_args_label.insert(tk.END, current_speak_message["args"])
            current_args_label.config(state=tk.DISABLED)
            
            next_speak_message = get_next_speak_message(state_key, fragment_index)
            next_args_label.config(state=tk.NORMAL, bg=get_exec_color(next_speak_message["exec"]))
            next_args_label.delete(1.0, tk.END)
            next_args_label.insert(tk.END, next_speak_message["args"])
            next_args_label.config(state=tk.DISABLED)
        except Exception as e:
            log_to_serial_text("Error while updating gui..." + str(e))
    
    # Process serial input if available
    if ser:
        try:
            if ser.in_waiting > 0:
                data = ser.readline().decode('utf-8').strip()
                # Append incoming serial data to the text area
                serial_text.insert(tk.END, data + "\n")
                serial_text.see(tk.END)
                if data == "ARCADE_RED_BUTTON_PRESSED":
                    log_to_serial_text("Arcade Red Button pressed")
                    bring_window_to_front(window_title)
                    keyboard.press('&')
                    keyboard.release('&')
                elif data == "ARCADE_BLUE_BUTTON_PRESSED":
                    log_to_serial_text("Arcade Blue Button pressed")
                    bring_window_to_front(window_title)
                    keyboard.press('à')
                    keyboard.release('à')
        except Exception as e:
            log_to_serial_text("Error reading from serial port:", e)

# Main execution flow
def main():
    global driver, ser

    # Start HTTP server serving the current directory
    http_server_proc = run_http_server()
    time.sleep(1)

    # Create a small Tkinter interface to display the current URL
    root = tk.Tk()
    root.title("M.A.V.Hi.")
    root.geometry("600x400")

    # Main Frame for layout grouping
    main_frame = tk.Frame(root)
    main_frame.pack(fill="both", expand=True, padx=10, pady=10)

    # Serial Port and Send Strobe Button Section (Aligned)
    serial_strobe_frame = tk.Frame(main_frame)
    serial_strobe_frame.pack(fill='x', pady=5)

    serial_ports = choose_serial_port()
    serial_port_var = tk.StringVar(value=serial_ports[0] if serial_ports else "")
    serial_port_menu = tk.OptionMenu(serial_strobe_frame, serial_port_var, *serial_ports)
    serial_port_menu.pack(side="left", padx=10)
    serial_port_menu.bind("<Configure>", lambda event: serial_port_selected(event, serial_port_var, root))

    # Align the "Send 'strobe'" button with the serial port selection
    strobe_button = tk.Button(serial_strobe_frame, text="Strobe", font=("Arial", 12), command=send_strobe)
    strobe_button.pack(side="left", padx=10)

    # Add "Reload State" Button
    reload_button = tk.Button(serial_strobe_frame, text="Reload State", font=("Arial", 12), command=reload_state)
    reload_button.pack(side="left", padx=10)

    # "Open Firefox" Button
    ui_elements["open_slides_button"] = tk.Button(serial_strobe_frame, text="Open Firefox", font=("Arial", 12), command=open_slides)
    ui_elements["open_slides_button"].pack(side="left", padx=10)

    state_label = tk.Label(serial_strobe_frame, text="Loading...", font=("Arial", 12))
    state_label.pack(side="right", padx=10)

    # Current & Next Message Section
    message_frame = tk.Frame(main_frame)
    message_frame.pack(fill='both', pady=5)

    current_message_label = tk.Label(message_frame, text="Current:", font=("Arial", 12, "bold"))
    current_message_label.pack()
    
    current_args_label = scrolledtext.ScrolledText(message_frame, wrap=tk.WORD, font=("Arial", 16), height=5, state=tk.DISABLED)
    current_args_label.pack(expand=True, fill='both', padx=10, pady=5)

    next_message_label = tk.Label(message_frame, text="Next:", font=("Arial", 12, "bold"))
    next_message_label.pack()

    next_args_label = scrolledtext.ScrolledText(message_frame, wrap=tk.WORD, font=("Arial", 16), height=5, state=tk.DISABLED)
    next_args_label.pack(expand=True, fill='both', padx=10, pady=5)

    # Serial Data Section
    serial_frame = tk.Frame(main_frame)
    serial_frame.pack(fill='both', pady=10)

    serial_text = scrolledtext.ScrolledText(serial_frame, wrap=tk.WORD, font=("Arial", 12), height=10)
    serial_text.pack(expand=True, fill='both', padx=10, pady=10)

    ui_elements["state_label"] = state_label
    ui_elements["current_args_label"] = current_args_label
    ui_elements["next_args_label"] = next_args_label
    ui_elements["serial_text"] = serial_text

    # Start the periodic update loop
    root.after(100, update_gui)

    log_to_serial_text("Interface launched. Close the window or press Ctrl+C in the terminal to exit.")
    try:
        root.mainloop()
    except KeyboardInterrupt:
        log_to_serial_text("Exiting program...")
    finally:
        http_server_proc.terminate()

# Global variables to be accessed in the GUI update loop
driver = None
ser = None
keyboard = Controller()
window_title = "Des cailloux aux octets — Mozilla Firefox"
ui_elements = {}
STATES = load_states()

if __name__ == '__main__':
    main()
