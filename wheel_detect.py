
import cv2
import numpy as np

from flask import Flask, request, jsonify
from flask_cors import CORS
from threading import Lock

# ========================================
# WHEEL CART - ARUCO TRACKING API
# ========================================

app = Flask(__name__)
CORS(app)

data_lock = Lock()

tracking_data = {
    "detected": False,
    "marker_id": None,
    "position": {"x": 0, "y": 0, "z": 0},
    "rotation": {"x": 0, "y": 0, "z": 0}
}

# ========================================
# ARUCO CONFIGURATION
# ========================================

dictionary = cv2.aruco.getPredefinedDictionary(
    cv2.aruco.DICT_4X4_50
)

parameters = cv2.aruco.DetectorParameters()
detector = cv2.aruco.ArucoDetector(
    dictionary,
    parameters
)

MARKER_LENGTH = 1.0
HALF = MARKER_LENGTH / 2

object_points = np.array([
    [-HALF, HALF, 0],
    [ HALF, HALF, 0],
    [ HALF, -HALF, 0],
    [-HALF, -HALF, 0]
], dtype=np.float32)

# ========================================
# PROCESS CAMERA FRAME
# ========================================

def process_frame(frame):

    height, width = frame.shape[:2]

    focal_length = float(max(width, height))

    camera_matrix = np.array([
        [focal_length, 0, width / 2],
        [0, focal_length, height / 2],
        [0, 0, 1]
    ], dtype=np.float64)

    dist_coeffs = np.zeros((5, 1), dtype=np.float64)

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    corners, ids, rejected = detector.detectMarkers(gray)

    if ids is None:
        return {
            "detected": False,
            "marker_id": None,
            "found": False,
            "position": {"x": 0, "y": 0, "z": 0},
            "rotation": {"x": 0, "y": 0, "z": 0}
        }

    # Use the first detected marker
    
    marker_ids = ids.flatten()
    marker_id = int(marker_ids[0])

    image_points = corners[0].reshape(
        4, 2
    ).astype(np.float32)

    solved, rvec, tvec = cv2.solvePnP(
        object_points,
        image_points,
        camera_matrix,
        dist_coeffs,
        flags=cv2.SOLVEPNP_IPPE_SQUARE
    )

    if not solved:
        return {
            "detected": False,
            "found": False,
            "marker_id": None,
            "position": {"x": 0, "y": 0, "z": 0},
            "rotation": {"x": 0, "y": 0, "z": 0}
        }

    x, y, z = tvec.flatten()

    rotation_matrix, _ = cv2.Rodrigues(rvec)
    angles = cv2.RQDecomp3x3(rotation_matrix)[0]

    rx, ry, rz = angles

    center = image_points.mean(axis=0)

    center_x = float(center[0] / width)
    center_y = float(center[1] / height)

    radius_pixels = max(
        np.linalg.norm(image_points[i] - center)
        for i in range(4)
    )

    radius = float(radius_pixels / width)

    return {
        "detected": True,
        "found": True,
        "marker_id": marker_id,
        "x": center_x,
        "y": center_y,
        "radius": radius,
        "position": {
            "x": float(x),
            "y": float(y),
            "z": float(z)
        },
        "rotation": {
            "x": float(rx),
            "y": float(ry),
            "z": float(rz)
        }
    }


# ========================================
# API: RECEIVE BROWSER CAMERA FRAMES
# ========================================

@app.route("/detect", methods=["POST"])
def detect():

    global tracking_data

    if "frame" not in request.files:
        return jsonify({
            "error": "No camera frame received"
        }), 400

    file = request.files["frame"]

    image_bytes = np.frombuffer(
        file.read(),
        dtype=np.uint8
    )

    frame = cv2.imdecode(
        image_bytes,
        cv2.IMREAD_COLOR
    )

    if frame is None:
        return jsonify({
            "error": "Invalid image"
        }), 400

    result = process_frame(frame)

    with data_lock:
        tracking_data = result.copy()

    return jsonify(result)


# ========================================
# API: GET LATEST TRACKING DATA
# ========================================

@app.route("/tracking", methods=["GET"])
def tracking():

    with data_lock:
        return jsonify(tracking_data)


# ========================================
# API: CHECK SERVER
# ========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "running",
        "application": "WHEEL CART AR",
        "tracking": "/tracking",
        "detection": "/detect"
    })


# ========================================
# START SERVER
# ========================================

if __name__ == "__main__":

    print("================================")
    print("WHEEL CART AR TRACKING SERVER")
    print("================================")
    print("Server: http://127.0.0.1:5000")
    print("Tracking: http://127.0.0.1:5000/tracking")
    print("Waiting for browser camera frames...")
    print("Press CTRL+C to exit.")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        use_reloader=False,
        threaded=True
    )
