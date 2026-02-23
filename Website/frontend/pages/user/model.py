from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import os

app = Flask(__name__)

model = YOLO("detection_model.pt")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    results = model(filepath)

    # Example: Count detections
    num_detections = len(results[0].boxes)

    # You can calculate damage severity based on bounding box area
    damage_percentage = min(num_detections * 20, 100)

    return jsonify({
        "detections": num_detections,
        "damage_percentage": damage_percentage
    })

if __name__ == "__main__":
    app.run(debug=True)