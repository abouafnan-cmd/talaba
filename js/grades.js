// متغيرات النقط والعلامات
let currentClassGrades = '';
let studentsGrades = [];
let gradesData = {};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات المحفوظة
    gradesData = loadSavedData('grades') || {};
    
    // إضافة المستمعين للأحداث
    document.getElementById('loadStudentsGradesBtn').addEventListener('click', loadStudentsForGrades);
    document.getElementById('saveGradesBtn').addEventListener('click', saveGrades);
});

// دالة لتحميل قائمة الطلبة للتقييم
async function loadStudentsForGrades() {
    currentClassGrades = document.getElementById('classSelectGrades').value;
    
    if (!currentClassGrades) {
        showMessage('يرجى اختيار القسم أولاً', 'error');
        return;
    }
    
    try {
        studentsGrades = await loadClassData(currentClassGrades);
        displayGradesTable();
        document.getElementById('gradesTableContainer').style.display = 'block';
        document.getElementById('gradesStatsContainer').style.display = 'block';
        showMessage('تم تحميل قائمة الطلبة بنجاح', 'success');
    } catch (error) {
        showMessage('حدث خطأ في تحميل بيانات الطلبة', 'error');
    }
}

// دالة لعرض جدول النقط
function displayGradesTable() {
    const tableBody = document.getElementById('gradesTableBody');
    tableBody.innerHTML = '';
    
    const classGrades = gradesData[currentClassGrades] || {};
    
    studentsGrades.forEach((student, index) => {
        const studentGrades = classGrades[student.fullName] || {
            exam1: '',
            exam2: '',
            activities: ''
        };
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.fullName}</td>
            <td>
                <input type="number" min="0" max="20" step="0.5" 
                       class="grade-input exam1" data-index="${index}" 
                       value="${studentGrades.exam1}" placeholder="0-20">
            </td>
            <td>
                <input type="number" min="0" max="20" step="0.5" 
                       class="grade-input exam2" data-index="${index}" 
                       value="${studentGrades.exam2}" placeholder="0-20">
            </td>
            <td>
                <input type="number" min="0" max="20" step="0.5" 
                       class="grade-input activities" data-index="${index}" 
                       value="${studentGrades.activities}" placeholder="0-20">
            </td>
            <td class="average-cell" data-index="${index}">
                ${calculateAverage(studentGrades.exam1, studentGrades.exam2, studentGrades.activities)}
            </td>
            <td class="rating-cell" data-index="${index}">
                ${getRating(calculateAverage(studentGrades.exam1, studentGrades.exam2, studentGrades.activities))}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للحقول
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('input', updateGrades);
    });
    
    // تحديث الإحصائيات
    updateGradesStats();
}

// دالة لتحديث النقط والمعدل
function updateGrades() {
    const index = this.dataset.index;
    const exam1 = parseFloat(document.querySelector(`.exam1[data-index="${index}"]`).value) || 0;
    const exam2 = parseFloat(document.querySelector(`.exam2[data-index="${index}"]`).value) || 0;
    const activities = parseFloat(document.querySelector(`.activities[data-index="${index}"]`).value) || 0;
    
    const average = calculateAverage(exam1, exam2, activities);
    const averageCell = document.querySelector(`.average-cell[data-index="${index}"]`);
    const ratingCell = document.querySelector(`.rating-cell[data-index="${index}"]`);
    
    averageCell.textContent = average;
    ratingCell.textContent = getRating(average);
    
    // تحديث الإحصائيات
    updateGradesStats();
}

// دالة لحساب المعدل
function calculateAverage(exam1, exam2, activities) {
    exam1 = parseFloat(exam1) || 0;
    exam2 = parseFloat(exam2) || 0;
    activities = parseFloat(activities) || 0;
    
    if (exam1 === 0 && exam2 === 0 && activities === 0) {
        return '-';
    }
    
    // حساب المعدل: (الفرض1 + الفرض2) * 0.375 + الأنشطة * 0.25
    const average = (exam1 + exam2) * 0.375 + activities * 0.25;
    return average.toFixed(2);
}

