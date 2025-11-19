import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.utils.class_weight import compute_class_weight
import joblib
import numpy as np

print("Loading dataset...")
df = pd.read_csv("../data/final_dataset_appended_cleaned.csv")

# Drop NA data
df = df.dropna(subset=["disease_raw", "district", "avg_temp", "rainfall", "humidity"])

# Label encode
district_encoder = LabelEncoder()
df["district_encoded"] = district_encoder.fit_transform(df["district"])

disease_encoder = LabelEncoder()
df["disease_encoded"] = disease_encoder.fit_transform(df["disease_raw"])

X = df[["district_encoded", "year", "week", "avg_temp", "rainfall", "humidity"]]
y = df["disease_encoded"]

# Compute class weights to fight imbalance
classes = np.unique(y)
weights = compute_class_weight("balanced", classes=classes, y=y)
class_weights = {i: weights[i] for i in range(len(classes))}

print("Class Weights:", class_weights)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Improved model
model = RandomForestClassifier(
    n_estimators=400,
    max_depth=None,
    class_weight=class_weights,
    random_state=42,
    n_jobs=-1
)

print("\nTraining model...")
model.fit(X_train, y_train)

# Test predictions
y_pred = model.predict(X_test)
print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nReport:\n", classification_report(y_test, y_pred, target_names=disease_encoder.classes_))

# Save model + encoders
joblib.dump(model, "disease_predictor.pkl")
joblib.dump(district_encoder, "district_encoder.pkl")
joblib.dump(disease_encoder, "disease_encoder.pkl")

print("\nModel retrained with balancing and saved successfully!")
