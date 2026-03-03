import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
});
const db = getFirestore(app);

window.showSection = (sectionId) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active'));
    document.getElementById(`section-${sectionId}`).classList.add('section-active');
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('hidden'); // إخفاء القائمة في الهاتف بعد الضغط
};
window.openModal = (modalId) => document.getElementById(modalId).classList.remove('hidden');
window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
    const form = document.querySelector(`#${modalId} form`);
    if(form) {
        form.reset();
        const hiddenId = form.querySelector('input[type="hidden"]');
        if(hiddenId) hiddenId.value = ''; // تصفير الـ ID عند الإغلاق
    }
};

// ================= دوال الحذف العامة =================
window.deleteRecord = async (collectionName, id, refreshFunction) => {
    if(confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            refreshFunction();
        } catch(e) { alert('حدث خطأ أثناء الحذف'); console.error(e); }
    }
};

// ================= 1. إدارة المستخدمين =================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    const snapshot = await getDocs(query(collection(db, "users"), orderBy("timestamp", "desc")));
    tbody.innerHTML = '';
    snapshot.forEach(d => {
        const u = d.data();
        let wa = u.phone ? (u.phone.startsWith('0') ? "212"+u.phone.substring(1) : u.phone) : "";
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4 font-semibold">${u.name}</td>
                <td class="p-4">${u.role==='طالب'?'<span class="text-blue-600 bg-blue-100 px-2 py-1 rounded">طالب</span>':'<span class="text-green-600 bg-green-100 px-2 py-1 rounded">أستاذ</span>'}</td>
                <td class="p-4" dir="ltr">${u.phone}</td>
                <td class="p-4 text-red-600 font-bold bg-red-50 text-center" dir="ltr">${u.password || '---'}</td>
                <td class="p-4 text-center space-x-2 space-x-reverse">
                    <a href="https://wa.me/${wa}" target="_blank" class="px-2 py-1 bg-green-500 text-white rounded text-xs">واتساب</a>
                    <button onclick="window.editUser('${d.id}', '${u.name}', '${u.phone}', '${u.password}', '${u.role}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs">تعديل</button>
                    <button onclick="window.deleteRecord('users', '${d.id}', loadUsers)" class="px-2 py-1 bg-red-500 text-white rounded text-xs">حذف</button>
                </td>
            </tr>`;
    });
    updateSelectDropdowns();
}

window.editUser = (id, name, phone, pass, role) => {
    document.getElementById('editUserId').value = id;
    document.getElementById('newName').value = name;
    document.getElementById('newPhone').value = phone;
    document.getElementById('newPassword').value = pass;
    document.getElementById('newRole').value = role;
    document.getElementById('userModalTitle').innerText = "تعديل مستخدم";
    window.openModal('addUserModal');
};

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const id = document.getElementById('editUserId').value;
    const data = { name: document.getElementById('newName').value, phone: document.getElementById('newPhone').value, password: document.getElementById('newPassword').value, role: document.getElementById('newRole').value };
    if(id) await updateDoc(doc(db, "users", id), data);
    else await addDoc(collection(db, "users"), { ...data, timestamp: new Date() });
    window.closeModal('addUserModal'); loadUsers();
});

// ================= 2. إدارة الأفواج =================
async function loadCohorts() {
    const tbody = document.getElementById('cohortsTableBody');
    const snap = await getDocs(query(collection(db, "cohorts"), orderBy("timestamp", "desc")));
    tbody.innerHTML = '';
    snap.forEach(d => {
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4 font-bold text-primary">${d.data().name}</td>
                <td class="p-4 text-center">
                    <button onclick="window.editCohort('${d.id}', '${d.data().name}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs">تعديل</button>
                    <button onclick="window.deleteRecord('cohorts', '${d.id}', loadCohorts)" class="px-2 py-1 bg-red-500 text-white rounded text-xs">حذف</button>
                </td>
            </tr>`;
    });
    updateSelectDropdowns();
}
window.editCohort = (id, name) => { document.getElementById('editCohortId').value = id; document.getElementById('newCohortName').value = name; document.getElementById('cohortModalTitle').innerText = "تعديل فوج"; window.openModal('addCohortModal'); };
document.getElementById('addCohortForm').addEventListener('submit', async (e) => {
    e.preventDefault(); const id = document.getElementById('editCohortId').value; const data = { name: document.getElementById('newCohortName').value };
    if(id) await updateDoc(doc(db, "cohorts", id), data); else await addDoc(collection(db, "cohorts"), { ...data, timestamp: new Date() });
    window.closeModal('addCohortModal'); loadCohorts();
});

