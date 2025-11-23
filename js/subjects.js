// إدارة المواد والأقسام
function initSubjectsManagement() {
    // فتح نموذج إضافة مادة
    document.getElementById('add-subject-btn').addEventListener('click', function() {
        document.getElementById('subject-modal-title').textContent = 'إضافة مادة';
        document.getElementById('subject-form').reset();
        document.getElementById('subject-form').removeAttribute('data-edit-id');
        document.getElementById('subject-modal').style.display = 'flex';
    });

    // فتح نموذج إضافة قسم
    document.getElementById('add-section-btn').addEventListener('click', function() {
        document.getElementById('section-modal-title').textContent = 'إضافة قسم';
        document.getElementById('section-form').reset();
        document.getElementById('section-form').removeAttribute('data-edit-id');
        document.getElementById('section-modal').style.display = 'flex';
    });

    // حفظ بيانات المادة
    document.getElementById('subject-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('subject-name').value;
        const section = document.getElementById('subject-section').value;
        const editId = this.getAttribute('data-edit-id');
        
        if (editId) {
            // تعديل المادة الموجودة
            const subjectIndex = window.appData.subjects.findIndex(s => s.id == editId);
            if (subjectIndex !== -1) {
                window.appData.subjects[subjectIndex].name = name;
                window.appData.subjects[subjectIndex].section = section;
            }
        } else {
            // إضافة مادة جديدة
            const newSubject = {
                id: window.appData.subjects.length > 0 ? Math.max(...window.appData.subjects.map(s => s.id)) + 1 : 1,
                name: name,
                section: section
            };
            window.appData.subjects.push(newSubject);
        }
        
        // تحديث القوائم وحفظ البيانات
        updateSubjectsTable();
        window.appData.updateDropdowns();
        window.appData.saveData();
        
        // إغلاق النموذج
        document.getElementById('subject-modal').style.display = 'none';
        
        // إظهار رسالة نجاح
        alert(editId ? 'تم تعديل المادة بنجاح' : 'تم إضافة المادة بنجاح');
    });

    // حفظ بيانات القسم
    document.getElementById('section-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('section-name').value;
        const editId = this.getAttribute('data-edit-id');
        
        if (editId) {
            // تعديل القسم الموجود
            const sectionIndex = window.appData.sections.findIndex(s => s.id == editId);
            if (sectionIndex !== -1) {
                window.appData.sections[sectionIndex].name = name;
            }
        } else {
            // إضافة قسم جديد
            const newSection = {
                id: 'section' + (window.appData.sections.length + 1),
                name: name,
                studentCount: 0
            };
            window.appData.sections.push(newSection);
        }
        
        // تحديث القوائم وحفظ البيانات
        updateSectionsTable();
        window.appData.updateDropdowns();
        window.appData.saveData();
        
        // إغلاق النموذج
        document.getElementById('section-modal').style.display = 'none';
        
        // إظهار رسالة نجاح
        alert(editId ? 'تم تعديل القسم بنجاح' : 'تم إضافة القسم بنجاح');
    });
}

// تحديث جدول المواد
function updateSubjectsTable() {
    const tbody = document.getElementById('subjects-table-body');
    tbody.innerHTML = '';
    
    window.appData.subjects.forEach(subject => {
        const sectionName = window.appData.sections.find(s => s.id === subject.section)?.name || 'غير معروف';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${subject.name}</td>
            <td>${sectionName}</td>
            <td>
                <button class="btn btn-warning edit-subject" data-id="${subject.id}"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn btn-danger delete-subject" data-id="${subject.id}"><i class="fas fa-trash"></i> حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // إضافة مستمعي الأحداث لأزرار التعديل والحذف
    document.querySelectorAll('.edit-subject').forEach(button => {
        button.addEventListener('click', function() {
            const subjectId = parseInt(this.getAttribute('data-id'));
            editSubject(subjectId);
        });
    });
    
    document.querySelectorAll('.delete-subject').forEach(button => {
        button.addEventListener('click', function() {
            const subjectId = parseInt(this.getAttribute('data-id'));
            deleteSubject(subjectId);
        });
    });
}

// تحديث جدول الأقسام
function updateSectionsTable() {
    const tbody = document.getElementById('sections-table-body');
    tbody.innerHTML = '';
    
    window.appData.sections.forEach(section => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${section.name}</td>
            <td>${section.studentCount}</td>
            <td>
                <button class="btn btn-warning edit-section" data-id="${section.id}"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn btn-danger delete-section" data-id="${section.id}"><i class="fas fa-trash"></i> حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // إضافة مستمعي الأحداث لأزرار التعديل والحذف
    document.querySelectorAll('.edit-section').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-id');
            editSection(sectionId);
        });
    });
    
    document.querySelectorAll('.delete-section').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-id');
            deleteSection(sectionId);
        });
    });
}

// تعديل مادة
function editSubject(id) {
    const subject = window.appData.subjects.find(s => s.id === id);
    if (subject) {
        document.getElementById('subject-modal-title').textContent = 'تعديل مادة';
        document.getElementById('subject-name').value = subject.name;
        document.getElementById('subject-section').value = subject.section;
        
        // تخزين معرف المادة في النموذج
        document.getElementById('subject-form').setAttribute('data-edit-id', id);
        
        document.getElementById('subject-modal').style.display = 'flex';
    }
}

// حذف مادة
function deleteSubject(id) {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
        window.appData.subjects = window.appData.subjects.filter(s => s.id !== id);
        updateSubjectsTable();
        window.appData.updateDropdowns();
        window.appData.saveData();
        alert('تم حذف المادة بنجاح');
    }
}

// تعديل قسم
function editSection(id) {
    const section = window.appData.sections.find(s => s.id === id);
    if (section) {
        document.getElementById('section-modal-title').textContent = 'تعديل قسم';
        document.getElementById('section-name').value = section.name;
        
        // تخزين معرف القسم في النموذج
        document.getElementById('section-form').setAttribute('data-edit-id', id);
        
        document.getElementById('section-modal').style.display = 'flex';
    }
}

// حذف قسم
function deleteSection(id) {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الطلاب والمواد المرتبطة به.')) {
        // حذف الطلاب المرتبطين بالقسم
        window.appData.students = window.appData.students.filter(s => s.section !== id);
        
        // حذف المواد المرتبطة بالقسم
        window.appData.subjects = window.appData.subjects.filter(s => s.section !== id);
        
        // حذف القسم
        window.appData.sections = window.appData.sections.filter(s => s.id !== id);
        
        // تحديث جميع الجداول والقوائم
        updateSectionsTable();
        updateSubjectsTable();
        if (typeof updateStudentsTable === 'function') {
            updateStudentsTable();
        }
        window.appData.updateDropdowns();
        window.appData.saveData();
        alert('تم حذف القسم وجميع البيانات المرتبطة به بنجاح');
    }
}

// تهيئة إدارة المواد والأقسام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initSubjectsManagement();
    updateSubjectsTable();
    updateSectionsTable();
});