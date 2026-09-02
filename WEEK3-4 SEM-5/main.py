"""
EduMetrics - Main Pipeline Execution Script
Runs complete Data Science workflow:
Dataset Generation -> Pandas Cleaning & Merging -> NumPy Broadcasting Analytics -> Seaborn/Matplotlib Chart Export
"""

import os
import sys
import json

# Force UTF-8 encoding on stdout for Windows compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add project root to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from data.generate_dataset import generate_datasets
from src.data_pipeline import DatasetPipeline
from src.numpy_analytics import NumPyAnalyticsEngine
from src.visualizer import VisualizationEngine

def main():
    print("=" * 60)
    print("[+] EduMetrics Analytics Engine Pipeline Execution")
    print("=" * 60)

    # Step 1: Generate synthetic raw data with missing values
    data_dir = os.path.join(BASE_DIR, 'data')
    generate_datasets(data_dir)

    student_csv = os.path.join(data_dir, 'students_raw.csv')
    grades_csv = os.path.join(data_dir, 'grades_raw.csv')

    # Step 2: Run Pandas Loading, Cleaning & Merging
    print("\n[1/4] Running Pandas Data Loading, Cleaning (fillna) & Merging...")
    pipeline = DatasetPipeline(student_csv, grades_csv)
    df = pipeline.load_and_clean()
    groupby_df = pipeline.compute_groupby_stats()
    comprehension_insights = pipeline.get_comprehension_insights()

    print(f"  ✓ Processed {len(df)} merged records.")
    print(f"  ✓ Top performance sample: {comprehension_insights['top_performers_sample'][:2]}")

    # Step 3: Run NumPy Array Math & Broadcasting
    print("\n[2/4] Running NumPy Vectorized Array Operations & Broadcasting...")
    numpy_engine = NumPyAnalyticsEngine(df)
    z_score_data = numpy_engine.z_score_broadcasting()
    gpa_df = numpy_engine.compute_weighted_gpa()

    print("  ✓ Z-Score Subject Means:", z_score_data['means'])
    print("  ✓ Top Weighted GPA Student:\n", gpa_df.head(2).to_dict(orient='records'))

    # Step 4: Run Matplotlib & Seaborn Chart Export
    print("\n[3/4] Exporting Seaborn & Matplotlib Statistical Charts...")
    charts_dir = os.path.join(BASE_DIR, 'static', 'charts')
    viz_engine = VisualizationEngine(df, charts_dir)
    chart_paths = viz_engine.generate_all_plots()

    print("  ✓ Saved charts to static/charts/:")
    for key, path in chart_paths.items():
        print(f"    - {key}: {os.path.basename(path)}")

    # Step 5: Export JSON summary for Web Dashboard
    print("\n[4/4] Exporting JSON summary for Web Dashboard...")
    static_dir = os.path.join(BASE_DIR, 'static')
    os.makedirs(static_dir, exist_ok=True)
    summary_path = os.path.join(static_dir, 'data_summary.json')

    summary_payload = {
        'total_records': len(df),
        'unique_students': int(df['student_id'].nunique()),
        'subjects_count': int(df['subject'].nunique()),
        'overall_avg_score': round(float(df['exam_score'].mean()), 2),
        'overall_avg_attendance': round(float(df['attendance_pct'].mean()), 2),
        'groupby_subject_dept': groupby_df.to_dict(orient='records'),
        'top_students': gpa_df.head(10).to_dict(orient='records'),
        'subject_means': z_score_data['means'],
        'subject_stds': z_score_data['stds'],
        'pass_rates': comprehension_insights['pass_rates_by_subject']
    }

    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary_payload, f, indent=2)

    print("  [+] Exported JSON summary to: " + summary_path)
    print("\n" + "=" * 60)
    print("[+] Pipeline Completed Successfully!")
    print("=" * 60)

if __name__ == '__main__':
    main()
