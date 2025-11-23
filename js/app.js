// البيانات الافتراضية للتطبيق
let students = JSON.parse(localStorage.getItem('students')) || [
    { id: 1, name: "أحمد محمد", section: "section1" },
    { id: 2, name: "فاطمة علي", section: "section1" },
    { id: 3, name: "محمد إبراهيم", section: "section2" },
    { id: 4, name: "سارة خالد", section: "section2" }
];

let subjects = JSON.parse(localStorage.getItem('subjects')) || [
    { id: 1, name: "الرياضيات", section: "section1" },
    { id: 2, name: "العلوم", section: "section1" },
    { id: 3, name: "الرياضيات", section: "section2" },
    { id: 4, name: "العلوم", section: "section2" }
];

let sections = JSON.parse(localStorage.getItem('sections')) || [
    { id: "section1", name: "القسم الأول", studentCount: 2 },
    { id: "section2", name: "القسم الثاني", studentCount: 2 }
];

let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

// حفظ البيانات في localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
}

// وظائف التنقل بين الأقسام
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            // إزالة النشاط من جميع الروابط وإضافته للرابط الحالي
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            // إخفاء جميع المحتويات وإظهار المحتوى الحالي
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// وظائف التنقل بين علامات التبويب الفرعية
function initSubTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const subtabId = this.getAttribute('data-subtab');
            const parent = this.closest('.card');
            
            // إزالة النشاط من جميع علامات التبويب وإضافته للعلامة الحالية
            parent.querySelectorAll('.tab').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            // إخفاء جميع المحتويات الفرعية وإظهار المحتوى الحالي
            parent.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            parent.querySelector(`#${subtabId}-content`).classList.add('active');
        });
    });
}

// إدارة النماذج المنبثقة
function initModals() {
    // إغلاق النماذج المنبثقة
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // إغلاق النماذج عند النقر خارج المحتوى
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// تحديث القوائم المنسدلة
function updateDropdowns() {
    // تحديث قائمة الأقسام في نموذج إضافة الطالب
    const studentSectionSelect = document.getElementById('student-section');
    studentSectionSelect.innerHTML = '<option value="">-- اختر القسم --</option>';
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        studentSectionSelect.appendChild(option);
    });
    
    // تحديث قائمة الأقسام في نموذج إضافة المادة
    const subjectSectionSelect = document.getElementById('subject-section');
    subjectSectionSelect.innerHTML = '<option value="">-- اختر القسم --</option>';
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        subjectSectionSelect.appendChild(option);
    });
    
    // تحديث قائمة الأقسام في تسجيل الحضور
    const sectionSelect = document.getElementById('section-select');
    sectionSelect.innerHTML = '<option value="">-- اختر القسم --</option>';
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        sectionSelect.appendChild(option);
    });
    
    // تحديث قائمة المواد في تسجيل الحضور
    const subjectSelect = document.getElementById('subject-select');
    subjectSelect.innerHTML = '<option value="">-- اختر المادة --</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
    });
    
    // تحديث قائمة المواد في التقارير
    const reportSubjectSelect = document.getElementById('report-subject');
    reportSubjectSelect.innerHTML = '<option value="">-- اختر المادة --</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        reportSubjectSelect.appendChild(option);
    });
}

// تهيئة التطبيق عند التحميل
function initApp() {
    initNavigation();
    initSubTabs();
    initModals();
    updateDropdowns();
    saveData();
}

// تصدير المتغيرات والدوال للاستخدام في الملفات الأخرى
window.appData = {
    students,
    subjects,
    sections,
    attendanceRecords,
    saveData,
    updateDropdowns
};

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);