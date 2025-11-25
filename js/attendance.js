// متغيرات الحضور والغياب
let currentClass = '';
let currentDate = '';
let students = [];
let attendanceData = {};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين التاريخ الحالي كقيمة افتراضية
    document.getElementById('dateSelect').value = formatDate();
    
    // تحميل البيانات المحفوظة
    attendanceData = loadSavedData('attendance') || {};
    
    // إضافة المستمعين للأحداث
    document.getElementById('loadStudentsBtn').addEventListener('click', loadStudents);
    document.getElementById('saveAttendanceBtn').addEventListener('click', saveAttendance);
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
});

// دالة لتحميل قائمة الطلبة
async function loadStudents() {
    currentClass = document.getElementById('classSelect').value;
    currentDate = document.getElementById('dateSelect').value;
    
    if (!currentClass) {
        showMessage('يرجى اختيار القسم أولاً', 'error');
        return;
    }
    
    if (!currentDate) {
        showMessage('يرجى اختيار التاريخ أولاً', 'error');
        return;
    }
    
    try {
        students = await loadClassData(currentClass);
        displayStudentsTable();
        document.getElementById('attendanceTableContainer').style.display = 'block';
        document.getElementById('reportsContainer').style.display = 'block';
        showMessage('تم تحميل قائمة الطلبة بنجاح', 'success');
    } catch (error) {
        showMessage('حدث خطأ في تحميل بيانات الطلبة', 'error');
    }
}

// دالة لعرض جدول الطلبة
function displayStudentsTable() {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';
    
    const dateKey = `${currentClass}-${currentDate}`;
    const savedAttendance = attendanceData[dateKey] || {};
    
    students.forEach((student, index) => {
        const studentAttendance = savedAttendance[student.fullName] || { status: 'present', note: '' };
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.fullName}</td>
            <td>
                <select class="attendance-status" data-index="${index}">
                    <option value="present" ${studentAttendance.status === 'present' ? 'selected' : ''}>حاضر</option>
                    <option value="absent" ${studentAttendance.status === 'absent' ? 'selected' : ''}>غائب</option>
                    <option value="late" ${studentAttendance.status === 'late' ? 'selected' : ''}>متأخر</option>
                </select>
            </td>
            <td>
                <input type="text" class="attendance-note" data-index="${index}" 
                       value="${studentAttendance.note}" placeholder="ملاحظة اختيارية...">
            </td>
            <td>
                <span class="status-display ${studentAttendance.status}">
                    ${getStatusText(studentAttendance.status)}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للحقول
    document.querySelectorAll('.attendance-status').forEach(select => {
        select.addEventListener('change', updateStatusDisplay);
    });
}

// دالة لتحديث عرض الحالة
function updateStatusDisplay(event) {
    const index = event.target.dataset.index;
    const status = event.target.value;
    const row = event.target.closest('tr');
    const statusDisplay = row.querySelector('.status-display');
    
    statusDisplay.className = `status-display ${status}`;
    statusDisplay.textContent = getStatusText(status);
}

// دالة للحصول على نص الحالة
function getStatusText(status) {
    const statusTexts = {
        'present': 'حاضر',
        'absent': 'غائب',
        'late': 'متأخر'
    };
    return statusTexts[status] || 'غير محدد';
}

// دالة لحفظ بيانات الحضور
function saveAttendance() {
    if (!currentClass || !currentDate) {
        showMessage('يرجى تحميل قائمة الطلبة أولاً', 'error');
        return;
    }
    
    const dateKey = `${currentClass}-${currentDate}`;
    if (!attendanceData[dateKey]) {
        attendanceData[dateKey] = {};
    }
    
    // جمع البيانات من الجدول
    document.querySelectorAll('.attendance-status').forEach(select => {
        const index = select.dataset.index;
        const student = students[index];
        const noteInput = document.querySelector(`.attendance-note[data-index="${index}"]`);
        
        attendanceData[dateKey][student.fullName] = {
            status: select.value,
            note: noteInput.value
        };
    });
    
    // حفظ البيانات
    saveData('attendance', attendanceData);
    showMessage('تم حفظ بيانات الحضور بنجاح', 'success');
    
    // تحديث التقارير
    generateReport();
}

// دالة لتوليد التقارير
function generateReport() {
    if (!currentClass) {
        showMessage('يرجى اختيار القسم أولاً', 'error');
        return;
    }
    
    const reportsContent = document.getElementById('reportsContent');
    let reportHTML = '<h3>إحصائيات الحضور</h3>';
    
    // إحصائيات عامة
    const classAttendance = {};
    let totalPresent = 0, totalAbsent = 0, totalLate = 0;
    
    // جمع الإحصائيات
    Object.keys(attendanceData).forEach(dateKey => {
        if (dateKey.startsWith(currentClass)) {
            const dateData = attendanceData[dateKey];
            Object.values(dateData).forEach(record => {
                if (record.status === 'present') totalPresent++;
                else if (record.status === 'absent') totalAbsent++;
                else if (record.status === 'late') totalLate++;
            });
        }
    });
    
    const totalRecords = totalPresent + totalAbsent + totalLate;
    
    if (totalRecords > 0) {
        reportHTML += `
            <div class="stats-grid">
                <div class="stat-card present">
                    <h4>الحضور</h4>
                    <p>${totalPresent} (${Math.round((totalPresent / totalRecords) * 100)}%)</p>
                </div>
                <div class="stat-card absent">
                    <h4>الغياب</h4>
                    <p>${totalAbsent} (${Math.round((totalAbsent / totalRecords) * 100)}%)</p>
                </div>
                <div class="stat-card late">
                    <h4>التأخر</h4>
                    <p>${totalLate} (${Math.round((totalLate / totalRecords) * 100)}%)</p>
                </div>
            </div>
        `;
    } else {
        reportHTML += '<p>لا توجد بيانات للحضور والغياب لهذا القسم</p>';
    }
    
    // تاريخ اليوم
    const todayKey = `${currentClass}-${formatDate()}`;
    if (attendanceData[todayKey]) {
        reportHTML += '<h3 style="margin-top: 20px;">حضور اليوم</h3>';
        const todayData = attendanceData[todayKey];
        
        let presentToday = 0, absentToday = 0, lateToday = 0;
        Object.values(todayData).forEach(record => {
            if (record.status === 'present') presentToday++;
            else if (record.status === 'absent') absentToday++;
            else if (record.status === 'late') lateToday++;
        });
        
        reportHTML += `
            <p>الحضور: ${presentToday} | الغياب: ${absentToday} | التأخر: ${lateToday}</p>
        `;
    }
    
    reportsContent.innerHTML = reportHTML;
}

// إضافة تنسيقات إضافية للتقارير
const reportStyles = document.createElement('style');
reportStyles.textContent = `
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin: 15px 0;
    }
    
    .stat-card {
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        color: white;
    }
    
    .stat-card h4 {
        margin-bottom: 5px;
    }
    
    .stat-card.present { background-color: var(--success-color); }
    .stat-card.absent { background-color: var(--danger-color); }
    .stat-card.late { background-color: var(--warning-color); }
`;
document.head.appendChild(reportStyles);