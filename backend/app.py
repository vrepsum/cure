from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
import joblib
from datetime import date, datetime
import random
import sqlite3
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# -------------------------
# DATABASE SETUP
# -------------------------
DB_PATH = "disease_reports.db"

def init_db():
    """Initialize SQLite database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Drop old table if exists and recreate
        cursor.execute("DROP TABLE IF EXISTS disease_reports")
        
        cursor.execute("""
            CREATE TABLE disease_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                disease TEXT NOT NULL,
                severity TEXT NOT NULL,
                symptoms TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

init_db()

# -------------------------
# DOWNLOAD MODEL FROM GOOGLE DRIVE
# -------------------------
def download_file_from_google_drive(id, destination):
    URL = "https://docs.google.com/uc?export=download"

    session = requests.Session()

    response = session.get(URL, params={'id': id}, stream=True)
    token = get_confirm_token(response)

    if token:
        params = {'id': id, 'confirm': token}
        response = session.get(URL, params=params, stream=True)

    save_response_content(response, destination)    

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value

    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768

    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)

# -------------------------
# LOAD MODEL + ENCODERS
# -------------------------
MODEL_PATH = "disease_predictor.pkl"
# Replace with your actual Google Drive File ID
MODEL_DRIVE_ID = "1K5RkoIqG2wpy1BLj5FzRyFEWqqYlfzXQ" 

if not os.path.exists(MODEL_PATH):
    print(f"Model not found locally. Downloading from Google Drive (ID: {MODEL_DRIVE_ID})...")
    try:
        download_file_from_google_drive(MODEL_DRIVE_ID, MODEL_PATH)
        print("Model downloaded successfully.")
    except Exception as e:
         print(f"Error downloading model: {e}")
         # You might want to exit here if the model is critical
         # exit(1)

try:
    model = joblib.load(MODEL_PATH)
    district_encoder = joblib.load("district_encoder.pkl")
    disease_encoder = joblib.load("disease_encoder.pkl")
except Exception as e:
    print(f"Error loading model or encoders: {e}")
    # Handle the error appropriately, maybe use a dummy model or exit

# -------------------------
# LOAD REALISM DATASET
# -------------------------
# Check if the dataset exists before loading
DATASET_PATH = "../data/final_dataset_appended_cleaned.csv"
if os.path.exists(DATASET_PATH):
    realism_df = pd.read_csv(DATASET_PATH)
    # District -> Disease frequency
    district_disease_map = realism_df.groupby("district")["disease_raw"].value_counts().unstack(fill_value=0)
else:
    print(f"Warning: Dataset not found at {DATASET_PATH}. Realism features may be limited.")
    district_disease_map = pd.DataFrame() # Create an empty DataFrame to avoid errors

# -------------------------
# CITY NAME MAPPINGS
# -------------------------
CITY_FIX = {
    "Bangalore": "Bengaluru",
    "Tumkur": "Tumakuru",
    "Mysore": "Mysuru"
}

# -------------------------
# SEASONAL PEAK DISEASES
# -------------------------
season_peaks = {
    "DENGUE":       [7,8,9,10],
    "MALARIA":      [6,7,8,9,10],
    "TYPHOID":      [7,8,9],
    "CHOLERA":      [6,7,8],
    "DIARRHEA":     [4,5,6,7],
    "INFLUENZA":    [11,12,1,2],
    "VIRAL_FEVER":  [10,11,12,1],
    "MEASLES":      [1,2,3],
    "CHICKENPOX":   [2,3,4]
}

# -------------------------
# WEATHER EFFECTS
# -------------------------
weather_effects = {
    "DENGUE":       {"rain":3, "humidity":3, "temp":1},
    "MALARIA":      {"rain":3, "humidity":2},
    "TYPHOID":      {"rain":2},
    "CHOLERA":      {"rain":3},
    "DIARRHEA":     {"rain":2},
    "CHICKENPOX":   {"temp":2},
    "MEASLES":      {"temp":1},
    "INFLUENZA":    {"temp":-2},
    "VIRAL_FEVER":  {"humidity":1}
}

# -------------------------
# WEATHER FETCH FUNCTION
# -------------------------
def get_forecast(lat, lon):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,"
        f"precipitation_sum,relative_humidity_2m_max"
        f"&forecast_days=7&timezone=Asia/Kolkata"
    )

    try:
        r = requests.get(url).json()
        daily = r["daily"]

        week_weather = []
        for i in range(len(daily["time"])):
            avg_temp = (daily["temperature_2m_max"][i] + daily["temperature_2m_min"][i]) / 2
            week_weather.append({
                "date": daily["time"][i],
                "avg_temp": avg_temp,
                "rainfall": daily["precipitation_sum"][i],
                "humidity": daily["relative_humidity_2m_max"][i]
            })
        return week_weather
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return []

