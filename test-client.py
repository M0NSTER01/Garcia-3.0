import requests

url = "http://127.0.0.1:8000/generate"

# --- UPDATE THESE PATHS ---
# TIP: You can Shift+Right Click a file in Explorer and select "Copy as path"
# Then paste it here (keep the 'r' at the start!)

person_img_path = r"C:\Users\krrish\OneDrive\Desktop\Garcia2.0\m img.jpg"  # Check exact name/extension
cloth_img_path = r"C:\Users\krrish\OneDrive\Desktop\Garcia2.0\kurta.webp"   # Check exact name/extension

print(f"--- Sending Request to {url} ---")
print(f"Using Person: {person_img_path}")
print(f"Using Cloth: {cloth_img_path}")
print("Please wait... (CPU generation takes 2-5 minutes)")

try:
    files = {
        'person_image': open(person_img_path, 'rb'),
        'cloth_image': open(cloth_img_path, 'rb')
    }
    
    response = requests.post(url, files=files, timeout=600)

    if response.status_code == 200:
        with open("result.png", "wb") as f:
            f.write(response.content)
        print("\n✅ SUCCESS! Saved output to 'result.png'")
    else:
        print(f"\n❌ FAILED: {response.text}")

except FileNotFoundError as e:
    print(f"\n❌ FILE NOT FOUND: {e}")
    print("Double check the file name and extension (jpg vs jpeg vs png)!")
except Exception as e:
    print(f"\n❌ ERROR: {e}")