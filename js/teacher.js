import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
});
const db = getFirestore(app);

window.showToast = (msg, type = 'success') => {
    let container = document.getElementById('toast-container');
    if(!container) { container = document.createElement('div'); container.id = 'toast-container'; container.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none'; document.body.appendChild(container); }
    const toast = document.createElement('div');
    toast.className = `px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-center transform transition-all duration-300 translate-y-10 opacity-0 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.innerText = msg; container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => { toast.classList.add('translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
};

const userName = localStorage.getItem('userName'); const userId = localStorage.getItem('userId');
if(userName) { document.getElementById('teacherNameDisplay').innerText = `ذ. ${userName}`; if(document.getElementById('mobileTeacherName')) document.getElementById('mobileTeacherName').innerText = `ذ. ${userName}`; }

window.logout = () => { localStorage.clear(); window.location.href = '../index.html'; };
window.showSection = (id) => { document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active')); document.getElementById(`section-${id}`).classList.add('section-active'); if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('hidden'); };
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');

document.getElementById('changePassForm').addEventListener('submit', async (e) => {
    e.preventDefault(); if(!userId) return alert('خطأ!');
    try { await updateDoc(doc(db, "users", userId), { password: document.getElementById('newPass').value }); window.showToast('تم تغيير كلمة المرور بنجاح!'); window.closeModal('changePassModal'); document.getElementById('changePassForm').reset(); } catch(err) { window.showToast('خطأ أثناء التحديث', 'error'); }
});

async function loadTeacherSubjects() {
    try { const snap = await getDocs(query(collection(db, "subjects"), where("teacherName", "==", userName))); let optionsHtml = '<option value="">-- اختر المادة --</option>'; snap.forEach(doc => { optionsHtml += `<option value="${doc.data().name}">${doc.data().name}</option>`; }); document.querySelectorAll('.teacher-subjects-dropdown').forEach(select => select.innerHTML = optionsHtml); } catch (e) { console.error("Error:", e); }
}

// ================= الغياب (إصلاح حفظ الاسم) =================
document.getElementById('attendanceDate').valueAsDate = new Date();
async function loadStudents() {
    const tbody = document.getElementById('attendanceTableBody'); const snap = await getDocs(query(collection(db, "users"), where("role", "==", "طالب"))); tbody.innerHTML = ''; 
    snap.forEach(doc => { 
        // أضفنا data-name هنا لكي نستخرجه عند الحفظ
        tbody.innerHTML += `<tr class="border-b student-row" data-id="${doc.id}" data-name="${doc.data().name}"><td class="p-4 font-semibold">${doc.data().name}</td><td class="p-4 text-center"><label class="text-green-600 mx-2"><input type="radio" name="st_${doc.id}" value="حاضر" checked> حاضر</label><label class="text-red-600 mx-2"><input type="radio" name="st_${doc.id}" value="غائب"> غائب</label></td></tr>`; 
    });
}
document.getElementById('saveAttendanceBtn').addEventListener('click', async () => {
    const subj = document.getElementById('attendanceSubject').value; if(!subj) return window.showToast('الرجاء اختيار المادة أولاً', 'error');
    let records = []; 
    document.querySelectorAll('.student-row').forEach(row => { 
        const id = row.getAttribute('data-id');
        const stName = row.getAttribute('data-name'); // سحب الاسم بنجاح
        const status = document.querySelector(`input[name="st_${id}"]:checked`).value;
        records.push({ studentId: id, studentName: stName, status: status }); 
    });
    await addDoc(collection(db, "attendance"), { date: document.getElementById('attendanceDate').value, records, teacherId: userId, teacherName: userName, subjectName: subj, timestamp: new Date() }); 
    window.showToast('تم حفظ الغياب وإرساله للمدير!');
});

// دفتر النصوص والتكليفات
document.getElementById('journalDate').valueAsDate = new Date();
document.getElementById('addJournalForm').addEventListener('submit', async (e) => { e.preventDefault(); await addDoc(collection(db, "journals"), { date: document.getElementById('journalDate').value, subjectName: document.getElementById('journalSubject').value, content: document.getElementById('journalContent').value, teacherId: userId, teacherName: userName, timestamp: new Date() }); window.closeModal('addJournalModal'); loadJournals(); window.showToast('تم التدوين'); });
async function loadJournals() { const list = document.getElementById('journalsList'); const snap = await getDocs(query(collection(db, "journals"), where("teacherName", "==", userName))); let arr = []; snap.forEach(d => arr.push(d.data())); arr.sort((a,b) => b.timestamp - a.timestamp); list.innerHTML = ''; arr.forEach(j => { list.innerHTML += `<div class="bg-white p-5 rounded-xl border-r-4 border-orange-500 shadow-sm"><span class="font-bold text-orange-800">${j.date} | ${j.subjectName}</span><p class="text-gray-700 bg-orange-50 p-3 rounded mt-2">${j.content}</p></div>`; }); }

document.getElementById('addAssignmentForm').addEventListener('submit', async (e) => { e.preventDefault(); await addDoc(collection(db, "assignments"), { subjectName: document.getElementById('assSubject').value, title: document.getElementById('assTitle').value, description: document.getElementById('assDesc').value, maxScore: 20, type: 'text', teacherId: userId, teacherName: userName, timestamp: new Date() }); window.closeModal('addAssignmentModal'); loadAssignments(); window.showToast('تم النشر'); });
async function loadAssignments() { const list = document.getElementById('assignmentsList'); const snap = await getDocs(query(collection(db, "assignments"), where("teacherName", "==", userName))); let arr = []; snap.forEach(d => arr.push(d.data())); arr.sort((a,b) => b.timestamp - a.timestamp); list.innerHTML = ''; arr.forEach(doc => { list.innerHTML += `<div class="bg-white p-6 rounded-xl border border-blue-100"><h3 class="text-xl font-bold text-blue-900">${doc.subjectName}: ${doc.title}</h3><p class="mt-2">${doc.description}</p></div>`; }); }

document.getElementById('addDocumentForm').addEventListener('submit', async (e) => { e.preventDefault(); await addDoc(collection(db, "documents"), { subjectName: document.getElementById('docSubject').value, title: document.getElementById('docTitle').value, description: document.getElementById('docDesc').value, link: document.getElementById('docLink').value, teacherName: userName, timestamp: new Date() }); window.closeModal('addDocumentModal'); loadDocuments(); window.showToast('تم الرفع'); });
async function loadDocuments() { const list = document.getElementById('documentsList'); const snap = await getDocs(query(collection(db, "documents"), where("teacherName", "==", userName))); let arr = []; snap.forEach(d => arr.push(d.data())); arr.sort((a,b) => b.timestamp - a.timestamp); list.innerHTML = ''; arr.forEach(d => { list.innerHTML += `<div class="bg-white p-5 rounded-xl border-r-4 border-teal-500"><div><h3 class="font-bold">📁 ${d.subjectName}: ${d.title}</h3><p class="text-sm text-gray-500 my-2">${d.description}</p></div><a href="${d.link}" target="_blank" class="px-4 py-2 bg-teal-100 text-teal-800 rounded-lg text-sm font-bold">عرض المرفق</a></div>`; }); }

// الاختبارات والنتائج
window.generateQuizForms = () => {
    const count = parseInt(document.getElementById('quizCount').value); const container = document.getElementById('questionsContainer'); const saveBtn = document.getElementById('saveQuizBtn');
    if(count === 0) { container.innerHTML = 'اختر عدد الأسئلة...'; saveBtn.classList.add('hidden'); return; }
    saveBtn.classList.remove('hidden'); container.innerHTML = '';
    for(let i=1; i<=count; i++) { container.innerHTML += `<div class="bg-purple-50 p-4 rounded-xl border mb-4"><div class="flex justify-between mb-3"><h4 class="font-bold">السؤال ${i}</h4><select id="qType_${i}" class="px-3 py-1 rounded border" onchange="window.toggleQType(${i})"><option value="mcq">متعدد</option><option value="tf">صحيح/خطأ</option></select></div><input type="text" id="qText_${i}" class="w-full mb-3 px-3 py-2 rounded" placeholder="نص السؤال..." required><div id="mcqContainer_${i}" class="grid grid-cols-2 gap-2"><input type="text" id="qOpt_${i}_1" class="px-3 py-2 rounded bg-green-50" placeholder="الإجابة الصحيحة" required><input type="text" id="qOpt_${i}_2" class="px-3 py-2 rounded border" placeholder="خيار خاطئ 1" required><input type="text" id="qOpt_${i}_3" class="px-3 py-2 rounded border" placeholder="خيار 2"><input type="text" id="qOpt_${i}_4" class="px-3 py-2 rounded border" placeholder="خيار 3"></div><div id="tfContainer_${i}" class="hidden"><select id="qTfAns_${i}" class="w-full px-3 py-2 rounded border"><option value="صحيح">صحيح</option><option value="خطأ">خطأ</option></select></div></div>`; }
};
window.toggleQType = (i) => { const type = document.getElementById(`qType_${i}`).value; if(type === 'mcq') { document.getElementById(`mcqContainer_${i}`).classList.remove('hidden'); document.getElementById(`tfContainer_${i}`).classList.add('hidden'); } else { document.getElementById(`mcqContainer_${i}`).classList.add('hidden'); document.getElementById(`tfContainer_${i}`).classList.remove('hidden'); document.getElementById(`qOpt_${i}_1`).required = false; document.getElementById(`qOpt_${i}_2`).required = false; } };
window.saveQuiz = async () => {
    const title = document.getElementById('quizTitle').value; const subj = document.getElementById('quizSubject').value; const count = parseInt(document.getElementById('quizCount').value);
    if(!title || !subj) return window.showToast('الرجاء الإكمال', 'error'); let questions = [];
    for(let i=1; i<=count; i++) {
        const qText = document.getElementById(`qText_${i}`).value; const qType = document.getElementById(`qType_${i}`).value; let qData = { text: qText, type: qType, points: 1 };
        if(qType === 'mcq') { const opt1 = document.getElementById(`qOpt_${i}_1`).value; qData.correctAnswer = opt1; qData.options = [opt1, document.getElementById(`qOpt_${i}_2`).value, document.getElementById(`qOpt_${i}_3`).value, document.getElementById(`qOpt_${i}_4`).value].filter(v=>v); } else { qData.correctAnswer = document.getElementById(`qTfAns_${i}`).value; qData.options = ["صحيح", "خطأ"]; }
        questions.push(qData);
    }
    await addDoc(collection(db, "quizzes"), { title: title, subjectName: subj, teacherName: userName, totalQuestions: count, maxScore: count, questions: questions, timestamp: new Date() });
    window.showToast('تم النشر بنجاح!'); window.closeModal('addQuizModal'); loadQuizzes();
};

async function loadQuizzes() {
    const list = document.getElementById('quizzesList'); const snap = await getDocs(query(collection(db, "quizzes"), where("teacherName", "==", userName)));
    let arr = []; snap.forEach(d => arr.push({id: d.id, ...d.data()})); arr.sort((a,b) => b.timestamp - a.timestamp); list.innerHTML = '';
    arr.forEach(q => { list.innerHTML += `<div class="bg-white p-5 rounded-xl border border-purple-200 flex flex-col justify-between"><div><span class="text-xs text-purple-600 font-bold bg-purple-10 px-2 py-1 rounded">${q.subjectName}</span><h3 class="text-xl font-bold mt-2">${q.title}</h3></div><button onclick="window.viewQuizResults('${q.id}', '${q.title.replace(/'/g, "\\'")}')" class="mt-4 w-full bg-purple-100 text-purple-800 font-bold py-2 rounded-lg">📊 عرض النتائج</button></div>`; });
}