// دالة للحصول على التقدير
function getRating(average) {
    if (average === '-') return '-';
    
    const avg = parseFloat(average);
    if (avg >= 16) return 'ممتاز';
    if (avg >= 14) return 'جيد جداً';
    if (avg >= 12) return 'جيد';
    if (avg >= 10) return 'مقبول';
    return 'ضعيف';
}

// دالة لحفظ النقط
function saveGrades() {
    if (!currentClassGrades) {
        showMessage('يرجى تحميل قائمة الطلبة أولاً', 'error');
        return;
    }
    
    if (!gradesData[currentClassGrades]) {
        gradesData[currentClassGrades] = {};
    }
    
    // جمع البيانات من الجدول
    studentsGrades.forEach((student, index) => {
        const exam1 = document.querySelector(`.exam1[data-index="${index}"]`).value;
        const exam2 = document.querySelector(`.exam2[data-index="${index}"]`).value;
        const activities = document.querySelector(`.activities[data-index="${index}"]`).value;
        
        gradesData[currentClassGrades][student.fullName] = {
            exam1: exam1,
            exam2: exam2,
            activities: activities,
            average: calculateAverage(exam1, exam2, activities),
            rating: getRating(calculateAverage(exam1, exam2, activities))
        };
    });
    
    // حفظ البيانات
    saveData('grades', gradesData);
    showMessage('تم حفظ النقط بنجاح', 'success');
    
    // تحديث الإحصائيات
    updateGradesStats();
}

// دالة لتحديث إحصائيات التقييم
function updateGradesStats() {
    const statsContent = document.getElementById('gradesStatsContent');
    
    if (studentsGrades.length === 0) {
        statsContent.innerHTML = '<p>لا توجد بيانات لعرض الإحصائيات</p>';
        return;
    }
    
    let totalStudents = studentsGrades.length;
    let completedGrades = 0;
    let sumAverages = 0;
    let excellentCount = 0, veryGoodCount = 0, goodCount = 0, acceptableCount = 0, weakCount = 0;
    
    // جمع الإحصائيات
    studentsGrades.forEach((student, index) => {
        const exam1 = parseFloat(document.querySelector(`.exam1[data-index="${index}"]`).value) || 0;
        const exam2 = parseFloat(document.querySelector(`.exam2[data-index="${index}"]`).value) || 0;
        const activities = parseFloat(document.querySelector(`.activities[data-index="${index}"]`).value) || 0;
        
        if (exam1 > 0 || exam2 > 0 || activities > 0) {
            completedGrades++;
            const average = parseFloat(calculateAverage(exam1, exam2, activities));
            sumAverages += average;
            
            if (average >= 16) excellentCount++;
            else if (average >= 14) veryGoodCount++;
            else if (average >= 12) goodCount++;
            else if (average >= 10) acceptableCount++;
            else weakCount++;
        }
    });
    
    const classAvg = completedGrades > 0 ? (sumAverages / completedGrades).toFixed(2) : 0;
    
    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="background-color: #3498db;">
                <h4>إجمالي الطلبة</h4>
                <p>${totalStudents}</p>
            </div>
            <div class="stat-card" style="background-color: #27ae60;">
                <h4>تم تقييمهم</h4>
                <p>${completedStudents} (${Math.round((completedGrades / totalStudents) * 100)}%)</p>
            </div>
            <div class="stat-card" style="background-color: #e74c3c;">
                <h4>المعدل العام</h4>
                <p>${classAvg}/20</p>
            </div>
        </div>
        
        <h3 style="margin-top: 20px;">توزيع التقديرات</h3>
        <div class="stats-grid">
            <div class="stat-card" style="background-color: #27ae60;">
                <h4>ممتاز</h4>
                <p>${excellentCount}</p>
            </div>
            <div class="stat-card" style="background-color: #2ecc71;">
                <h4>جيد جداً</h4>
                <p>${veryGoodCount}</p>
            </div>
            <div class="stat-card" style="background-color: #f39c12;">
                <h4>جيد</h4>
                <p>${goodCount}</p>
            </div>
            <div class="stat-card" style="background-color: #e67e22;">
                <h4>مقبول</h4>
                <p>${acceptableCount}</p>
            </div>
            <div class="stat-card" style="background-color: #e74c3c;">
                <h4>ضعيف</h4>
                <p>${weakCount}</p>
            </div>
        </div>
    `;
}