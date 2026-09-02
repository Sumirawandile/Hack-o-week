"""
EduMetrics - Python Essentials & Pandas Pipeline
Demonstrates:
1. Object-Oriented Programming (OOP) Classes
2. List & Dictionary Comprehensions
3. Pandas DataFrame Handling, Cleaning, Merging & GroupBy Aggregations
"""

import pandas as pd
import numpy as np

class DataCleaner:
    """Class responsible for cleaning messy raw datasets."""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    def handle_missing_values(self) -> pd.DataFrame:
        """Fill missing numerical values with column medians and drop invalid IDs."""
        # Clean Student ID
        self.df = self.df.dropna(subset=['student_id'])
        self.df['student_id'] = self.df['student_id'].astype(int)

        # Fill missing numeric values using median imputation
        numeric_cols = ['age', 'study_hours', 'exam_score', 'attendance_pct']
        for col in numeric_cols:
            if col in self.df.columns:
                median_val = self.df[col].median()
                self.df[col] = self.df[col].fillna(median_val)
        
        return self.df

    def remove_outliers(self, column: str, num_stds: float = 3.0) -> pd.DataFrame:
        """Filter out extreme statistical outliers based on Z-score threshold."""
        if column in self.df.columns:
            mean = self.df[column].mean()
            std = self.df[column].std()
            self.df = self.df[np.abs(self.df[column] - mean) <= (num_stds * std)]
        return self.df


class DatasetPipeline:
    """OOP Pipeline managing data loading, merging, and transformations."""

    def __init__(self, student_csv_path: str, grades_csv_path: str):
        self.student_path = student_csv_path
        self.grades_path = grades_csv_path
        self.students_df = None
        self.grades_df = None
        self.merged_df = None

    def load_and_clean(self) -> pd.DataFrame:
        """Load raw CSVs, apply cleaning pipeline, and merge DataFrames."""
        raw_students = pd.read_csv(self.student_path)
        raw_grades = pd.read_csv(self.grades_path)

        # Clean individual datasets
        cleaner_students = DataCleaner(raw_students)
        self.students_df = cleaner_students.handle_missing_values()

        cleaner_grades = DataCleaner(raw_grades)
        self.grades_df = cleaner_grades.handle_missing_values()

        # Merge datasets on 'student_id'
        self.merged_df = pd.merge(
            self.students_df,
            self.grades_df,
            on='student_id',
            how='inner'
        )

        # Calculate calculated metric: Overall Weighted Performance Score
        self.merged_df['performance_index'] = (
            self.merged_df['exam_score'] * 0.7 + self.merged_df['attendance_pct'] * 0.3
        ).round(2)

        return self.merged_df

    def compute_groupby_stats(self) -> pd.DataFrame:
        """Pandas multi-column groupby aggregation by Subject and Department."""
        if self.merged_df is None:
            raise ValueError("Data not loaded! Call load_and_clean() first.")

        groupby_df = self.merged_df.groupby(['subject', 'department']).agg(
            avg_score=('exam_score', 'mean'),
            median_score=('exam_score', 'median'),
            avg_attendance=('attendance_pct', 'mean'),
            avg_study_hours=('study_hours', 'mean'),
            student_count=('student_id', 'count')
        ).reset_index().round(2)

        return groupby_df

    def get_comprehension_insights(self) -> dict:
        """Demonstrates Python List and Dict Comprehensions."""
        if self.merged_df is None:
            return {}

        records = self.merged_df.to_dict(orient='records')

        # List Comprehension: Filter top performing records (score >= 85)
        top_performers = [
            f"{r['name']} ({r['subject']}): {r['exam_score']}"
            for r in records if r['exam_score'] >= 85.0
        ]

        # Dict Comprehension: Subject performance classification count
        subjects = list(set(r['subject'] for r in records))
        subject_pass_rates = {
            sub: round((len([r for r in records if r['subject'] == sub and r['exam_score'] >= 50.0]) /
                        len([r for r in records if r['subject'] == sub])) * 100, 1)
            for sub in subjects
        }

        return {
            'top_performers_sample': top_performers[:5],
            'pass_rates_by_subject': subject_pass_rates
        }
