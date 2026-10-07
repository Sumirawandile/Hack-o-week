# ML Weekly Task (Week 9-10) - Model Evaluation and Preprocessing

A Python (Streamlit) dashboard using scikit-learn.

## Model evaluation
- Train/test split (adjustable test size)
- K-fold cross-validation (3, 5 or 10 folds)
- Confusion matrix
- Precision, recall and F1 score (adjustable threshold)
- ROC curve and ROC-AUC

## Preprocessing
- Handling missing data: drop rows, fill with mean, fill with median
- Scaling: none, Min-Max, Standardization
- Feature engineering: effort = hours x attendance / 100, and hours squared

A scikit-learn `Pipeline` is used so fill values and scaling numbers are learned from training data only (no data leakage), also inside every cross-validation fold.

## Problem
Predict pass/fail from hours studied and attendance using Logistic Regression.

## How to run
```
pip install -r requirements.txt
streamlit run app.py
```
The dashboard opens in your browser.

## Author
Your Name - Roll No
