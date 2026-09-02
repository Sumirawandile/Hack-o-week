"""
EduMetrics - Synthetic Dataset Generator
Generates realistic raw CSV data with intentional missing values and noise
to demonstrate Pandas Data Cleaning and Merging.
"""

import os
import random
import csv

def generate_datasets(data_dir):
    os.makedirs(data_dir, exist_ok=True)
    random.seed(42)

    student_file = os.path.join(data_dir, 'students_raw.csv')
    grades_file = os.path.join(data_dir, 'grades_raw.csv')

    first_names = ["Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Neha", "Kabir", "Diya", "Aditya", "Ishita",
                   "Arjun", "Sneha", "Rahul", "Tanvi", "Siddharth", "Pooja", "Dev", "Meera", "Yash", "Kavya"]
    last_names = ["Sharma", "Verma", "Patel", "Gupta", "Singh", "Rao", "Joshi", "Mehta", "Nair", "Kumar"]
    subjects = ["Linear Algebra", "Calculus", "Python Programming", "Data Structures", "Statistics"]
    departments = ["Computer Science", "Data Science", "AI & ML", "Information Tech"]

    # 1. Generate Students Dataset (Demographics)
    student_records = []
    num_students = 100

    for s_id in range(101, 101 + num_students):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        dept = random.choice(departments)
        age = random.choice([19, 20, 21, 22, None]) # intentional missing age
        study_hours_per_week = round(random.uniform(5.0, 25.0), 1)
        
        student_records.append({
            'student_id': s_id,
            'name': name,
            'department': dept,
            'age': age if age is not None else '',
            'study_hours': study_hours_per_week
        })

    with open(student_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['student_id', 'name', 'department', 'age', 'study_hours'])
        writer.writeheader()
        writer.writerows(student_records)

    # 2. Generate Grades Dataset (Course Scores & Attendance)
    grade_records = []
    for s_id in range(101, 101 + num_students):
        for sub in subjects:
            # Base performance correlated with study hours
            student_info = next(s for s in student_records if s['student_id'] == s_id)
            hours = student_info['study_hours']
            
            base_score = 40 + (hours * 2.2) + random.uniform(-10, 10)
            score = max(25.0, min(100.0, round(base_score, 1)))

            attendance = max(45.0, min(100.0, round(60 + (hours * 1.5) + random.uniform(-12, 12), 1)))
            
            # Introduce intentional missing values in 8% of records
            score_val = score if random.random() > 0.08 else ''
            att_val = attendance if random.random() > 0.05 else ''

            grade_records.append({
                'student_id': s_id,
                'subject': sub,
                'exam_score': score_val,
                'attendance_pct': att_val
            })

    with open(grades_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['student_id', 'subject', 'exam_score', 'attendance_pct'])
        writer.writeheader()
        writer.writerows(grade_records)

    print(f"Generated synthetic datasets:\n  - {student_file}\n  - {grades_file}")

if __name__ == '__main__':
    generate_datasets(os.path.dirname(__file__))
