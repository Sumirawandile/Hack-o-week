# Week 11-12: Dimensionality Reduction (PCA and t-SNE)

Jupyter notebook: `week11_12_dimensionality_reduction.ipynb`

## Topics
**PCA (Principal Component Analysis)**
- Intuition: new axes along the directions of maximum variance (2D example with arrows)
- Iris (4 features -> 2): explained variance, scree plot, loadings
- Digits (64 features -> 2): how many components to keep, reconstruction of images
- Application: speeding up a classifier with fewer components

**t-SNE (intuition)**
- Keeps neighbours close, non-linear, used for visualization
- Digits (64 features -> 2) and the effect of perplexity
- How to read a t-SNE plot (and what not to read into it)

**Comparison** of PCA vs t-SNE in a table, plus real-world applications.

## How to run
```
pip install -r requirements.txt
jupyter notebook week11_12_dimensionality_reduction.ipynb
```
The notebook is saved with its outputs, so GitHub shows all tables and graphs without running anything.

## Author
Your Name - Roll No
