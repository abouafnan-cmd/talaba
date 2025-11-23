// إدارة الحضور والغياب
function initAttendanceManagement() {
    // تغيير القسم في تسجيل الحضور
    document.getElementById('section-select').addEventListener('change', function() {
        const sectionId = this.value;
        const subjectSelect = document.getElementById('subject-select');
        
        if (sectionId) {
            // تصفية المواد حسب القسم المختار
            const filteredSubjects = window.appData.subjects.filter(s => s.section === sectionId);
            subjectSelect.innerHTML = '<option value="">-- اختر المادة --</option>';
            filteredSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
            });
            
            document.getElementById('students-list').style.display = 'block';
            updateAttendanceTable();
        } else {
            document.getElementById('students-list').style.display = 'none';
        }
    });

    // تغيير المادة في تسجيل الحضور
    document.getElementById('subject-select').addEventListener('change', function() {
        if (this.value) {
            updateAttendanceTable();
        }
    });

    // حفظ الحضور
    document.getElementById('save-attendance').addEventListener('click', function() {
        const sectionId = document.getElementById('section-select').value;
        const subjectId = document.getElementById('subject-select').value;
        const date = new Date().toISOString().split('T')[0];
        
        if (!sectionId || !subjectId) {
            alert('يرجى اختيار القسم والمادة أولاً');
            return;
        }
        
        const sectionStudents = window.appData.students.filter(s => s.section === sectionId);
        const attendanceRows = document.querySelectorAll('#attendance-table-body tr');
        
        const record = {
            id: window.appData.attendanceRecords.length > 0 ? Math.max(...window.appData.attendanceRecords.map(r => r.id)) + 1 : 1,
            date: date,
            section: sectionId,
            subject: subjectId,
            attendance: []
        };
        
        attendanceRows.forEach((row, index) => {
            const student = sectionStudents[index];
            const status = row.querySelector('.attendance-status').value;
            const notes = row.querySelector('.attendance-notes').value;
            
            record.attendance.push({
                studentId: student.id,
                status: status,
                notes: notes
            });
        });
        
        window.appData.attendanceRecords.push(record);
        window.appData.saveData();
        alert('تم حفظ الحضور بنجاح');
        
        // إذا كانت دالة updateReports موجودة، قم بتحديث التقارير
        if (typeof updateReports === 'function') {
            updateReports();
        }
    });

    // تصدير إلى PDF
    document.getElementById('export-pdf').addEventListener('click', function() {
        exportToPDF();
    });
}

// تحديث جدول الحضور
function updateAttendanceTable() {
    const sectionId = document.getElementById('section-select').value;
    const subjectId = document.getElementById('subject-select').value;
    
    if (!sectionId || !subjectId) return;
    
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';
    
    const sectionStudents = window.appData.students.filter(s => s.section === sectionId);
    
    sectionStudents.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.name}</td>
            <td>
                <select class="attendance-status">
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                </select>
            </td>
            <td>
                <input type="text" class="attendance-notes" placeholder="أضف ملاحظة (اختياري)">
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('export-pdf').style.display = 'inline-flex';
}

// تصدير إلى PDF
function exportToPDF() {
    const sectionId = document.getElementById('section-select').value;
    const subjectId = document.getElementById('subject-select').value;
    
    if (!sectionId || !subjectId) {
        alert('يرجى اختيار القسم والمادة أولاً');
        return;
    }
    
    const section = window.appData.sections.find(s => s.id === sectionId);
    const subject = window.appData.subjects.find(s => s.id == subjectId);
    const date = new Date().toLocaleDateString('ar-EG');
    
    // في التطبيق الحقيقي، سيتم استخدام مكتبة مثل jsPDF
    // هذا مجرد محاكاة للوظيفة
    let pdfContent = `
        تقرير الحضور والغياب
        التاريخ: ${date}
        القسم: ${section ? section.name : 'غير معروف'}
        المادة: ${subject ? subject.name : 'غير معروف'}
        
        قائمة الطلاب:
    `;
    
    const attendanceRows = document.querySelectorAll('#attendance-table-body tr');
    attendanceRows.forEach((row, index) => {
        const studentName = row.cells[0].textContent;
        const status = row.querySelector('.attendance-status').value;
        const notes = row.querySelector('.attendance-notes').value;
        
        pdfContent += `\n${index + 1}. ${studentName} - ${status === 'present' ? 'حاضر' : 'غائب'}`;
        if (notes) {
            pdfContent += ` - ملاحظة: ${notes}`;
        }
    });
    
    // في التطبيق الحقيقي، هنا سيتم إنشاء ملف PDF فعلي
    alert('في التطبيق الحقيقي، سيتم إنشاء ملف PDF وتنزيله.\n\nمحاكاة المحتوى:\n' + pdfContent);
    
    // محاكاة مشاركة على الواتساب (سيتم فتح نافذة جديدة)
    const shareText = encodeURIComponent(`تقرير الحضور - ${subject ? subject.name : ''} - ${date}\n\n${pdfContent}`);
    const whatsappUrl = `https://wa.me/?text=${shareText}`;
    
    if (confirm('هل تريد مشاركة التقرير على الواتساب؟')) {
        window.open(whatsappUrl, '_blank');
    }
}

// تهيئة إدارة الحضور عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initAttendanceManagement);