// ================= 3. المواد الدراسية =================
async function loadSubjects() {
    const tbody = document.getElementById('subjectsTableBody');
    const snap = await getDocs(query(collection(db, "subjects"), orderBy("timestamp", "desc")));
    tbody.innerHTML = '';
    snap.forEach(d => {
        const sub = d.data();
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4 font-bold">${sub.name}</td><td class="p-4 text-gray-600">${sub.teacherName}</td><td class="p-4">${sub.cohortName}</td>
                <td class="p-4 text-center">
                    <button onclick="window.editSubject('${d.id}', '${sub.name}', '${sub.info||''}', '${sub.syllabus||''}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs">تعديل</button>
                    <button onclick="window.deleteRecord('subjects', '${d.id}', loadSubjects)" class="px-2 py-1 bg-red-500 text-white rounded text-xs">حذف</button>
                </td>
            </tr>`;
    });
}
window.editSubject = (id, name, info, syllabus) => {
    document.getElementById('editSubjectId').value = id; document.getElementById('newSubjectName').value = name; document.getElementById('subjectInfo').value = info; document.getElementById('subjectSyllabus').value = syllabus; document.getElementById('subjectModalTitle').innerText = "تعديل مادة"; window.openModal('addSubjectModal');
};
document.getElementById('addSubjectForm').addEventListener('submit', async (e) => {
    e.preventDefault(); const id = document.getElementById('editSubjectId').value; const tSel = document.getElementById('selectTeacher'); const cSel = document.getElementById('selectCohort');
    const data = { name: document.getElementById('newSubjectName').value, info: document.getElementById('subjectInfo').value, syllabus: document.getElementById('subjectSyllabus').value, teacherId: tSel.value, teacherName: tSel.options[tSel.selectedIndex].text, cohortId: cSel.value, cohortName: cSelect.options[cSel.selectedIndex].text };
    if(id) await updateDoc(doc(db, "subjects", id), data); else await addDoc(collection(db, "subjects"), { ...data, timestamp: new Date() });
    window.closeModal('addSubjectModal'); loadSubjects();
});

async function updateSelectDropdowns() {
    const tSel = document.getElementById('selectTeacher'); const cSel = document.getElementById('selectCohort');
    const tSnap = await getDocs(query(collection(db, "users"), where("role", "==", "أستاذ"))); tSel.innerHTML = ''; tSnap.forEach(d => tSel.innerHTML += `<option value="${d.id}">${d.data().name}</option>`);
    const cSnap = await getDocs(collection(db, "cohorts")); cSel.innerHTML = ''; cSnap.forEach(d => cSel.innerHTML += `<option value="${d.id}">${d.data().name}</option>`);
}

// ================= 4. الإخبارات والمواعيد =================
window.toggleDateInput = () => { document.getElementById('dateContainer').classList.toggle('hidden', document.getElementById('annType').value !== 'موعد'); };
window.toggleTargetList = async () => { /* نفس الكود السابق للتحديد */
    const target = document.getElementById('annTarget').value; const container = document.getElementById('targetListContainer'); const cbList = document.getElementById('targetCheckboxes');
    if (target === 'all') { container.classList.add('hidden'); return; }
    container.classList.remove('hidden'); cbList.innerHTML = '<p class="text-sm">جاري التحميل...</p>';
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", target === 'teachers' ? 'أستاذ' : 'طالب')));
    let html = `<label class="block mb-2 font-bold border-b pb-2"><input type="checkbox" onchange="document.querySelectorAll('.target-cb').forEach(cb => cb.checked = this.checked)" class="mr-2"> تحديد الكل</label><div class="space-y-1">`;
    snap.forEach(d => html += `<label class="block text-sm"><input type="checkbox" value="${d.id}" class="mr-2 target-cb"> ${d.data().name}</label>`);
    cbList.innerHTML = html + '</div>';
};
document.getElementById('addAnnouncementForm').addEventListener('submit', async (e) => {
    e.preventDefault(); const id = document.getElementById('editAnnId').value; const type = document.getElementById('annType').value; const target = document.getElementById('annTarget').value;
    let selectedIds = []; let targetSummary = "الجميع";
    if(target !== 'all') { document.querySelectorAll('.target-cb:checked').forEach(cb => selectedIds.push(cb.value)); if(selectedIds.length === 0) return alert('اختر شخصاً واحداً على الأقل'); targetSummary = target === 'teachers' ? `أساتذة مخصصون (${selectedIds.length})` : `طلبة مخصصون (${selectedIds.length})`; }
    const data = { type, targetMode: target, specificUsers: selectedIds, targetSummary, date: type === 'موعد' ? document.getElementById('annDate').value : null, content: document.getElementById('annContent').value };
    if(id) await updateDoc(doc(db, "announcements", id), data); else await addDoc(collection(db, "announcements"), { ...data, timestamp: new Date() });
    window.closeModal('addAnnouncementModal'); loadAnnouncements();
});
async function loadAnnouncements() {
    const list = document.getElementById('announcementsList'); const snap = await getDocs(query(collection(db, "announcements"), orderBy("timestamp", "desc"))); list.innerHTML = '';
    snap.forEach(d => {
        const ann = d.data();
        list.innerHTML += `
            <div class="bg-white p-5 rounded-xl border-l-4 ${ann.type === 'موعد' ? 'border-red-500' : 'border-yellow-500'} shadow-sm relative">
                <button onclick="window.deleteRecord('announcements', '${d.id}', loadAnnouncements)" class="absolute top-2 left-2 text-red-500 hover:bg-red-50 px-2 rounded">حذف</button>
                <div class="mb-2"><span class="font-bold">${ann.type}</span> <span class="text-xs bg-gray-100 px-2 py-1 rounded">${ann.targetSummary}</span></div>
                <p class="text-sm whitespace-pre-line">${ann.content}</p>
            </div>`;
    });
}

// ================= 5. تتبع الحضور والغياب للآدمن =================
async function loadAdminAttendance() {
    const tbody = document.getElementById('adminAttendanceBody');
    try {
        const snap = await getDocs(query(collection(db, "attendance"), orderBy("timestamp", "desc")));
        tbody.innerHTML = '';
        snap.forEach(d => {
            const data = d.data();
            const absents = data.records.filter(r => r.status === 'غائب').length;
            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 font-bold" dir="ltr">${data.date}</td>
                    <td class="p-4">${data.teacherName || 'أستاذ'}</td>
                    <td class="p-4 text-red-600 font-bold">الغياب: ${absents} طلبة</td>
                </tr>`;
        });
        if(snap.empty) tbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center">لا توجد سجلات غياب بعد</td></tr>';
    } catch(e) { console.error(e); }
}

// ================= 6. دفتر النصوص للآدمن =================
async function loadAdminJournals() {
    const list = document.getElementById('adminJournalsList');
    try {
        const snap = await getDocs(query(collection(db, "journals"), orderBy("timestamp", "desc")));
        list.innerHTML = '';
        snap.forEach(d => {
            const j = d.data();
            list.innerHTML += `
                <div class="bg-white p-5 rounded-xl border-r-4 border-orange-500 shadow-sm">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold">${j.date}</span>
                        <span class="text-gray-600 font-semibold">👨‍🏫 ${j.teacherName} | 📚 ${j.subjectName}</span>
                    </div>
                    <p class="text-gray-800 bg-gray-50 p-3 rounded border border-gray-100">${j.content}</p>
                </div>`;
        });
        if(snap.empty) list.innerHTML = '<p class="text-center text-gray-500">لا توجد إدخالات في دفتر النصوص بعد</p>';
    } catch(e) { console.error(e); }
}

// التشغيل المبدئي
loadUsers(); loadCohorts(); loadSubjects(); loadAnnouncements(); loadAdminAttendance(); loadAdminJournals();