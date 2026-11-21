import os
import pathlib
import cv2
from ultralytics import YOLO
from tqdm import tqdm

# 1. Setup paths based on your local workspace
BASE_DIR = pathlib.Path("./data")  # Adjust if your data folder is named differently
raw_images_dir = BASE_DIR / "raw"   # Change to your raw images directory if needed
output_crop_dir = BASE_DIR / "cropped_birds"
output_crop_dir.mkdir(parents=True, exist_ok=True)

print(f"Loading YOLO model for cropping...")
# Load pretrained YOLOv8 model (it will download automatically if not present)
model = YOLO("yolov8n.pt")

# Find all image files
image_files = list(BASE_DIR.glob("**/*.jpg")) + list(BASE_DIR.glob("**/*.png"))
print(f"Found {len(image_files)} total images to process.")

kept_count = 0

print("Starting bird cropping process...")
for img_path in tqdm(image_files):
    # Skip images already in the output directory to avoid loops
    if "cropped_birds" in str(img_path):
        continue
        
    img = cv2.imread(str(img_path))
    if img is None:
        continue
        
    # Run YOLO detection
    results = model(img, verbose=False)
    boxes = results[0].boxes
    
    cropped_successfully = False
    
    for box in boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        
        # Class 14 is 'bird' in COCO dataset
        if cls_id == 14 and conf > 0.3:
            xyxy = box.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = map(int, xyxy)
            
            # Ensure valid bounding box coordinates
            if x2 > x1 and y2 > y1:
                cropped_img = img[y1:y2, x1:x2]
                if cropped_img.size > 0:
                    save_path = output_crop_dir / img_path.name
                    cv2.imwrite(str(save_path), cropped_img)
                    kept_count += 1
                    cropped_successfully = True
                    break
                    
    # Fallback: if no bird was confidently detected, save the original image resized/copied
    if not cropped_successfully:
        save_path = output_crop_dir / img_path.name
        cv2.imwrite(str(save_path), img)
        kept_count += 1

print(f"\nCropping complete! Total images kept/processed: {kept_count}")
print(f"Saved to: {output_crop_dir.resolve()}")