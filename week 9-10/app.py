"""
ML Weekly Task (Week 9-10) - Model Evaluation and Preprocessing
Run with:  streamlit run app.py
"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (confusion_matrix, accuracy_score, precision_score,
                             recall_score, f1_score, roc_auc_score, roc_curve)

st.set_page_config(page_title="ML Weekly Task - Week 9-10", layout="centered")


# ---------------- data ----------------
@st.cache_data
def make_data():
    """100 students: hours, attendance, passed (1) or failed (0). Some values are missing."""
    rng = np.random.default_rng(11)
    n = 100
    y = rng.integers(0, 2, n)
    hours = np.clip(np.where(y == 1, 6.5, 3.5) + rng.normal(0, 1.8, n), 0, 10)
    attendance = np.clip(np.where(y == 1, 80, 58) + rng.normal(0, 12, n), 30, 100)
    df = pd.DataFrame({"hours": hours, "attendance": attendance, "passed": y})
    df.loc[rng.random(n) < 0.12, "hours"] = np.nan        # make some data missing
    df.loc[rng.random(n) < 0.15, "attendance"] = np.nan
    return df


def add_features(X, eng):
    """Feature engineering: create new columns from the old ones."""
    X = X.copy()
    if eng:
        X["effort"] = X["hours"] * X["attendance"] / 100
        X["hours_squared"] = X["hours"] ** 2
    return X


def build_pipeline(missing, scaling):
    """Imputer -> scaler -> model. Inside a Pipeline, the fill values and scaling numbers
    are learned from the training data only (no data leakage)."""
    steps = []
    if missing in ("mean", "median"):
        steps.append(("impute", SimpleImputer(strategy=missing)))
    if scaling == "minmax":
        steps.append(("scale", MinMaxScaler()))
    elif scaling == "standard":
        steps.append(("scale", StandardScaler()))
    steps.append(("model", LogisticRegression(max_iter=1000)))
    return Pipeline(steps)


def split_and_fit(df, missing, scaling, eng, test_size):
    X = add_features(df.drop(columns="passed"), eng)
    y = df["passed"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, stratify=y, random_state=42)
    if missing == "drop":
        X_train = X_train.dropna(); y_train = y_train.loc[X_train.index]
        X_test = X_test.dropna(); y_test = y_test.loc[X_test.index]
    model = build_pipeline(missing, scaling).fit(X_train, y_train)
    probs = model.predict_proba(X_test)[:, 1]
    return model, X_train, X_test, y_train, y_test, probs


# ---------------- page ----------------
df = make_data()
st.title("Model Evaluation and Preprocessing")
st.caption("Machine Learning - Weekly Task (Week 9-10) | Problem: predict Pass/Fail from hours studied and attendance using Logistic Regression")

# settings
st.sidebar.header("Settings")
missing = st.sidebar.selectbox("Handle missing values", ["drop", "mean", "median"], index=1)
scaling = st.sidebar.selectbox("Scaling", ["none", "minmax", "standard"], index=2)
eng = st.sidebar.checkbox("Add engineered features (effort, hours squared)")
test_pct = st.sidebar.slider("Test size (%)", 20, 40, 25, step=5)
threshold = st.sidebar.slider("Classification threshold", 0.1, 0.9, 0.5, step=0.05)
folds = st.sidebar.selectbox("Cross-validation folds", [3, 5, 10], index=1)

model, X_train, X_test, y_train, y_test, probs = split_and_fit(df, missing, scaling, eng, test_pct / 100)

# ---- Part 1 ----
st.header("Part 1: Data, missing values and scaling")
st.write("First 8 rows of the raw data (NaN = missing):")
st.dataframe(df.head(8))
miss = df.isna().sum()
st.write(f"Total rows: {len(df)} | Missing hours: {miss['hours']} | Missing attendance: {miss['attendance']} "
         f"| Rows with any missing value: {int(df.isna().any(axis=1).sum())}")
if "impute" in model.named_steps:
    fills = dict(zip(X_train.columns, model.named_steps["impute"].statistics_.round(2)))
    st.write(f"Missing values were filled with the training {missing}: {fills}")

if len(model.steps) > 1:
    processed = model[:-1].transform(X_train.head(5))
else:
    processed = X_train.head(5).values
st.write("First 5 training rows after preprocessing:")
st.dataframe(pd.DataFrame(processed, columns=X_train.columns).round(2))

with st.expander("Notes"):
    st.markdown("""
