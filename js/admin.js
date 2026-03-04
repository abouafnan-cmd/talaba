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

// ================= نظام الإشعارات =================
window.showToast = (msg, type = 'success') => {
    let container = document.getElementById('toast-container');
    if(!container) { container = document.createElement('div'); container.id = 'toast-container'; container.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none'; document.body.appendChild(container); }
    const toast = document.createElement('div');
    toast.className = `px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-center transform transition-all duration-300 translate-y-10 opacity-0 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.innerText = msg; container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => { toast.classList.add('translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

// ================= التنقل =================
window.logout = () => { localStorage.clear(); window.location.href = '../index.html'; };
window.showSection = (id) => { document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active')); document.getElementById(`section-${id}`).classList.add('section-active'); if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('hidden'); };
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => { document.getElementById(id).classList.add('hidden'); const form = document.querySelector(`#${id} form`); if(form) { form.reset(); const hiddenId = form.querySelector('input[type="hidden"]'); if(hiddenId) hiddenId.value = ''; } };

// ================= إصلاح دالة الحذف =================
window.deleteRecord = async (collectionName, id, type) => {
    if(confirm('هل أنت متأكد من الحذف نهائياً؟')) {
        try { 
            await deleteDoc(doc(db, collectionName, id)); 
            window.showToast('تم الحذف بنجاح'); 
            // تحديث الجدول المناسب بعد الحذف
            if(type === 'users') loadUsers();
            if(type === 'cohorts') loadCohorts();
            if(type === 'subjects') loadSubjects();
            if(type === 'announcements') loadAnnouncements();
            if(type === 'assignments') loadAdminAssignments();
            if(type === 'quizzes') loadAdminQuizzes();
        } 
        catch(e) { window.showToast('حدث خطأ أثناء الحذف', 'error'); console.error(e); }
    }
};

// ================= 1. إدارة المستخدمين (تم الإرجاع والإصلاح) =================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody'); const snap = await getDocs(query(collection(db, "users"), orderBy("timestamp", "desc"))); tbody.innerHTML = '';
    snap.forEach(d => { 
        const u = d.data(); 
        let wa = u.phone ? (u.phone.startsWith('0') ? "212"+u.phone.substring(1) : u.phone) : "";
        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4 font-semibold">${u.name}</td>
                <td class="p-4">${u.role==='طالب'?'<span class="text-blue-600 bg-blue-100 px-2 py-1 rounded">طالب</span>':'<span class="text-green-600 bg-green-100 px-2 py-1 rounded">أستاذ</span>'}</td>
                <td class="p-4" dir="ltr">${u.phone}</td>
                <td class="p-4 text-red-600 font-bold bg-red-50 text-center" dir="ltr">${u.password || '---'}</td>
                <td class="p-4 text-center space-x-2 space-x-reverse">
                    <a href="https://wa.me/${wa}" target="_blank" class="px-2 py-1 bg-green-500 text-white rounded text-xs shadow">واتساب</a>
                    <button onclick="window.editUser('${d.id}', '${u.name}', '${u.phone}', '${u.password}', '${u.role}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs shadow">تعديل</button>
                    <button onclick="window.deleteRecord('users', '${d.id}', 'users')" class="px-2 py-1 bg-red-500 text-white rounded text-xs shadow">حذف</button>
                </td>
            </tr>`; 
    });
    updateSelectDropdowns();
}

window.editUser = (id, name, phone, pass, role) => {
    document.getElementById('editUserId').value = id; document.getElementById('newName').value = name; document.getElementById('newPhone').value = phone; document.getElementById('newPassword').value = pass; document.getElementById('newRole').value = role; document.getElementById('userModalTitle').innerText = "تعديل مستخدم"; window.openModal('addUserModal');
};

document.getElementById('addUserForm').addEventListener('submit', async (e) => { e.preventDefault(); const id = document.getElementById('editUserId').value; const data = { name: document.getElementById('newName').value, phone: document.getElementById('newPhone').value, password: document.getElementById('newPassword').value, role: document.getElementById('newRole').value }; if(id) { await updateDoc(doc(db, "users", id), data); window.showToast('تم التعديل'); } else { await addDoc(collection(db, "users"), { ...data, timestamp: new Date() }); window.showToast('تمت الإضافة'); } window.closeModal('addUserModal'); loadUsers(); });

// ================= 2. الأفواج =================
async function loadCohorts() { const tbody = document.getElementById('cohortsTableBody'); const snap = await getDocs(query(collection(db, "cohorts"), orderBy("timestamp", "desc"))); tbody.innerHTML = ''; snap.forEach(d => { tbody.innerHTML += `<tr class="border-b"><td class="p-4 font-bold text-blue-900">${d.data().name}</td><td class="p-4 text-center"><button onclick="window.editCohort('${d.id}', '${d.data().name}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs shadow">تعديل</button> <button onclick="window.deleteRecord('cohorts', '${d.id}', 'cohorts')" class="px-2 py-1 bg-red-500 text-white rounded text-xs shadow">حذف</button></td></tr>`; }); updateSelectDropdowns(); }
window.editCohort = (id, name) => { document.getElementById('editCohortId').value = id; document.getElementById('newCohortName').value = name; document.getElementById('cohortModalTitle').innerText = "تعديل فوج"; window.openModal('addCohortModal'); };
document.getElementById('addCohortForm').addEventListener('submit', async (e) => { e.preventDefault(); const id = document.getElementById('editCohortId').value; const data = { name: document.getElementById('newCohortName').value }; if(id) await updateDoc(doc(db, "cohorts", id), data); else await addDoc(collection(db, "cohorts"), { ...data, timestamp: new Date() }); window.closeModal('addCohortModal'); window.showToast('تم الحفظ'); loadCohorts(); });

// ================= 3. المواد =================
async function loadSubjects() { const tbody = document.getElementById('subjectsTableBody'); const snap = await getDocs(query(collection(db, "subjects"), orderBy("timestamp", "desc"))); tbody.innerHTML = ''; snap.forEach(d => { const sub = d.data(); tbody.innerHTML += `<tr class="border-b"><td class="p-4 font-bold">${sub.name}</td><td class="p-4">${sub.teacherName}</td><td class="p-4 text-center"><button onclick="window.editSubject('${d.id}', '${sub.name}', '${sub.info||''}', '${sub.syllabus||''}')" class="px-2 py-1 bg-blue-500 text-white rounded text-xs">تعديل</button> <button onclick="window.deleteRecord('subjects', '${d.id}', 'subjects')" class="px-2 py-1 bg-red-500 text-white rounded text-xs">حذف</button></td></tr>`; }); }
window.editSubject = (id, name, info, syllabus) => { document.getElementById('editSubjectId').value = id; document.getElementById('newSubjectName').value = name; document.getElementById('subjectInfo').value = info; document.getElementById('subjectSyllabus').value = syllabus; document.getElementById('subjectModalTitle').innerText = "تعديل مادة"; window.openModal('addSubjectModal'); };
document.getElementById('addSubjectForm').addEventListener('submit', async (e) => { e.preventDefault(); const id = document.getElementById('editSubjectId').value; const tSel = document.getElementById('selectTeacher'); const cSel = document.getElementById('selectCohort'); const data = { name: document.getElementById('newSubjectName').value, info: document.getElementById('subjectInfo').value, syllabus: document.getElementById('subjectSyllabus').value, teacherId: tSel.value, teacherName: tSel.options[tSel.selectedIndex].text, cohortId: cSel.value, cohortName: cSel.options[cSel.selectedIndex].text }; if(id) await updateDoc(doc(db, "subjects", id), data); else await addDoc(collection(db, "subjects"), { ...data, timestamp: new Date() }); window.closeModal('addSubjectModal'); window.showToast('تم الحفظ'); loadSubjects(); });

async function updateSelectDropdowns() { const tSel = document.getElementById('selectTeacher'); const cSel = document.getElementById('selectCohort'); const tSnap = await getDocs(query(collection(db, "users"), where("role", "==", "أستاذ"))); tSel.innerHTML = ''; tSnap.forEach(d => tSel.innerHTML += `<option value="${d.id}">${d.data().name}</option>`); const cSnap = await getDocs(collection(db, "cohorts")); cSel.innerHTML = ''; cSnap.forEach(d => cSel.innerHTML += `<option value="${d.id}">${d.data().name}</option>`); }

// ================= 4. الإخبارات =================
document.getElementById('addAnnouncementForm').addEventListener('submit', async (e) => { e.preventDefault(); await addDoc(collection(db, "announcements"), { type: document.getElementById('annType').value, targetMode: 'all', content: document.getElementById('annContent').value, timestamp: new Date() }); window.closeModal('addAnnouncementModal'); window.showToast('تم النشر'); loadAnnouncements(); });
async function loadAnnouncements() { const list = document.getElementById('announcementsList'); const snap = await getDocs(query(collection(db, "announcements"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const ann = d.data(); list.innerHTML += `<div class="bg-white p-5 rounded-xl border-l-4 shadow-sm relative"><button onclick="window.deleteRecord('announcements', '${d.id}', 'announcements')" class="absolute top-2 left-2 text-red-500 hover:bg-red-50 px-2 rounded font-bold">حذف</button><div class="mb-2 font-bold">${ann.type}</div><p class="text-sm">${ann.content}</p></div>`; }); }

// ================= الغياب والمتغيبين =================
async function loadAdminAttendance() {
    const tbody = document.getElementById('adminAttendanceBody'); const snap = await getDocs(query(collection(db, "attendance"), orderBy("timestamp", "desc"))); tbody.innerHTML = '';
    snap.forEach(d => {
        const data = d.data(); const absents = data.records.filter(r => r.status === 'غائب');
        // هنا نجلب الأسماء ونقوم بتشفيرها بأمان لنقلها عبر الزر
        const encodedNames = encodeURIComponent(JSON.stringify(absents.map(a => a.studentName || 'طالب (سجل قديم)'))); 
        tbody.innerHTML += `<tr class="border-b"><td class="p-4 font-bold border-b">${data.date}</td><td class="p-4 border-b">${data.teacherName}</td><td class="p-4 border-b">${data.subjectName}</td><td class="p-4 border-b"><button onclick="window.showAbsents('${encodedNames}')" class="text-red-600 font-bold underline cursor-pointer hover:bg-red-50 px-2 py-1 rounded">غياب: ${absents.length}</button></td></tr>`;
    });
}
window.showAbsents = (namesJSON) => {
    const names = JSON.parse(decodeURIComponent(namesJSON)); const list = document.getElementById('absentList');
    list.innerHTML = names.length ? names.map(n => `<li>${n}</li>`).join('') : '<li class="text-green-600">الجميع حاضرون</li>';
    window.openModal('absentModal');
};
window.downloadPDF = () => {
    const element = document.getElementById('pdfContainer');
    document.getElementById('pdfTitle').classList.remove('hidden'); 
    html2pdf().from(element).set({ margin: 10, filename: 'تقرير_الغياب.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } }).save().then(() => {
        document.getElementById('pdfTitle').classList.add('hidden'); 
        window.showToast('تم تحميل التقرير!');
    });
};

// ================= دفتر النصوص للآدمن =================
async function loadAdminJournals() { const list = document.getElementById('adminJournalsList'); const snap = await getDocs(query(collection(db, "journals"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const j = d.data(); list.innerHTML += `<div class="bg-white p-5 rounded-xl border-r-4 border-orange-500 shadow-sm"><span class="bg-orange-100 px-3 py-1 rounded font-bold">${j.date}</span> <span class="font-semibold ml-4">👨‍🏫 ${j.teacherName} | 📚 ${j.subjectName}</span><p class="mt-2 text-gray-800 bg-gray-50 p-3 rounded">${j.content}</p></div>`; }); }

// ================= صلاحيات المدير: تكليفات واختبارات =================
async function loadAdminAssignments() {
    const tbody = document.getElementById('adminAssignmentsBody'); const snap = await getDocs(query(collection(db, "assignments"), orderBy("timestamp", "desc"))); tbody.innerHTML = '';
    snap.forEach(d => { const data = d.data(); tbody.innerHTML += `<tr class="border-b"><td class="p-4">${data.subjectName}</td><td class="p-4 font-bold">${data.title}</td><td class="p-4 text-center"><button onclick="window.deleteRecord('assignments', '${d.id}', 'assignments')" class="bg-red-500 text-white px-3 py-1 rounded">حذف</button></td></tr>`; });
}
async function loadAdminQuizzes() {
    const tbody = document.getElementById('adminQuizzesBody'); const snap = await getDocs(query(collection(db, "quizzes"), orderBy("timestamp", "desc"))); tbody.innerHTML = '';
    snap.forEach(d => { const data = d.data(); tbody.innerHTML += `<tr class="border-b"><td class="p-4">${data.subjectName}</td><td class="p-4 font-bold">${data.title}</td><td class="p-4 text-center space-x-2 space-x-reverse"><button onclick="window.viewQuizResults('${d.id}', '${data.title.replace(/'/g, "\\'")}')" class="bg-purple-500 text-white px-3 py-1 rounded">النتائج</button><button onclick="window.deleteRecord('quizzes', '${d.id}', 'quizzes')" class="bg-red-500 text-white px-3 py-1 rounded">حذف</button></td></tr>`; });
}
window.viewQuizResults = async (quizId, quizTitle) => {
    document.getElementById('resultsModalTitle').innerText = 'نتائج: ' + quizTitle; const tbody = document.getElementById('quizResultsBody'); tbody.innerHTML = '<tr><td colspan="3" class="text-center">جاري الجلب...</td></tr>'; window.openModal('quizResultsModal');
    try { const snap = await getDocs(query(collection(db, "quiz_results"), where("quizId", "==", quizId))); tbody.innerHTML = ''; if(snap.empty) return tbody.innerHTML = '<tr><td colspan="3" class="text-center">لا توجد نتائج</td></tr>'; snap.forEach(doc => { const res = doc.data(); const dateStr = res.timestamp ? res.timestamp.toDate().toLocaleString('ar-MA') : ''; tbody.innerHTML += `<tr class="border-b"><td class="p-3 font-bold">${res.studentName}</td><td class="p-3 text-purple-700 font-bold" dir="ltr">${res.score}/${res.maxScore}</td><td class="p-3 text-sm">${dateStr}</td></tr>`; }); } catch(err) { tbody.innerHTML = '<tr><td colspan="3" class="text-red-500">حدث خطأ</td></tr>'; }
};

// التشغيل المتسلسل
loadUsers(); loadCohorts(); loadSubjects(); loadAnnouncements(); loadAdminAttendance(); loadAdminJournals(); loadAdminAssignments(); loadAdminQuizzes();