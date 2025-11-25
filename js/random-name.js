// متغيرات الاختيار العشوائي
let currentClassRandom = '';
let studentsRandom = [];
let selectedNames = [];

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة المستمعين للأحداث
    document.getElementById('loadStudentsRandomBtn').addEventListener('click', loadStudentsForRandom);
    document.getElementById('pickRandomBtn').addEventListener('click', pickRandomName);
    document.getElementById('pickMultipleBtn').addEventListener('click', pickMultipleNames);
    document.getElementById('resetSelectionBtn').addEventListener('click', resetSelection);
});

// دالة لتحميل قائمة الطلبة للاختيار العشوائي
async function loadStudentsForRandom() {
    currentClassRandom = document.getElementById('classSelectRandom').value;
    
    if (!currentClassRandom) {
        showMessage('يرجى اختيار القسم أولاً', 'error');
        return;
    }
    
    try {
        studentsRandom = await loadClassData(currentClassRandom);
        document.getElementById('randomNameContainer').style.display = 'block';
        showMessage(`تم تحميل ${studentsRandom.length} طالب للقسم ${currentClassRandom}`, 'success');
    } catch (error) {
        showMessage('حدث خطأ في تحميل بيانات الطلبة', 'error');
    }
}

// دالة لاختيار اسم عشوائي
function pickRandomName() {
    if (studentsRandom.length === 0) {
        showMessage('يرجى تحميل قائمة الطلبة أولاً', 'error');
        return;
    }
    
    // إنشاء تأثير اختيار عشوائي
    const display = document.getElementById('randomNameDisplay');
    display.style.animation = 'none';
    
    // تأثير التمرير السريع
    let counter = 0;
    const maxIterations = 20;
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * studentsRandom.length);
        display.textContent = studentsRandom[randomIndex].fullName;
        display.style.backgroundColor = getRandomColor();
        
        counter++;
        if (counter >= maxIterations) {
            clearInterval(interval);
            
            // الاختيار النهائي
            const finalIndex = Math.floor(Math.random() * studentsRandom.length);
            const selectedStudent = studentsRandom[finalIndex];
            
            display.textContent = selectedStudent.fullName;
            display.style.backgroundColor = '#3498db';
            display.style.animation = 'pulse 0.5s';
            
            // إضافة الاسم المختار إلى القائمة
            if (!selectedNames.includes(selectedStudent.fullName)) {
                selectedNames.push(selectedStudent.fullName);
                updateSelectedNamesList();
            }
            
            showMessage(`تم اختيار: ${selectedStudent.fullName}`, 'success');
        }
    }, 100);
}

// دالة لاختيار عدة أسماء عشوائية
function pickMultipleNames() {
    if (studentsRandom.length === 0) {
        showMessage('يرجى تحميل قائمة الطلبة أولاً', 'error');
        return;
    }
    
    if (studentsRandom.length < 3) {
        showMessage('لا يوجد عدد كافٍ من الطلبة لاختيار 3 أسماء', 'error');
        return;
    }
    
    const availableStudents = studentsRandom.filter(student => 
        !selectedNames.includes(student.fullName)
    );
    
    if (availableStudents.length < 3) {
        showMessage('لا توجد أسماء كافية غير مكررة', 'error');
        return;
    }
    
    // اختيار 3 أسماء عشوائية غير مكررة
    const newSelections = [];
    while (newSelections.length < 3 && availableStudents.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        const selectedStudent = availableStudents.splice(randomIndex, 1)[0];
        newSelections.push(selectedStudent.fullName);
    }
    
    // عرض الأسماء المختارة
    const display = document.getElementById('randomNameDisplay');
    display.innerHTML = newSelections.map(name => `<div>${name}</div>`).join('');
    display.style.backgroundColor = '#27ae60';
    
    // إضافة الأسماء إلى القائمة
    selectedNames.push(...newSelections);
    updateSelectedNamesList();
    
    showMessage(`تم اختيار ${newSelections.length} أسماء جديدة`, 'success');
}

// دالة لتحديث قائمة الأسماء المختارة
function updateSelectedNamesList() {
    const container = document.getElementById('selectedNamesContainer');
    const listContainer = document.getElementById('selectedNamesList');
    
    if (selectedNames.length === 0) {
        listContainer.style.display = 'none';
        return;
    }
    
    listContainer.style.display = 'block';
    container.innerHTML = '';
    
    selectedNames.forEach((name, index) => {
        const nameItem = document.createElement('div');
        nameItem.className = 'note-item';
        nameItem.innerHTML = `
            <div class="note-header">
                <strong>${index + 1}. ${name}</strong>
                <button class="btn-danger remove-name-btn" data-index="${index}" 
                        style="padding: 5px 10px; font-size: 0.8rem;">حذف</button>
            </div>
        `;
        container.appendChild(nameItem);
    });
    
    // إضافة مستمعي الأحداث لأزرار الحذف
    document.querySelectorAll('.remove-name-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            selectedNames.splice(index, 1);
            updateSelectedNamesList();
        });
    });
}

// دالة لإعادة تعيين الاختيارات
function resetSelection() {
    selectedNames = [];
    updateSelectedNamesList();
    document.getElementById('randomNameDisplay').textContent = 'اضغط على الزر لاختيار اسم عشوائي';
    document.getElementById('randomNameDisplay').style.backgroundColor = '#3498db';
    showMessage('تم إعادة تعيين جميع الاختيارات', 'success');
}

// دالة للحصول على لون عشوائي للتأثير
function getRandomColor() {
    const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c', '#d35400'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// إضافة أنيميشن للنبض
const randomNameStyles = document.createElement('style');
randomNameStyles.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(randomNameStyles);