import pathlib
from ultralytics import YOLO

def main():
    model_path = "runs/classify/train/weights/best.pt"
    if not pathlib.Path(model_path).exists():
        print(f"Error: Model weights not found at {model_path}. Did training finish successfully?")
        return
        
    print(f"Loading trained model from {model_path}...")
    model = YOLO(model_path)

    val_dir = pathlib.Path("./data/dataset_split/val")
    real_images = list(val_dir.glob("**/*.jpg")) + list(val_dir.glob("**/*.png"))

    if not real_images:
        print("No validation images found to test with!")
        return

    test_image_path = str(real_images[0])
    print(f"\nRunning prediction on test image: {test_image_path}")

    results = model(test_image_path)

    for r in results:
        top_class_idx = r.probs.top1
        top_class_name = r.names[top_class_idx]
        confidence = r.probs.top1conf.item() * 100
        print(f"\n✨ Predicted Bird Species: {top_class_name}")
        print(f"📊 Confidence: {confidence:.2f}%")

if __name__ == "__main__":
    main()