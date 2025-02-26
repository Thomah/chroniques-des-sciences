import yaml
import hashlib
import json
import requests
import os
import base64
import time

yaml_file = "states.yaml"
fingerprint_file = "fingerprints.txt"
audio_output_folder = "audio/dialogs"
speechify_api_key = "dyKa_5eRAJFaF6MMoSYEvTm-IeYW2f9EJfSKD35WT2s="
speechify_url = "https://api.sws.speechify.com/v1/audio/speech"

# Ensure output folder exists
os.makedirs(audio_output_folder, exist_ok=True)

def generate_fingerprint(data):
    """Generate a unique fingerprint for a dictionary element."""
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()

def load_fingerprints():
    """Load existing fingerprints from file into a dictionary."""
    fingerprints = {}
    if os.path.exists(f"{audio_output_folder}/{fingerprint_file}"):
        with open(f"{audio_output_folder}/{fingerprint_file}", "r") as f:
            for line in f:
                if ": " in line:
                    filename, fingerprint = line.strip().split(": ")
                    fingerprints[filename] = fingerprint
    return fingerprints

def save_fingerprints(fingerprints):
    """Save updated fingerprints back to the file."""
    with open(f"{audio_output_folder}/{fingerprint_file}", "a") as f:
        f.truncate(0)
        for filename, fingerprint in fingerprints.items():
            f.write(f"{filename}: {fingerprint}\n")

def generate_speech(text, output_file):
    """Call Speechify API to generate speech from text."""
    payload = {
        "input": f"<speak><prosody pitch=\"8%\" rate=\"-5%\"><speechify:style emotion=\"calm\">{text}</speechify:style></prosody></speak>",
        "voice_id": "raphael",
        "audio_format": "mp3",
        "model": "simba-multilingual"
    }
    headers = {
        "authorization": f"Bearer {speechify_api_key}",
        "content-type": "application/json"
    }
    max_retries = 5
    backoff = 1 
    
    for attempt in range(max_retries):
      response = requests.post(speechify_url, headers=headers, json=payload)
      
      if response.status_code == 200:
          response_data = response.json()
          if "audio_data" in response_data:
              audio_bytes = base64.b64decode(response_data["audio_data"])
              with open(output_file, "wb") as f:
                  f.write(audio_bytes)
              print(f"Saved audio: {output_file}")
              return
          else:
              print("Error: No audio data found in response.")
              return
      elif response.status_code == 402:
          print("Error: Insufficient credits on Speechify API.")
          return
      elif response.status_code == 429:
          print(f"Rate limit exceeded. Retrying in {backoff} seconds...")
          time.sleep(backoff)
          backoff *= 2  # Exponential backoff
      else:
          print(f"Error generating speech: {response.text}")
          return

# Load YAML file
def process_yaml():
    with open(yaml_file, "r", encoding="utf-8") as file:
        states = yaml.safe_load(file)
    
    states = {str(key): value for key, value in states.items()}
    fingerprints = load_fingerprints()
    
    for state, actions in states.items():
        for index, action in enumerate(actions, start=0):
            if action.get("exec") == "speak":
                fingerprint = generate_fingerprint(action)
                filename = f"{state}_{index}.mp3"
                output_file = os.path.join(audio_output_folder, f"{state}_{index}.mp3")

                if os.path.exists(output_file) and fingerprints.get(filename) == fingerprint:
                    print(f"Skipping existing file {filename}, fingerprint matches.")
                    continue
                
                print(f"Processing {filename}: {action}")
                
                fingerprints[filename] = fingerprint
                save_fingerprints(fingerprints)
                text = action.get("args", "")
                generate_speech(text, output_file)

if __name__ == "__main__":
    process_yaml()
