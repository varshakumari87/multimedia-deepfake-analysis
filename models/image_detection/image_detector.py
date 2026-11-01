import cv2
import numpy as np
from pathlib import Path


class SafeLensImageDetector:

    def __init__(self):
        print("SafeLens AI Image Detector initialized")

    def load_image(self, image_path):

        image_path = Path(image_path)

        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = cv2.imread(str(image_path))

        if image is None:
            raise ValueError("Unable to read image")

        return image

    def preprocess_image(self, image):

        resized_image = cv2.resize(image, (224, 224))

        normalized_image = resized_image.astype(
            np.float32
        ) / 255.0

        return normalized_image

    def analyze_image(self, image_path):

        image = self.load_image(image_path)

        processed_image = self.preprocess_image(image)

        return {
            "success": True,
            "message": "Image loaded and preprocessed successfully",
            "original_shape": image.shape,
            "processed_shape": processed_image.shape,
            "pixel_range": (
                float(processed_image.min()),
                float(processed_image.max())
            )
        }


def process_benchmark_folder(folder_path):

    detector = SafeLensImageDetector()

    folder = Path(folder_path)
    image_files = list(folder.glob("*.png"))

    successful = 0
    failed = 0

    print(f"\nFound {len(image_files)} benchmark images")

    for image_path in image_files:

        try:
            result = detector.analyze_image(image_path)

            if result["success"]:
                successful += 1

        except Exception as error:
            failed += 1
            print(f"Failed: {image_path.name} - {error}")

    print("\nBenchmark Processing Summary")
    print("----------------------------")
    print("Total images:", len(image_files))
    print("Successfully processed:", successful)
    print("Failed:", failed)


if __name__ == "__main__":
    process_benchmark_folder("dataset/benchmark")