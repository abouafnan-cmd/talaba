// متغيرات الملاحظات
let currentClassNotes = '';
let studentsNotes = [];
let notesData = {};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات المحفوظة
    notesData = loadSavedData('notes') || {};
    
    // إضافة المستمعين للأحداث
    document.getElementById('classSelectNotes').addEventListener('change', loadStudentsForNotes);
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
});

// دالة لتحميل قائمة الطلبة للملاحظات
async function loadStudentsForNotes() {
    currentClassNotes = document.getElementById('classSelectNotes').value;
    
    if (!currentClassNotes) {
        document.getElementById('studentSelectNotes').innerHTML = '<option value="">-- اختر الطالب --</option>';
        return;
    }
    
    try {
        studentsNotes = await loadClassData(currentClassNotes);
        populateStudentSelect();
        displayNotesList();
        document.getElementById('notesListContainer').style.display = 'block';
    } catch (error) {
        showMessage('حدث خطأ في تحميل بيانات الطلبة', 'error');
    }
}

// دالة لملء قائمة الطلبة
function populateStudentSelect() {
    const studentSelect = document.getElementById('studentSelectNotes');
    studentSelect.innerHTML = '<option value="">-- اختر الطالب --</option>';
    
    studentsNotes.forEach(student => {
        const option = document.createElement('option');
        option.value = student.fullName;
        option.textContent = student.fullName;
        studentSelect.appendChild(option);
    });
}

// دالة لإضافة ملاحظة جديدة
function addNote() {
    const studentName = document.getElementById('studentSelectNotes').value;
    const noteContent = document.getElementById('noteContent').value.trim();
    
    if (!studentName) {
        showMessage('يرجى اختيار الطالب أولاً', 'error');
        return;
    }
    
    if (!noteContent) {
        showMessage('يرجى كتابة الملاحظة أولاً', 'error');
        return;
    }
    
    if (!notesData[currentClassNotes]) {
        notesData[currentClassNotes] = {};
    }
    
    if (!notesData[currentClassNotes][studentName]) {
        notesData[currentClassNotes][studentName] = [];
    }
    
    // إضافة الملاحظة الجديدة
    const newNote = {
        id: Date.now(),
        content: noteContent,
        date: new Date().toLocaleString('ar-EG'),
        timestamp: new Date().toISOString()
    };
    
    notesData[currentClassNotes][studentName].unshift(newNote);
    
    // حفظ البيانات
    saveData('notes', notesData);
    
    // تحديث العرض
    displayNotesList();
    
    // مسح الحقول
    document.getElementById('noteContent').value = '';
    
    showMessage('تم إضافة الملاحظة بنجاح', 'success');
}

// دالة لعرض قائمة الملاحظات
function displayNotesList() {
    const notesList = document.getElementById('notesList');
    
    if (!currentClassNotes || !notesData[currentClassNotes]) {
        notesList.innerHTML = '<p>لا توجد ملاحظات مسجلة لهذا القسم</p>';
        return;
    }
    
    const classNotes = notesData[currentClassNotes];
    let hasNotes = false;
    let notesHTML = '';
    
    Object.keys(classNotes).forEach(studentName => {
        const studentNotes = classNotes[studentName];
        if (studentNotes.length > 0) {
            hasNotes = true;
            notesHTML += `
                <div class="student-notes-section">
                    <h3 style="color: var(--secondary-color); border-bottom: 2px solid var(--primary-color); padding-bottom: 5px;">
                        ${studentName}
                    </h3>
            `;
            
            studentNotes.forEach(note => {
                notesHTML += `
                    <div class="note-item">
                        <div class="note-header">
                            <strong>${note.date}</strong>
                            <button class="btn-danger delete-note-btn" data-student="${studentName}" data-id="${note.id}"
                                    style="padding: 3px 8px; font-size: 0.7rem;">حذف</button>
                        </div>
                        <p>${note.content}</p>
                    </div>
                `;
            });
            
            notesHTML += `</div>`;
        }
    });
    
    if (!hasNotes) {
        notesHTML = '<p>لا توجد ملاحظات مسجلة لهذا القسم</p>';
    }
    
    notesList.innerHTML = notesHTML;
    
    // إضافة مستمعي الأحداث لأزرار الحذف
    document.querySelectorAll('.delete-note-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentName = this.dataset.student;
            const noteId = parseInt(this.dataset.id);
            deleteNote(studentName, noteId);
        });
    });
}

// دالة لحذف ملاحظة
function deleteNote(studentName, noteId) {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        return;
    }
    
    const studentNotes = notesData[currentClassNotes][studentName];
    const noteIndex = studentNotes.findIndex(note => note.id === noteId);
    
    if (noteIndex !== -1) {
        studentNotes.splice(noteIndex, 1);
        
        // إذا لم يعد هناك ملاحظات للطالب، احذف المدخل
        if (studentNotes.length === 0) {
            delete notesData[currentClassNotes][studentName];
        }
        
        // حفظ البيانات
        saveData('notes', notesData);
        
        // تحديث العرض
        displayNotesList();
        
        showMessage('تم حذف الملاحظة بنجاح', 'success');
    }
}