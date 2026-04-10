import os
import json


BASE_FOLDER = "shared"


OUTPUT_FILE = os.path.join(BASE_FOLDER, "sounds.json")

folders = ["open", "close"]

sounds = {}
for folder in folders:
    folder_path = os.path.join(BASE_FOLDER, folder)
    if not os.path.exists(folder_path):
        print(f"Folder not found: {folder_path}")
        sounds[folder] = []
        continue

    files = [f"{BASE_FOLDER}/{folder}/{f}" for f in os.listdir(folder_path) if f.lower().endswith(".ogg")]
    sounds[folder] = files


with open(OUTPUT_FILE, "w") as f:
    json.dump(sounds, f, indent=2)

print(f"updated {OUTPUT_FILE}")