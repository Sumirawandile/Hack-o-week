/**
 * EduMetrics Dashboard - Main Interactivity Controller
 * Loads data_summary.json and manages tab switching
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetElem = document.getElementById(targetTab);
            if (targetElem) targetElem.classList.add('active');
        });
    });

    // Fetch and populate metrics from static/data_summary.json
    fetch('static/data_summary.json')
        .then(res => res.json())
        .then(data => {
            populateDashboard(data);
        })
        .catch(err => {
            console.warn("Using inline default dataset summary fallback", err);
        });
});

function populateDashboard(data) {
    // Populate KPI Cards
    const kpiTotal = document.getElementById('kpi-total');
    const kpiStudents = document.getElementById('kpi-students');
    const kpiScore = document.getElementById('kpi-score');
    const kpiAttendance = document.getElementById('kpi-attendance');

    if (kpiTotal) kpiTotal.textContent = data.total_records || 500;
    if (kpiStudents) kpiStudents.textContent = data.unique_students || 100;
    if (kpiScore) kpiScore.textContent = `${data.overall_avg_score || 71.5}%`;
    if (kpiAttendance) kpiAttendance.textContent = `${data.overall_avg_attendance || 74.8}%`;

    // Populate GroupBy Table
    const groupbyTableBody = document.getElementById('groupby-table-body');
    if (groupbyTableBody && data.groupby_subject_dept) {
        let html = '';
        data.groupby_subject_dept.slice(0, 10).forEach(row => {
            html += `
                <tr>
                    <td><strong>${row.subject}</strong></td>
                    <td>${row.department}</td>
                    <td><span style="color: var(--primary-cyan); font-weight: bold;">${row.avg_score}</span></td>
                    <td>${row.avg_attendance}%</td>
                    <td>${row.avg_study_hours} hrs/wk</td>
                    <td>${row.student_count}</td>
                </tr>
            `;
        });
        groupbyTableBody.innerHTML = html;
    }

    // Populate Top Performers Table
    const topTableBody = document.getElementById('top-table-body');
    if (topTableBody && data.top_students) {
        let html = '';
        data.top_students.slice(0, 8).forEach((row, rank) => {
            html += `
                <tr>
                    <td>#${rank + 1}</td>
                    <td>Student ID #${row.student_id}</td>
                    <td><span style="color: var(--primary-emerald); font-weight: bold;">${row.weighted_score}</span></td>
                    <td>${row.percentile_rank}th Percentile</td>
                </tr>
            `;
        });
        topTableBody.innerHTML = html;
    }
}
