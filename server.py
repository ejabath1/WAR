
from flask import Flask, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

previous = None

@app.after_request
def cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


@app.route("/detect", methods=["POST", "OPTIONS"])
def detect():

    global previous

    if request.method == "OPTIONS":
        return "", 204

    file = request.files.get("frame")

    if not file:
        return jsonify({"found": False})

    data = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(data, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"found": False})

    height, width = frame.shape[:2]

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (9, 9), 2)

    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.3,
        minDist=120,
        param1=120,
        param2=55,
        minRadius=45,
        maxRadius=220
    )

    if circles is None:
        previous = None
        return jsonify({"found": False})

    candidates = circles[0]

    if previous is None:
        selected = max(candidates, key=lambda c: c[2])
    else:
        selected = min(
            candidates,
            key=lambda c:
                (c[0] - previous[0])**2 +
                (c[1] - previous[1])**2
        )

    x, y, radius = map(float, selected)

    if previous is not None:
        x = previous[0] * 0.7 + x * 0.3
        y = previous[1] * 0.7 + y * 0.3
        radius = previous[2] * 0.7 + radius * 0.3

    previous = (x, y, radius)

    return jsonify({
        "found": True,
        "x": x / width,
        "y": y / height,
        "radius": radius / width
    })


if __name__ == "__main__":
    print("WHEEL CART DETECTION SERVER RUNNING")
    app.run(host="127.0.0.1", port=5000, debug=False)
