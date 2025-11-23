// إدارة الطلاب
function initStudentsManagement() {
    // فتح نموذج إضافة طالب
    document.getElementById('add-student-btn').addEventListener('click', function() {
        document.getElementById('student-modal-title').textContent = 'إضافة طالب';
        document.getElementById('student-form').reset();
        document.getElementById('student-form').removeAttribute('data-edit-id');
        document.getElementById('student-modal').style.display = 'flex';
    });

    // حفظ بيانات الطالب
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
            
            // تحديث عدد الطلاب في القسم
            const sectionIndex = window.appData.sections.findIndex(s => s.id === section);
            if (sectionIndex !== -1) {
                window.appData.sections[sectionIndex].studentCount++;
            }
        }
        
        // تحديث القوائم وحفظ البيانات
        updateStudentsTable();
        window.appData.updateDropdowns();
        window.appData.saveData();
        
        // إغلاق النموذج
        document.getElementById('student-modal').style.display = 'none';
        
        // إظهار رسالة نجاح
        alert(editId ? 'تم تعديل الطالب بنجاح' : 'تم إضافة الطالب بنجاح');
    });

    // استيراد الطلاب من ملف
    document.getElementById('import-btn').addEventListener('click', function() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput.files.length) {
            alert('يرجى اختيار ملف أولاً');
            return;
        }
        
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.txt')) {
            importFromTxt(file);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            alert('في التطبيق الحقيقي، سيتم استخدام مكتبة مثل SheetJS لاستيراد ملفات Excel');
            // importFromExcel(file);
        } else {
            alert('نوع الملف غير مدعوم. يرجى استخدام ملف txt أو Excel');
        }
    });
}

// استيراد من ملف نصي
function importFromTxt(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n');
        let importedCount = 0;
        
        lines.forEach(line => {
            line = line.trim();
            if (line) {
                // توقع تنسيق: اسم الطالب, القسم
                const parts = line.split(',');
                if (parts.length >= 1) {
                    const name = parts[0].trim();
                    const section = parts[1] ? parts[1].trim() : 'section1';
                    
                    const newStudent = {
                        id: window.appData.students.length > 0 ? Math.max(...window.appData.students.map(s => s.id)) + 1 : 1,
                        name: name,
                        section: section
                    };
                    window.appData.students.push(newStudent);
                    importedCount++;
                    
                    // تحديث عدد الطلاب في القسم
                    const sectionIndex = window.appData.sections.findIndex(s => s.id === section);
                    if (sectionIndex !== -1) {
                        window.appData.sections[sectionIndex].studentCount++;
                    }
                }
            }
        });
        
        updateStudentsTable();
        window.appData.updateDropdowns();
        window.appData.saveData();
        alert(`تم استيراد ${importedCount} طالب بنجاح`);
    };
    reader.readAsText(file);
}

// تحديث جدول الطلاب
function updateStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';
    
    window.appData.students.forEach(student => {
        const sectionName = window.appData.sections.find(s => s.id === student.section)?.name || 'غير معروف';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${sectionName}</td>
            <td>
                <button class="btn btn-warning edit-student" data-id="${student.id}"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn btn-danger delete-student" data-id="${student.id}"><i class="fas fa-trash"></i> حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.edit-student').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = parseInt(this.getAttribute('data-id'));
            editStudent(studentId);
        });
    });
    
    document.querySelectorAll('.delete-student').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = parseInt(this.getAttribute('data-id'));
            deleteStudent(studentId);
        });
    });
}

// تعديل طالب
function editStudent(id) {
    const student = window.appData.students.find(s => s.id === id);
    if (student) {
        document.getElementById('student-modal-title').textContent = 'تعديل طالب';
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-section').value = student.section;
        
        // تخزين معرف الطالب في النموذج
        document.getElementById('student-form').setAttribute('data-edit-id', id);
        
        document.getElementById('student-modal').style.display = 'flex';
    }
}

// حذف طالب
function deleteStudent(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        const student = window.appData.students.find(s => s.id === id);
        if (student) {
            // تحديث عدد الطلاب في القسم
            const sectionIndex = window.appData.sections.findIndex(s => s.id === student.section);
            if (sectionIndex !== -1 && window.appData.sections[sectionIndex].studentCount > 0) {
                window.appData.sections[sectionIndex].studentCount--;
            }
        }
        
        window.appData.students = window.appData.students.filter(s => s.id !== id);
        updateStudentsTable();
        window.appData.saveData();
        alert('تم حذف الطالب بنجاح');
    }
}

// تهيئة إدارة الطلاب عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initStudentsManagement();
    updateStudentsTable();
});