import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
window.alert = window.showToast; 

const userName = localStorage.getItem('userName') || "الطالب"; const userId = localStorage.getItem('userId');
if(!userId) { window.location.href = '../index.html'; }
if(userName) { if(document.getElementById('studentNameDisplay')) document.getElementById('studentNameDisplay').innerText = `الطالب: ${userName}`; }

window.logout = () => { localStorage.clear(); window.location.href = '../index.html'; };
window.showSection = (id) => { document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active')); const target = document.getElementById(`section-${id}`); if(target) target.classList.add('section-active'); if(window.innerWidth < 768) { const sidebar = document.getElementById('sidebar'); if(sidebar) sidebar.classList.add('hidden'); } };
window.openModal = (id) => { const m = document.getElementById(id); if(m) m.classList.remove('hidden'); };
window.closeModal = (id) => { const m = document.getElementById(id); if(m) m.classList.add('hidden'); };

async function loadAnnouncements() {
    const list = document.getElementById('announcementsList'); if(!list) return;
    try { const q1 = query(collection(db, "announcements"), where("targetMode", "in", ["all", "students"])); const snap = await getDocs(q1); list.innerHTML = ''; snap.forEach(d => { const ann = d.data(); list.innerHTML += `<div class="bg-white p-5 rounded-xl border-l-4 shadow-sm"><h3 class="font-bold text-gray-800 mb-2">${ann.type}</h3><p class="text-sm">${ann.content}</p></div>`; }); } catch(e) {}
}

async function loadDocuments() {
    const list = document.getElementById('documentsList'); if(!list) return;
    try { const snap = await getDocs(query(collection(db, "documents"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const doc = d.data(); list.innerHTML += `<div class="bg-white p-5 rounded-xl border-r-4 shadow-sm"><div><h3 class="font-bold">📁 ${doc.subjectName}: ${doc.title}</h3><p class="text-sm text-gray-500 mb-4">${doc.description}</p></div><a href="${doc.link}" target="_blank" class="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg">تحميل الوثيقة</a></div>`; }); } catch(e) {}
}

async function loadAssignments() {
    const list = document.getElementById('assignmentsList'); if(!list) return;
    try { const snap = await getDocs(query(collection(db, "assignments"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const ass = d.data(); list.innerHTML += `<div class="bg-white p-6 rounded-xl border shadow-md"><h3 class="font-bold">${ass.subjectName}: ${ass.title}</h3><p class="my-4 bg-blue-50 p-4 rounded-lg">${ass.description}</p><textarea id="ans_${d.id}" class="w-full px-4 py-2 rounded-lg border mb-3" rows="2" placeholder="إجابتك..."></textarea><button onclick="window.submitAssignment('${d.id}')" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">إرسال الإنجاز</button></div>`; }); } catch(e) {}
}
window.submitAssignment = async (id) => { const text = document.getElementById(`ans_${id}`).value; if(!text.trim()) return window.showToast('اكتب الإجابة!', 'error'); await addDoc(collection(db, "submissions"), { assignmentId: id, answerText: text, studentId: userId, studentName: userName, timestamp: new Date() }); window.showToast('تم الإرسال بنجاح!'); document.getElementById(`ans_${id}`).value = ''; };

let currentQuizData = null; let currentQuizId = null;
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

async function loadQuizzesList() {
    const list = document.getElementById('quizzesList'); if(!list) return;
    try { const snap = await getDocs(query(collection(db, "quizzes"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const q = d.data(); list.innerHTML += `<div class="bg-white p-6 rounded-xl border-t-4 shadow-md"><div><span class="text-xs bg-purple-100 px-2 py-1 rounded font-bold">${q.subjectName}</span><h3 class="text-xl font-bold mt-2 mb-2">${q.title}</h3></div><button onclick="window.startQuiz('${d.id}')" class="w-full py-2 bg-purple-100 font-bold rounded-lg">🚀 ابدأ الاختبار</button></div>`; }); } catch(e) {}
}

window.startQuiz = async (quizId) => {
    try {
        const docSnap = await getDoc(doc(db, "quizzes", quizId));
        if (docSnap.exists()) {
            currentQuizData = docSnap.data(); currentQuizId = quizId;
            document.getElementById('activeQuizTitle').innerText = currentQuizData.title; document.getElementById('activeQuizInfo').innerText = `النهاية: ${currentQuizData.maxScore}/20`;
            const container = document.getElementById('quizQuestionsContainer'); container.innerHTML = '';
            currentQuizData.questions.forEach((q, index) => {
                let optionsHtml = '';
                if(q.type === 'tf') { optionsHtml = `<label class="block p-3 border rounded-lg cursor-pointer"><input type="radio" name="q_${index}" value="صحيح" class="mr-2"> صحيح</label><label class="block p-3 border rounded-lg cursor-pointer"><input type="radio" name="q_${index}" value="خطأ" class="mr-2"> خطأ</label>`; }
                else { shuffleArray([...q.options]).forEach(opt => { optionsHtml += `<label class="block p-3 border rounded-lg cursor-pointer mb-2"><input type="radio" name="q_${index}" value="${opt}" class="mr-2"> ${opt}</label>`; }); }
                container.innerHTML += `<div class="bg-white p-6 rounded-xl shadow-sm border mb-4"><h3 class="text-lg font-bold mb-4">${index + 1}. ${q.text}</h3>${optionsHtml}</div>`;
            });
            window.openModal('takeQuizModal');
        }
    } catch(e) { console.error(e); }
};

window.closeQuizModal = () => { window.closeModal('takeQuizModal'); currentQuizData = null; currentQuizId = null; };

window.submitQuiz = async () => {
    if(!currentQuizData || !userId) return; let score = 0; let answeredCount = 0;
    currentQuizData.questions.forEach((q, index) => { const selected = document.querySelector(`input[name="q_${index}"]:checked`); if(selected) { answeredCount++; if(selected.value === q.correctAnswer) score += q.points; } });
    if(answeredCount < currentQuizData.totalQuestions) { if(!confirm('لم تجب عن كل الأسئلة! متأكد من التسليم؟')) return; }

    window.closeQuizModal(); document.getElementById('resultEmoji').innerText = score >= (currentQuizData.maxScore / 2) ? '🎉' : '💪'; document.getElementById('studentScore').innerText = score; document.getElementById('totalScore').innerText = currentQuizData.maxScore; window.openModal('resultModal');

    try {
        await addDoc(collection(db, "quiz_results"), { quizId: currentQuizId, quizTitle: currentQuizData.title, subjectName: currentQuizData.subjectName, teacherName: currentQuizData.teacherName, studentId: userId, studentName: userName, score: score, maxScore: currentQuizData.maxScore, timestamp: new Date() });
        window.showToast('تم تسليم الاختبار بنجاح!'); // <--- الإشعار الجميل المطلوب!
    } catch(e) {}
};

window.closeResultModal = () => { window.closeModal('resultModal'); };
loadAnnouncements(); loadDocuments(); loadAssignments(); loadQuizzesList();