"""Evaluate deepfake scores at VIDEO level without requiring a model checkpoint.

CSV columns: video_id,label,score
Each row can be a frame prediction; repeated video_id values are averaged.
label: 1=fake, 0=real. score: higher means more likely fake.

Example:
 python models/video_detection/evaluate_video_predictions.py \
   --csv video_predictions.csv --threshold 0.5
"""
import argparse
import csv
import math
from collections import defaultdict
from pathlib import Path


def load_videos(path):
    videos = defaultdict(lambda: {"labels": set(), "scores": []})
    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        needed = {"video_id", "label", "score"}
        if not needed.issubset(set(reader.fieldnames or [])):
            raise ValueError(f"CSV requires columns: {', '.join(sorted(needed))}")
        for line, row in enumerate(reader, start=2):
            video_id = (row["video_id"] or "").strip()
            if not video_id:
                raise ValueError(f"Missing video_id at line {line}")
            try:
                label = int(row["label"])
                score = float(row["score"])
            except (ValueError, TypeError) as exc:
                raise ValueError(f"Invalid label/score at line {line}") from exc
            if label not in (0, 1) or not math.isfinite(score) or not 0 <= score <= 1:
                raise ValueError(f"Expected label 0/1 and score in [0,1] at line {line}")
            videos[video_id]["labels"].add(label)
            videos[video_id]["scores"].append(score)
    if not videos:
        raise ValueError("CSV has no predictions")
    result = []
    for video_id, values in videos.items():
        if len(values["labels"]) != 1:
            raise ValueError(f"Conflicting labels for video_id={video_id}")
        result.append((video_id, next(iter(values["labels"])),
                       sum(values["scores"]) / len(values["scores"]),
                       len(values["scores"])))
    return result


def safe_ratio(numerator, denominator):
    return numerator / denominator if denominator else None


def pct(value):
    return f"{value * 100:.2f}%" if value is not None else "N/A"


def evaluate(videos, threshold):
    tp = tn = fp = fn = 0
    for _, label, score, _ in videos:
        predicted = int(score >= threshold)
        if label == 1 and predicted == 1:
            tp += 1
        elif label == 0 and predicted == 0:
            tn += 1
        elif label == 0 and predicted == 1:
            fp += 1
        else:
            fn += 1
    print(f"Videos evaluated: {len(videos)} (real={tn + fp}, fake={tp + fn})")
    print(f"Threshold: {threshold:.4f} (frame scores averaged per video)")
    print(f"Accuracy: {pct(safe_ratio(tp + tn, len(videos)))}")
    print(f"Fake precision: {pct(safe_ratio(tp, tp + fp))}")
    print(f"Fake recall: {pct(safe_ratio(tp, tp + fn))}")
    print(f"Fake F1: {pct(safe_ratio(2 * tp, 2 * tp + fp + fn))}")
    print(f"False positive rate: {pct(safe_ratio(fp, fp + tn))}")
    print(f"Confusion matrix: TP={tp} FP={fp} TN={tn} FN={fn}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", required=True, type=Path,
                        help="CSV with video_id,label,score")
    parser.add_argument("--threshold", type=float, default=0.5,
                        help="Fake detection threshold, chosen using validation data only")
    args = parser.parse_args()
    if not 0 <= args.threshold <= 1:
        parser.error("--threshold must be between 0 and 1")
    try:
        videos = load_videos(args.csv)
        evaluate(videos, args.threshold)
    except (ValueError, OSError) as exc:
        parser.error(str(exc))


if __name__ == "__main__":
    main()
