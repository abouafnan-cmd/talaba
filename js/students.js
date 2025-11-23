// في دالة حفظ الطالب
document.getElementById('student-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const section = document.getElementById('student-section').value;
    const editId = this.getAttribute('data-edit-id');
    
    if (editId) {
        // تعديل الطالب الموجود
        const studentIndex = window.appData.students.findIndex(s => s.id == editId);
        if (studentIndex !== -1) {
            window.appData.students[studentIndex].name = name;
            window.appData.students[studentIndex].section = section;
        }
    } else {
        // إضافة طالب جديد
        const newStudent = {
            id: window.appData.students.length > 0 ? Math.max(...window.appData.students.map(s => s.id)) + 1 : 1,
            name: name,
            section: section
        };
        window.appData.students.push(newStudent);
    }
    
    // تحديث عدد الطلاب في الأقسام
    window.appData.updateSectionCounts();
    
    // تحديث القوائم وحفظ البيانات
    updateStudentsTable();
    window.appData.updateDropdowns();
    window.appData.saveData();
    
    // إغلاق النموذج
    document.getElementById('student-modal').style.display = 'none';
    
    // إظهار رسالة نجاح
    alert(editId ? 'تم تعديل الطالب بنجاح' : 'تم إضافة الطالب بنجاح');
});

// في دالة حذف الطالب
function deleteStudent(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        window.appData.students = window.appData.students.filter(s => s.id !== id);
        
        // تحديث عدد الطلاب في الأقسام
        window.appData.updateSectionCounts();
        
        updateStudentsTable();
        window.appData.saveData();
        alert('تم حذف الطالب بنجاح');
    }
}