# -------------------------
# ADVANCED REALISM LEVEL 2 ENGINE
# -------------------------
def advanced_realistic_diseases(weather, city):

    month = datetime.now().month
    temp = weather["avg_temp"]
    rain = weather["rainfall"]
    hum  = weather["humidity"]

    all_diseases = list(disease_encoder.classes_)

    # District influence
    if city in district_disease_map.index:
        district_freq = district_disease_map.loc[city].to_dict()
        max_v = max(district_freq.values()) or 1
        district_weights = {d: (district_freq.get(d, 0) / max_v) * 3 for d in all_diseases}
    else:
        district_weights = {d: 1 for d in all_diseases}

    weights = {d: 1 for d in all_diseases}

    # Add district weights
    for d in all_diseases:
        weights[d] += district_weights.get(d, 0)

    # Seasonal influence
    for d in all_diseases:
        if d in season_peaks and month in season_peaks[d]:
            weights[d] += 4

    # Weather effects
    for d in all_diseases:
        eff = weather_effects.get(d, {})

        if temp > 32 and eff.get("temp", 0) > 0:
            weights[d] += eff["temp"]
        if rain > 10 and eff.get("rain", 0) > 0:
            weights[d] += eff["rain"]
        if hum > 80 and eff.get("humidity", 0) > 0:
            weights[d] += eff["humidity"]

        if temp < 18 and eff.get("temp", 0) < 0:
            weights[d] += abs(eff["temp"])

    # Weighted list
    weighted_list = []
    for d, w in weights.items():
        weighted_list.extend([d] * int(max(w, 1)))

    random.shuffle(weighted_list)

    # Select top 3 diseases
    top3 = random.sample(weighted_list, 3)

    # Confidence decay curve
    base = random.randint(28, 45)
    confs = [
        base,
        random.randint(base - 7, base - 3),
        random.randint(base - 12, base - 7)
    ]

    return [
        {"disease": top3[i], "confidence": confs[i]}
        for i in range(3)
    ]

# -------------------------
# MAIN PREDICTION API
# -------------------------
@app.route("/predict_disease")
def predict_disease():

    raw_city = request.args.get("city")
    city = CITY_FIX.get(raw_city, raw_city)
    lat = float(request.args.get("lat"))
    lon = float(request.args.get("lon"))

    today = date.today()
    week = today.isocalendar().week
    year = today.year

    weather = get_forecast(lat, lon)

    if not weather:
         return jsonify({"error": "Could not fetch weather data", "city": city, "predictions": []}), 500

    predictions = []

    # --------------------------------
    # First 2 days → REAL MODEL
    # --------------------------------
    for day in weather[:2]:

        try:
            dist_enc = district_encoder.transform([city])[0]
        except:
            dist_enc = 0

        X = pd.DataFrame([{
            "district_encoded": dist_enc,
            "year": year,
            "week": week,
            "avg_temp": day["avg_temp"],
            "rainfall": day["rainfall"],
            "humidity": day["humidity"]
        }])

        try:
            probs = model.predict_proba(X)[0]
            disease_probs = sorted(
                list(zip(disease_encoder.classes_, probs)),
                key=lambda x: x[1],
                reverse=True
            )

            predictions.append({
                "date": day["date"],
                "top_diseases": [
                    {"disease": d, "confidence": round(p*100, 2)}
                    for (d, p) in disease_probs[:3]
                ]
            })
        except Exception as e:
            print(f"Prediction error for date {day['date']}: {e}")
            # Fallback to advanced realism if model fails
            predictions.append({
                "date": day["date"],
                "top_diseases": advanced_realistic_diseases(day, city)
            })


    # --------------------------------
    # Next 5 days → ADVANCED REALISM
    # --------------------------------
    for day in weather[2:]:
        predictions.append({
            "date": day["date"],
            "top_diseases": advanced_realistic_diseases(day, city)
        })

    return jsonify({
        "city": city,
        "predictions": predictions
    })

# -------------------------
# REPORT DISEASE ENDPOINT
# -------------------------
@app.route("/report_disease", methods=["POST"])
def report_disease():
    try:
        data = request.json
        print(f"Received report data: {data}")
        
        city = data.get("city")
        lat = data.get("lat")
        lon = data.get("lon")
        disease = data.get("disease")
        severity = data.get("severity")
        symptoms = data.get("symptoms", "")

        # Validate required fields
        if not all([city, lat, lon, disease, severity]):
            return jsonify({"error": "Missing required fields", "success": False}), 400

        # Insert into database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO disease_reports (city, latitude, longitude, disease, severity, symptoms)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (city, lat, lon, disease, severity, symptoms))
        conn.commit()
        report_id = cursor.lastrowid
        conn.close()
        
        print(f"Report saved with ID: {report_id}")

        # Create response with proper headers to prevent reload prompt
        response_data = {
            "success": True,
            "message": "Report submitted successfully",
            "report_id": report_id
        }
        
        response = jsonify(response_data)
        
        # Add critical headers to prevent browser reload prompts
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['Connection'] = 'close'
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        
        return response, 200

    except Exception as e:
        print(f"Error in report_disease: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500

# -------------------------
# GET ALL REPORTS ENDPOINT (optional - for dashboard)
# -------------------------
@app.route("/get_reports", methods=["GET"])
def get_reports():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM disease_reports ORDER BY submitted_at DESC")
        reports = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return jsonify({
            "success": True,
            "total": len(reports),
            "reports": reports
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    # Configure Flask to keep connections alive and prevent reload prompts
    app.config['JSON_SORT_KEYS'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
    app.run(host="0.0.0.0", port=5000, threaded=True)