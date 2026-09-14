"""
Main Flask Server: Augmented Reality Educational Backend
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
Course: Human-Computer Interaction

Serves:
1. REST API for modules, AI tutor, quizzes, speech, and HCI analytics.
2. Static hosting for the WebAR client, printable markers, and evaluation portal.
"""

import os
import json
from flask import Flask, request, jsonify, send_from_directory, render_template_string

from ai_tutor import AITutor
from quiz_service import QuizService
from speech_service import SpeechService
from hci_analytics import HCIAnalytics

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "modules_data.json")
ANALYTICS_STORE_PATH = os.path.join(os.path.dirname(__file__), "data", "analytics_store.json")
AR_APP_DIR = os.path.join(BASE_DIR, "ar_app")
PRINTABLE_DIR = os.path.join(BASE_DIR, "printable_markers")
EVALUATION_DIR = os.path.join(BASE_DIR, "hci_evaluation")

# Load curriculum
with open(DATA_PATH, "r", encoding="utf-8") as f:
    CURRICULUM_DATA = json.load(f)

# Initialize engines
tutor_engine = AITutor(CURRICULUM_DATA)
quiz_engine = QuizService(CURRICULUM_DATA)
speech_engine = SpeechService(CURRICULUM_DATA)
analytics_engine = HCIAnalytics(ANALYTICS_STORE_PATH)

app = Flask(__name__, static_folder=AR_APP_DIR)

# CORS Middleware for cross-origin smartphone testing
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# ----------------- STATIC CLIENT ROUTES -----------------
@app.route("/")
def index():
    """Serves the main WebAR educational application."""
    return send_from_directory(AR_APP_DIR, "index.html")

@app.route("/<path:filename>")
def serve_ar_assets(filename):
    """Serves styles, scripts, models, and markers for the WebAR application."""
    if os.path.exists(os.path.join(AR_APP_DIR, filename)):
        return send_from_directory(AR_APP_DIR, filename)
    elif os.path.exists(os.path.join(BASE_DIR, filename)):
        return send_from_directory(BASE_DIR, filename)
    return jsonify({"error": "File not found"}), 404

@app.route("/flashcards")
def serve_flashcards():
    """Serves printable A4 flashcards."""
    return send_from_directory(PRINTABLE_DIR, "printable_flashcards.html")

@app.route("/evaluation")
def serve_evaluation_portal():
    """Serves the HCI user study & evaluation portal."""
    return send_from_directory(EVALUATION_DIR, "evaluation_portal.html")

# ----------------- REST API ROUTES -----------------
@app.route("/api/modules", methods=["GET"])
def get_all_modules():
    """Returns curriculum summary of all 5 modules and markers."""
    return jsonify(CURRICULUM_DATA)

@app.route("/api/module/<module_id>", methods=["GET"])
def get_module_detail(module_id):
    """Returns single module detailed data."""
    for mod in CURRICULUM_DATA.get("modules", []):
        if mod["id"] == module_id:
            return jsonify(mod)
    return jsonify({"error": "Module not found"}), 404

@app.route("/api/chat", methods=["POST"])
def chat_with_tutor():
    """
    AI Tutor conversational chat endpoint.
    Payload: { "marker_id": "marker_heart", "message": "How do ventricles work?" }
    """
    data = request.get_json() or {}
    marker_id = data.get("marker_id", "")
    message = data.get("message", "")
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message is required"}), 400

    response = tutor_engine.generate_response(marker_id, message, history)
    return jsonify(response)

@app.route("/api/quiz/<marker_id>", methods=["GET"])
def get_quiz(marker_id):
    """Returns the 5-question multiple choice quiz for the active marker."""
    quiz_data = quiz_engine.get_quiz_for_marker(marker_id)
    if not quiz_data:
        return jsonify({"error": "Quiz not found for this marker"}), 404
    return jsonify(quiz_data)

@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    """
    Evaluates quiz submissions and generates scores with detailed feedback.
    Payload: { "marker_id": "marker_heart", "answers": [3, 1, 2, 1, 1], "completion_time_seconds": 45 }
    """
    data = request.get_json() or {}
    marker_id = data.get("marker_id")
    answers = data.get("answers", [])
    duration = data.get("completion_time_seconds", 0)

    if not marker_id:
        return jsonify({"error": "Marker ID is required"}), 400

    results = quiz_engine.evaluate_submission(marker_id, answers, duration)
    return jsonify(results)

@app.route("/api/narration/<marker_id>", methods=["GET"])
def get_narration(marker_id):
    """Returns voice narration script and facts."""
    return jsonify(speech_engine.get_narration_script(marker_id))

@app.route("/api/speech/query", methods=["POST"])
def speech_query():
    """Transcribes spoken query and invokes AI tutor."""
    data = request.get_json() or {}
    transcript = data.get("transcript", "")
    marker_id = data.get("marker_id", "")
    result = speech_engine.process_speech_query(transcript, marker_id, tutor_engine)
    return jsonify(result)

@app.route("/api/analytics/session", methods=["POST"])
def record_evaluation_session():
    """
    Records a participant's HCI evaluation session (SUS, NASA-TLX, ARCS, Pre/Post test).
    """
    data = request.get_json() or {}
    record = analytics_engine.record_study_session(data)
    return jsonify({"status": "success", "session": record})

@app.route("/api/analytics/summary", methods=["GET"])
def get_evaluation_summary():
    """Returns aggregated summary metrics across all logged participant sessions."""
    return jsonify(analytics_engine.get_summary_statistics())

if __name__ == "__main__":
    import sys
    use_ssl = "--ssl" in sys.argv
    scheme = "https" if use_ssl else "http"

    cert_file = os.path.join(os.path.dirname(__file__), "cert.pem")
    key_file = os.path.join(os.path.dirname(__file__), "key.pem")

    if use_ssl and os.path.exists(cert_file) and os.path.exists(key_file):
        ssl_context = (cert_file, key_file)
    elif use_ssl:
        ssl_context = "adhoc"
    else:
        ssl_context = None

    print("=====================================================================")
    print(" Augmented Reality HCI Educational Server")
    print(" Team: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)")
    print(f" WebAR Client:           {scheme}://localhost:5000/")
    print(f" Printable Flashcards:   {scheme}://localhost:5000/flashcards")
    print(f" HCI Evaluation Portal:  {scheme}://localhost:5000/evaluation")
    print(f" API Base:               {scheme}://localhost:5000/api/modules")
    if use_ssl:
        print(f" SSL Mode: ENABLED ({'SAN SSL Cert' if isinstance(ssl_context, tuple) else 'adhoc'})")
    print("=====================================================================")
    app.run(host="0.0.0.0", port=5000, debug=True, ssl_context=ssl_context, use_reloader=not use_ssl)


