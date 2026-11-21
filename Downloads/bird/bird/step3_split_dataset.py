import os
import shutil
import pathlib
from sklearn.model_selection import train_test_split

BASE_DIR = pathlib.Path("./data")
source_images_dir = BASE_DIR / "images" # Or BASE_DIR / "cropped_birds" depending on where your final images live
dataset_split_dir = BASE_DIR / "dataset_split"

# Get all class subfolders
classes = [d.name for d in source_images_dir.iterdir() if d.is_dir()]
print(f"Found classes: {classes}")

total_train = 0
total_val = 0

for cls in classes:
    cls_source_dir = source_images_dir / cls
    images = list(cls_source_dir.glob("*.jpg")) + list(cls_source_dir.glob("*.png"))
    
    if not images:
        continue
        
    # Split 80% train, 20% validation
    train_imgs, val_imgs = train_test_split(images, test_size=0.2, random_state=42)
    
    cls_train_dir = dataset_split_dir / "train" / cls
    cls_val_dir = dataset_split_dir / "val" / cls
    cls_train_dir.mkdir(parents=True, exist_ok=True)
    cls_val_dir.mkdir(parents=True, exist_ok=True)
    
    for img in train_imgs:
        shutil.copy(img, cls_train_dir / img.name)
        
    for img in val_imgs:
        shutil.copy(img, cls_val_dir / img.name)
        
    total_train += len(train_imgs)
    total_val += len(val_imgs)
    print(f"Processed {cls}: {len(train_imgs)} train, {len(val_imgs)} val")

print("\n--- Dataset Split Complete! ---")
print(f"Total Training Images: {total_train}")
print(f"Total Validation Images: {total_val}")