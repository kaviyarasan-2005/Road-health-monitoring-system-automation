from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

model = YOLO("detection_model.pt")

UPLOAD_FOLDER = "./../../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SEVERITY_WEIGHTS = { "pothole": 1.0 }
DEFAULT_SEVERITY  = 1.0
SCALE_FACTOR      = 200


def get_severity(class_name: str) -> float:
    return SEVERITY_WEIGHTS.get(class_name.lower(), DEFAULT_SEVERITY)

def score_to_tier(score: float) -> str:
    if score <= 20:   return "Good"
    elif score <= 40: return "Fair"
    elif score <= 60: return "Poor"
    elif score <= 80: return "Severe"
    else:             return "Critical"

def compute_damage_score(results, img_width: int, img_height: int) -> dict:
    image_area = img_width * img_height
    boxes      = results[0].boxes
    names      = results[0].names

    if len(boxes) == 0:
        return { "damage_score": 0.0, "tier": "Good", "detections": [], "num_detections": 0 }

    detections, weighted_sum = [], 0.0
    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf       = float(box.conf[0])
        class_name = names[int(box.cls[0])]
        severity   = get_severity(class_name)
        box_area   = (x2 - x1) * (y2 - y1)
        weighted_sum += (box_area / image_area) * conf * severity
        detections.append({
            "class":      class_name,
            "confidence": round(conf, 4),
            "bbox":       [round(x1), round(y1), round(x2), round(y2)],
            "coverage_%": round((box_area / image_area) * 100, 2),
        })

    damage_score = round(min(weighted_sum * SCALE_FACTOR, 100), 2)
    return {
        "damage_score":   damage_score,
        "tier":           score_to_tier(damage_score),
        "detections":     detections,
        "num_detections": len(detections),
    }


@app.route("/")
def home():
    return jsonify({"message": "Road Damage Detection AI Service Running"})


@app.route("/api/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file     = request.files["image"]
    filename = f"{datetime.now().timestamp()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    with Image.open(filepath) as img:
        img_width, img_height = img.size

    results    = model(filepath)
    score_data = compute_damage_score(results, img_width, img_height)

    return jsonify({
        "status":         "success",
        "image_path":     filepath,
        "image_size":     { "width": img_width, "height": img_height },
        "damage_score":   score_data["damage_score"],
        "damage_tier":    score_data["tier"],
        "num_detections": score_data["num_detections"],
        "detections":     score_data["detections"],
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)