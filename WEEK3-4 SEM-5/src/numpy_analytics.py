"""
EduMetrics - NumPy Analytics & Broadcasting Engine
Demonstrates:
1. NumPy 2D Array Transformations & Pivoting
2. Vectorized Array Operations (No manual loops)
3. Array Broadcasting: Z-Score Normalization Z = (X - μ) / σ across matrix axes
4. Matrix Dot Product Weighting
"""

import numpy as np
import pandas as pd

class NumPyAnalyticsEngine:
    """Class performing matrix math and vectorized array transformations."""

    def __init__(self, merged_df: pd.DataFrame):
        self.df = merged_df.copy()
        self.score_matrix = None
        self.subjects = None
        self.student_ids = None
        
        self._prepare_matrix()

    def _prepare_matrix(self):
        """Pivot Pandas DataFrame into a clean 2D NumPy Score Matrix (Students × Subjects)."""
        pivot = self.df.pivot(index='student_id', columns='subject', values='exam_score')
        
        # Fill any remaining NaNs with column mean using pandas/numpy
        pivot = pivot.apply(lambda col: col.fillna(col.mean()), axis=0)
        
        self.student_ids = pivot.index.values
        self.subjects = pivot.columns.values
        self.score_matrix = pivot.to_numpy() # 2D NumPy float array

    def z_score_broadcasting(self) -> dict:
        """
        Demonstrates NumPy Array Broadcasting:
        Matrix X is shape (N, M). Mean μ and Std σ are shape (1, M).
        Subtracting μ from X automatically broadcasts μ down every row of X!
        Formula: Z = (X - μ) / σ
        """
        X = self.score_matrix
        
        # Compute mean and std per subject column (axis=0) -> 1D arrays of shape (M,)
        means = np.mean(X, axis=0)
        stds = np.std(X, axis=0)
        
        # Broadcasting happens here: (N, M) - (M,) -> (N, M)
        Z_scores = (X - means) / stds

        return {
            'Z_matrix': Z_scores,
            'means': dict(zip(self.subjects, np.round(means, 2))),
            'stds': dict(zip(self.subjects, np.round(stds, 2)))
        }

    def min_max_broadcasting(self) -> np.ndarray:
        """Broadcasting Min-Max scaling to map scores to range [0, 1]."""
        X = self.score_matrix
        mins = np.min(X, axis=0)
        maxs = np.max(X, axis=0)
        
        # Avoid division by zero
        range_denom = np.where(maxs - mins == 0, 1, maxs - mins)
        
        # Broadcasting: (N, M) - (M,) / (M,)
        scaled = (X - mins) / range_denom
        return scaled

    def compute_weighted_gpa(self, weights: list = None) -> pd.DataFrame:
        """
        Demonstrates Vectorized Matrix Dot Product (np.dot):
        Multiplies (N × M) Score Matrix by (M × 1) Weight Vector to compute Weighted GPAs.
        """
        if weights is None:
            # Default equal weights summing to 1.0
            weights = np.ones(len(self.subjects)) / len(self.subjects)
        else:
            weights = np.array(weights)

        # Matrix dot product: (N × M) · (M × 1) = (N × 1)
        weighted_scores = np.dot(self.score_matrix, weights)

        # Vectorized percentile ranking (np.percentile)
        p90 = np.percentile(weighted_scores, 90)
        p50 = np.percentile(weighted_scores, 50)

        # Create output DataFrame
        gpa_df = pd.DataFrame({
            'student_id': self.student_ids,
            'weighted_score': np.round(weighted_scores, 2),
            'percentile_rank': np.round(
                [np.sum(weighted_scores <= s) / len(weighted_scores) * 100 for s in weighted_scores], 1
            )
        })

        return gpa_df.sort_values(by='weighted_score', ascending=False)
