import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
import pickle

# 1. Load the new dataset
df = pd.read_csv("data/Symptom2Disease.csv")

# Drop the first unnamed index column if it exists
if 'Unnamed: 0' in df.columns:
    df = df.drop(columns=['Unnamed: 0'])

# 2. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df['label'], test_size=0.2, random_state=42, stratify=df['label']
)

# 3. Build NLP Pipeline (TF-IDF + SVM)
model = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
    ('clf', LinearSVC(random_state=42, class_weight='balanced')) 
])

# 4. Train
print("Training NLP model...")
model.fit(X_train, y_train)

# 5. Evaluate
accuracy = model.score(X_test, y_test)
print(f"✅ NLP Model Training Complete. Accuracy: {accuracy * 100:.2f}%")

# 6. Save
with open("nlp_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("✅ Saved nlp_model.pkl")