window.sendResultToAdmin = () => { window.showToast('تم إرسال واعتماد النتيجة!'); };

window.viewQuizResults = async (quizId, quizTitle) => {
    document.getElementById('resultsModalTitle').innerText = 'نتائج: ' + quizTitle; const tbody = document.getElementById('quizResultsBody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">جاري الجلب...</td></tr>'; window.openModal('quizResultsModal');
    try {
        const snap = await getDocs(query(collection(db, "quiz_results"), where("quizId", "==", quizId))); tbody.innerHTML = '';
        if(snap.empty) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد نتائج بعد.</td></tr>'; return; }
        snap.forEach(doc => { const res = doc.data(); 
            tbody.innerHTML += `<tr class="border-b"><td class="p-3 font-bold">${res.studentName}</td><td class="p-3 font-bold text-purple-700" dir="ltr">${res.score}/${res.maxScore}</td><td class="p-3 text-center"><button onclick="window.sendResultToAdmin()" class="bg-green-500 text-white px-2 py-1 rounded text-xs">إرسال النتيجة</button></td></tr>`; 
        });
    } catch(err) { tbody.innerHTML = '<tr><td colspan="4" class="text-red-500">حدث خطأ</td></tr>'; }
};

loadTeacherSubjects().then(() => { loadStudents(); loadJournals(); loadAssignments(); loadDocuments(); loadQuizzes(); });