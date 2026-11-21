import os
import pathlib
import shutil
import torch
from sklearn.model_selection import train_test_split
from ultralytics import YOLO

def prepare_dataset_from_cropped():
    base_dir = pathlib.Path("./data")
    cropped_dir = base_dir / "cropped_birds"
    dataset_split_dir = base_dir / "dataset_split"

    # Check if dataset_split already exists and has contents
    if dataset_split_dir.exists() and any(dataset_split_dir.iterdir()):
        print(f"Dataset split already exists at: {dataset_split_dir.resolve()}")
        return dataset_split_dir

    print("Organizing and splitting dataset from 'cropped_birds'...")
    
    # Check if cropped_dir has subfolders for classes, or if images are loose
    classes = [d.name for d in cropped_dir.iterdir() if d.is_dir()]
    
    if not classes:
        print("Error: No class subfolders found inside 'data/cropped_birds/'.")
        print("Please make sure your cropped images are separated into species folders (e.g., data/cropped_birds/species_name/).")
        return None

    total_train, total_val = 0, 0

    for cls in classes:
        cls_source_dir = cropped_dir / cls
        images = list(cls_source_dir.glob("*.jpg")) + list(cls_source_dir.glob("*.png")) + list(cls_source_dir.glob("*.jpeg"))
        
        if not images:
            continue
            
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

    print(f"Dataset Split Complete! Train: {total_train}, Val: {total_val}")
    return dataset_split_dir

def main():
    device_to_use = 0 if torch.cuda.is_available() else "cpu"
    print(f"Using device: {'GPU (cuda:0)' if device_to_use == 0 else 'CPU'}")

    # 1. Ensure dataset is split and ready from cropped_birds
    dataset_path = prepare_dataset_from_cropped()
    if dataset_path is None:
        return

    # 2. Load model and train
    model = YOLO("yolov8n-cls.pt")
    
    print(f"Starting training using dataset at: {dataset_path.resolve()}")
    results = model.train(
        data=str(dataset_path.resolve()),
        epochs=15,          
        imgsz=224,          
        batch=16,           
        device=device_to_use   
    )

    print("\n--- Training Complete! ---")
    print("Your best model weights are saved at: runs/classify/train/weights/best.pt")

if __name__ == "__main__":
    main()