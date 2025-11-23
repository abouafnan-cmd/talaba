// إدارة التقارير والإحصاءات
function initReportsManagement() {
    // تغيير نوع التقرير
    document.getElementById('report-type').addEventListener('change', function() {
        updateReports();
    });

    // تغيير المادة في التقارير
    document.getElementById('report-subject').addEventListener('change', function() {
        updateReports();
    });
}

// تحديث التقارير
function updateReports() {
    const reportType = document.getElementById('report-type').value;
    const statsContainer = document.getElementById('stats-container');
    
    // إظهار أو إخفاء اختيار المادة
    const subjectSelectReport = document.getElementById('subject-select-report');
    if (reportType === 'subject') {
        subjectSelectReport.style.display = 'block';
    } else {
        subjectSelectReport.style.display = 'none';
    }
    
    if (reportType === 'general') {
        showGeneralStats(statsContainer);
    } else if (reportType === 'subject') {
        showSubjectStats(statsContainer);
    } else if (reportType === 'student') {
        showStudentStats(statsContainer);
    }
    
    updateReportsTable();
}

// عرض الإحصائيات العامة
function showGeneralStats(container) {
    const totalRecords = window.appData.attendanceRecords.length;
    const totalPresent = window.appData.attendanceRecords.reduce((acc, record) => {
        return acc + record.attendance.filter(a => a.status === 'present').length;
    }, 0);
    const totalAbsent = window.appData.attendanceRecords.reduce((acc, record) => {
        return acc + record.attendance.filter(a => a.status === 'absent').length;
    }, 0);
    const attendanceRate = totalRecords > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2) : 0;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-title">إجمالي سجلات الحضور</div>
            <div class="stat-value">${totalRecords}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">إجمالي الحضور</div>
            <div class="stat-value attendance-present">${totalPresent}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">إجمالي الغياب</div>
            <div class="stat-value attendance-absent">${totalAbsent}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">نسبة الحضور</div>
            <div class="stat-value">${attendanceRate}%</div>
        </div>
    `;
}

// عرض إحصائيات حسب المادة
function showSubjectStats(container) {
    const subjectId = document.getElementById('report-subject').value;
    if (!subjectId) {
        container.innerHTML = '<p>يرجى اختيار مادة لعرض الإحصائيات</p>';
        return;
    }
    
    const subjectRecords = window.appData.attendanceRecords.filter(r => r.subject == subjectId);
    const subjectName = window.appData.subjects.find(s => s.id == subjectId)?.name || 'غير معروف';
    
    const totalRecords = subjectRecords.length;
    const totalPresent = subjectRecords.reduce((acc, record) => {
        return acc + record.attendance.filter(a => a.status === 'present').length;
    }, 0);
    const totalAbsent = subjectRecords.reduce((acc, record) => {
        return acc + record.attendance.filter(a => a.status === 'absent').length;
    }, 0);
    const attendanceRate = totalRecords > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2) : 0;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-title">سجلات الحضور لـ ${subjectName}</div>
            <div class="stat-value">${totalRecords}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">الحضور في ${subjectName}</div>
            <div class="stat-value attendance-present">${totalPresent}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">الغياب في ${subjectName}</div>
            <div class="stat-value attendance-absent">${totalAbsent}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">نسبة الحضور في ${subjectName}</div>
            <div class="stat-value">${attendanceRate}%</div>
        </div>
    `;
}

// عرض إحصائيات حسب الطالب
function showStudentStats(container) {
    if (window.appData.students.length === 0) {
        container.innerHTML = '<p>لا توجد بيانات طلاب لعرض الإحصائيات</p>';
        return;
    }
    
    let statsHTML = '';
    
    window.appData.students.forEach(student => {
        const studentRecords = window.appData.attendanceRecords.filter(record => 
            record.attendance.some(a => a.studentId === student.id)
        );
        
        const totalRecords = studentRecords.length;
        const presentCount = studentRecords.reduce((acc, record) => {
            const studentAttendance = record.attendance.find(a => a.studentId === student.id);
            return acc + (studentAttendance && studentAttendance.status === 'present' ? 1 : 0);
        }, 0);
        
        const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0;
        
        statsHTML += `
            <div class="stat-card">
                <div class="stat-title">${student.name}</div>
                <div class="stat-value">${attendanceRate}%</div>
                <div class="stat-title">${presentCount}/${totalRecords} حصة</div>
            </div>
        `;
    });
    
    container.innerHTML = statsHTML;
}

// تحديث جدول التقارير
function updateReportsTable() {
    const reportType = document.getElementById('report-type').value;
    const tbody = document.querySelector('#reports-table tbody');
    tbody.innerHTML = '';
    
    let filteredRecords = window.appData.attendanceRecords;
    
    if (reportType === 'subject') {
        const subjectId = document.getElementById('report-subject').value;
        if (subjectId) {
            filteredRecords = window.appData.attendanceRecords.filter(r => r.subject == subjectId);
        }
    }
    
    filteredRecords.forEach(record => {
        const sectionName = window.appData.sections.find(s => s.id === record.section)?.name || 'غير معروف';
        const subjectName = window.appData.subjects.find(s => s.id == record.subject)?.name || 'غير معروف';
        
        const presentCount = record.attendance.filter(a => a.status === 'present').length;
        const absentCount = record.attendance.filter(a => a.status === 'absent').length;
        const totalCount = presentCount + absentCount;
        const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${subjectName}</td>
            <td>${sectionName}</td>
            <td>${attendanceRate}%</td>
            <td>${presentCount}</td>
            <td>${absentCount}</td>
        `;
        tbody.appendChild(tr);
    });
}

// تهيئة إدارة التقارير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initReportsManagement();
    updateReports();
});