- Dropping rows is simple but throws away data. Filling with mean/median keeps all rows. Median is better when there are outliers.
- Fill values and scaling numbers are learned from the **training data only** and then applied to the test data. Using test data would be data leakage.
- Scaling puts hours (0-10) and attendance (30-100) on a similar range. It matters a lot for distance-based and gradient-based models (KNN, SVM, neural nets). Logistic Regression in scikit-learn copes fairly well, so the change in score here can be small.
- Feature engineering means creating new columns from old ones that might help the model.
""")

# ---- Part 2 ----
st.header("Part 2: Train/test split and evaluation")
st.write(f"Data split: {len(df) - int(round(len(df) * test_pct / 100))} rows for training, "
         f"{int(round(len(df) * test_pct / 100))} for testing. After handling missing values, "
         f"{len(X_train)} training rows and {len(X_test)} test rows are used.")

preds = (probs >= threshold).astype(int)
cm = confusion_matrix(y_test, preds, labels=[1, 0])
st.write("**Confusion matrix** (test data, at the chosen threshold)")
st.table(pd.DataFrame(cm, index=["Actual Pass", "Actual Fail"], columns=["Predicted Pass", "Predicted Fail"]))

c = st.columns(5)
c[0].metric("Accuracy", f"{accuracy_score(y_test, preds):.3f}")
c[1].metric("Precision", f"{precision_score(y_test, preds, zero_division=0):.3f}")
c[2].metric("Recall", f"{recall_score(y_test, preds, zero_division=0):.3f}")
c[3].metric("F1 score", f"{f1_score(y_test, preds, zero_division=0):.3f}")
c[4].metric("ROC-AUC", f"{roc_auc_score(y_test, probs):.3f}")
st.caption("Accuracy = (TP+TN)/total | Precision = TP/(TP+FP) | Recall = TP/(TP+FN) | F1 = 2PR/(P+R)")

fpr, tpr, _ = roc_curve(y_test, probs)
tp, fn, fp, tn = cm[0, 0], cm[0, 1], cm[1, 0], cm[1, 1]
fig, ax = plt.subplots(figsize=(5, 4))
ax.plot(fpr, tpr, label="ROC curve")
ax.plot([0, 1], [0, 1], "--", color="gray", label="Random guess")
ax.scatter([fp / (fp + tn)], [tp / (tp + fn)], color="red", zorder=3, label="Current threshold")
ax.set_xlabel("False positive rate"); ax.set_ylabel("True positive rate"); ax.legend()
st.pyplot(fig)

with st.expander("Notes"):
    st.markdown("""
- Train/test split: the model learns from the training part and is judged on test data it has never seen.
- Precision: of the students predicted Pass, how many really passed. Recall: of the students who really passed, how many we found.
- Moving the threshold up increases precision but lowers recall, and the other way round. The red dot shows the current threshold.
- ROC curve plots true positive rate against false positive rate at every threshold. AUC = 0.5 is random guessing, 1.0 is perfect.
- Accuracy alone can be misleading with unbalanced classes, so precision, recall and F1 are also used.
""")

# ---- Part 3 ----
st.header("Part 3: Cross-validation")
data_cv = df.dropna() if missing == "drop" else df
X_all = add_features(data_cv.drop(columns="passed"), eng)
y_all = data_cv["passed"]
cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=42)
res = cross_validate(build_pipeline(missing, scaling), X_all, y_all, cv=cv,
                     scoring=["accuracy", "f1", "roc_auc"])
cv_table = pd.DataFrame({"Accuracy": res["test_accuracy"], "F1": res["test_f1"], "ROC-AUC": res["test_roc_auc"]},
                        index=[f"Fold {i}" for i in range(1, folds + 1)])
cv_table.loc["Mean"] = cv_table.mean()
cv_table.loc["Std dev"] = cv_table.iloc[:folds].std(ddof=0)
st.write(f"{folds}-fold cross-validation (threshold 0.5)")
st.dataframe(cv_table.round(3))
with st.expander("Notes"):
    st.markdown("""
- In k-fold cross-validation the data is split into k parts. Each part is used once as the test set while the others are used for training.
- The mean over the folds is more reliable than one single train/test split. A large standard deviation means the score depends a lot on which rows were in the test set.
- Because we use a Pipeline, missing-value handling and scaling are redone inside every fold.
""")

# ---- Part 4 ----
st.header("Part 4: Comparing preprocessing choices")
st.write("Same train/test split as Part 2, using the threshold and feature engineering setting from the sidebar.")
rows = []
for m in ["drop", "mean", "median"]:
    for s in ["none", "minmax", "standard"]:
        _, _, _, _, yt, p = split_and_fit(df, m, s, eng, test_pct / 100)
        rows.append({"Missing values": m, "Scaling": s,
                     "Test accuracy": round(accuracy_score(yt, (p >= threshold).astype(int)), 3),
                     "Test ROC-AUC": round(roc_auc_score(yt, p), 3)})
st.dataframe(pd.DataFrame(rows), hide_index=True)
