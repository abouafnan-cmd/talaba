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
    console.log('تم حفظ البيانات بنجاح');
}

// تحديث عدد الطلاب في الأقسام
function updateSectionCounts() {
    sections.forEach(section => {
        section.studentCount = students.filter(student => student.section === section.id).length;
    });
    saveData();
}

// تصدير المتغيرات والدوال للاستخدام في الملفات الأخرى
window.appData = {
    students,
    subjects,
    sections,
    attendanceRecords,
    saveData,
    updateDropdowns,
    updateSectionCounts
};