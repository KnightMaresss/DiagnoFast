from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open("nlp_model.pkl", "rb") as f:
    model = pickle.load(f)

# ✅ VALIDATION: Core medical keywords to prevent "hi" or "test" from hitting the model
VALID_KEYWORDS = {
    "pain", "ache", "fever", "cough", "head", "stomach", "nausea", "vomit", 
    "rash", "itch", "tired", "fatigue", "thirst", "urine", "vision", "breathe",
    "breath", "chest", "throat", "nose", "eye", "ear", "skin", "blood", "dizzy",
    "chill", "sweat", "swelling", "sore", "hurt", "sick", "cold", "flu", "diarrhea",
    "constipation", "cramp", "weak", "numb", "burn", "infection", "allergy"
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    user_text = data.get("text", "").strip()

    if not user_text:
        return jsonify({"error": "No text provided"}), 400

    # ✅ VALIDATION 1: Length Check (Must be at least 3 words)
    words = user_text.split()
    if len(words) < 3:
        return jsonify({
            "error": "Please provide a more detailed description (at least 3 words)."
        }), 400

    # ✅ VALIDATION 2: Medical Keyword Check
    user_text_lower = user_text.lower()
    has_keyword = any(keyword in user_text_lower for keyword in VALID_KEYWORDS)
    
    if not has_keyword:
        return jsonify({
            "error": "This doesn't seem like a medical symptom. Please describe physical symptoms (e.g., 'headache', 'fever', 'pain')."
        }), 400

    # ── IF IT PASSES VALIDATION, RUN THE MODEL ──
    
    # Get raw decision scores (LinearSVC output)
    scores = model.decision_function([user_text])[0]
    classes = model.classes_

    # Get indices of top 3
    top_3_idx = np.argsort(scores)[::-1][:3]
    
    top_score = scores[top_3_idx[0]]
    second_score = scores[top_3_idx[1]]
    
    # Convert the gap into a confidence percentage
    gap = top_score - second_score
    top_confidence = 40 + (55 * (gap / (abs(top_score) + 1e-5))) 
    top_confidence = min(max(top_confidence, 40), 95) # Keep it between 40% and 95%

    predictions = []
    
    # Add #1 prediction
    predictions.append({
        "disease": classes[top_3_idx[0]],
        "probability": f"{top_confidence:.2f}%"
    })
    
    # Add #2 and #3 with scaled-down confidence
    for i in [1, 2]:
        scaled_conf = top_confidence * (0.4 if i == 1 else 0.2)
        predictions.append({
            "disease": classes[top_3_idx[i]],
            "probability": f"{scaled_conf:.2f}%"
        })

    return jsonify({
        "input_text": user_text,
        "predictions": predictions
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8001)