"""
EduMetrics - Data Visualization Engine
Demonstrates:
1. Matplotlib (Scatter plots, trend lines, grouped bar charts)
2. Seaborn (Correlation heatmaps, subject boxplots/violin plots)
"""

import os
import pandas as pd
import matplotlib
matplotlib.use('Agg') # Non-interactive background renderer
import matplotlib.pyplot as plt
import seaborn as sns

class VisualizationEngine:
    """Class generating static Seaborn & Matplotlib plots saved as high-res PNGs."""

    def __init__(self, df: pd.DataFrame, output_dir: str):
        self.df = df
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        # Set modern dark styling for Seaborn/Matplotlib
        sns.set_theme(style="darkgrid")
        plt.rcParams.update({
            'figure.facecolor': '#0f172a',
            'axes.facecolor': '#1e293b',
            'axes.edgecolor': '#334155',
            'axes.labelcolor': '#f8fafc',
            'xtick.color': '#cbd5e1',
            'ytick.color': '#cbd5e1',
            'text.color': '#f8fafc',
            'font.family': 'sans-serif'
        })

    def generate_all_plots(self) -> dict:
        """Generates and exports all 4 required statistical charts."""
        p1 = self.plot_correlation_heatmap()
        p2 = self.plot_subject_score_distributions()
        p3 = self.plot_attendance_vs_score()
        p4 = self.plot_department_performance()

        return {
            'correlation_heatmap': p1,
            'subject_distributions': p2,
            'attendance_vs_score': p3,
            'department_performance': p4
        }

    def plot_correlation_heatmap(self) -> str:
        """1. Seaborn Heatmap: Correlation between numerical metrics."""
        fig, ax = plt.subplots(figsize=(7, 5))
        
        num_cols = ['study_hours', 'attendance_pct', 'exam_score', 'performance_index']
        corr_matrix = self.df[num_cols].corr()

        sns.heatmap(
            corr_matrix,
            annot=True,
            fmt=".2f",
            cmap="mako",
            cbar=True,
            ax=ax,
            linewidths=0.5
        )
        
        ax.set_title("Seaborn Correlation Matrix Heatmap", fontsize=13, fontweight='bold', pad=12, color='#38bdf8')
        plt.tight_layout()

        out_path = os.path.join(self.output_dir, 'correlation_heatmap.png')
        fig.savefig(out_path, dpi=150)
        plt.close(fig)
        return out_path

    def plot_subject_score_distributions(self) -> str:
        """2. Seaborn Boxplot: Subject score distributions."""
        fig, ax = plt.subplots(figsize=(8, 5))

        sns.boxplot(
            data=self.df,
            x='subject',
            y='exam_score',
            hue='subject',
            palette="magma",
            legend=False,
            ax=ax
        )
        
        ax.set_title("Seaborn Subject Score Boxplot Distributions", fontsize=13, fontweight='bold', pad=12, color='#a855f7')
        ax.set_xlabel("Subject Name", fontweight='bold')
        ax.set_ylabel("Exam Score (%)", fontweight='bold')
        plt.xticks(rotation=15)
        plt.tight_layout()

        out_path = os.path.join(self.output_dir, 'score_distribution.png')
        fig.savefig(out_path, dpi=150)
        plt.close(fig)
        return out_path

    def plot_attendance_vs_score(self) -> str:
        """3. Matplotlib Scatter Plot + Regression Line: Attendance vs Score."""
        fig, ax = plt.subplots(figsize=(7, 5))

        # Scatter plot
        sns.scatterplot(
            data=self.df,
            x='attendance_pct',
            y='exam_score',
            hue='subject',
            alpha=0.7,
            s=60,
            ax=ax
        )

        # Matplotlib Linear Regression fit line
        sns.regplot(
            data=self.df,
            x='attendance_pct',
            y='exam_score',
            scatter=False,
            ax=ax,
            color='#f43f5e',
            line_kws={'linewidth': 2, 'label': 'Linear Regression Trend'}
        )

        ax.set_title("Matplotlib Scatter: Attendance % vs Exam Score", fontsize=13, fontweight='bold', pad=12, color='#10b981')
        ax.set_xlabel("Attendance Percentage (%)", fontweight='bold')
        ax.set_ylabel("Exam Score (%)", fontweight='bold')
        ax.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
        plt.tight_layout()

        out_path = os.path.join(self.output_dir, 'attendance_vs_grade.png')
        fig.savefig(out_path, dpi=150)
        plt.close(fig)
        return out_path

    def plot_department_performance(self) -> str:
        """4. Matplotlib Grouped Bar Chart: Department Performance."""
        fig, ax = plt.subplots(figsize=(8, 5))

        dept_df = self.df.groupby('department')[['exam_score', 'attendance_pct']].mean().reset_index()

        x = range(len(dept_df['department']))
        width = 0.35

        ax.bar([i - width/2 for i in x], dept_df['exam_score'], width, label='Avg Exam Score', color='#06b6d4')
        ax.bar([i + width/2 for i in x], dept_df['attendance_pct'], width, label='Avg Attendance %', color='#8b5cf6')

        ax.set_title("Matplotlib Grouped Bar Chart: Dept Benchmarks", fontsize=13, fontweight='bold', pad=12, color='#eab308')
        ax.set_xlabel("Department", fontweight='bold')
        ax.set_ylabel("Percentage (%)", fontweight='bold')
        ax.set_xticks(list(x))
        ax.set_xticklabels(dept_df['department'], rotation=10)
        ax.set_ylim(0, 100)
        ax.legend()
        plt.tight_layout()

        out_path = os.path.join(self.output_dir, 'subject_groupby.png')
        fig.savefig(out_path, dpi=150)
        plt.close(fig)
        return out_path
