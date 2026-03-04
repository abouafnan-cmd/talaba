const userName = localStorage.getItem('userName'); 
if(userName) { 
    const topNav = document.getElementById('topNavWelcome');
    if(topNav) topNav.innerText = `مرحبا بالطالب: ${userName}`; 
}
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
if(userName) { if(document.getElementById('studentNameDisplay')) document.getElementById('studentNameDisplay').innerText = `الطالب: ${userName}`; if(document.getElementById('mobileStudentName')) document.getElementById('mobileStudentName').innerText = `بوابة: ${userName}`; }

window.logout = () => { localStorage.clear(); window.location.href = '../index.html'; };
window.showSection = (id) => { document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active')); const target = document.getElementById(`section-${id}`); if(target) target.classList.add('section-active'); if(window.innerWidth < 768) { const sidebar = document.getElementById('sidebar'); if(sidebar) sidebar.classList.add('hidden'); } };
window.openModal = (id) => { const m = document.getElementById(id); if(m) m.classList.remove('hidden'); };
window.closeModal = (id) => { const m = document.getElementById(id); if(m) m.classList.add('hidden'); };

const passForm = document.getElementById('changePassForm');
if(passForm) { passForm.addEventListener('submit', async (e) => { e.preventDefault(); try { await updateDoc(doc(db, "users", userId), { password: document.getElementById('newPass').value }); window.showToast('تم تغيير كلمة المرور بنجاح!'); window.closeModal('changePassModal'); passForm.reset(); } catch(err) { window.showToast('حدث خطأ', 'error'); } }); }

async function loadAnnouncements() { const list = document.getElementById('announcementsList'); if(!list) return; try { const q1 = query(collection(db, "announcements"), where("targetMode", "in", ["all", "students"])); const snap = await getDocs(q1); list.innerHTML = ''; snap.forEach(d => { const ann = d.data(); list.innerHTML += `<div class="bg-white p-5 rounded-xl border-l-4 shadow-sm"><h3 class="font-bold text-gray-800 mb-2">${ann.type}</h3><p class="text-sm">${ann.content}</p></div>`; }); } catch(e) {} }
async function loadDocuments() { const list = document.getElementById('documentsList'); if(!list) return; try { const snap = await getDocs(query(collection(db, "documents"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const doc = d.data(); list.innerHTML += `<div class="bg-white p-5 rounded-xl border-r-4 shadow-sm"><div><h3 class="font-bold">📁 ${doc.subjectName}: ${doc.title}</h3><p class="text-sm text-gray-500 mb-4">${doc.description}</p></div><a href="${doc.link}" target="_blank" class="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg">تحميل الوثيقة</a></div>`; }); } catch(e) {} }
async function loadAssignments() { const list = document.getElementById('assignmentsList'); if(!list) return; try { const snap = await getDocs(query(collection(db, "assignments"), orderBy("timestamp", "desc"))); list.innerHTML = ''; snap.forEach(d => { const ass = d.data(); list.innerHTML += `<div class="bg-white p-6 rounded-xl border shadow-md"><h3 class="font-bold">${ass.subjectName}: ${ass.title}</h3><p class="my-4 bg-blue-50 p-4 rounded-lg">${ass.description}</p><textarea id="ans_${d.id}" class="w-full px-4 py-2 rounded-lg border mb-3" rows="2" placeholder="إجابتك..."></textarea><button onclick="window.submitAssignment('${d.id}')" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">إرسال الإنجاز</button></div>`; }); } catch(e) {} }
window.submitAssignment = async (id) => { const text = document.getElementById(`ans_${id}`).value; if(!text.trim()) return window.showToast('اكتب الإجابة!', 'error'); await addDoc(collection(db, "submissions"), { assignmentId: id, answerText: text, studentId: userId, studentName: userName, timestamp: new Date() }); window.showToast('تم الإرسال بنجاح!'); document.getElementById(`ans_${id}`).value = ''; };

// ================= الاختبارات الرقمية المصلحة =================
let currentQuizData = null; let currentQuizId = null;
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

// تحميل الاختبارات وتجميد المُنجز منها
async function loadQuizzesList() {
    const list = document.getElementById('quizzesList'); if(!list) return;
    try { 
        // 1. جلب الاختبارات التي اجتازها الطالب مسبقاً
        const myResultsSnap = await getDocs(query(collection(db, "quiz_results"), where("studentId", "==", userId)));
        const takenQuizzes = {};
        myResultsSnap.forEach(d => { takenQuizzes[d.data().quizId] = d.data().score; });

        // 2. عرض جميع الاختبارات
        const snap = await getDocs(query(collection(db, "quizzes"), orderBy("timestamp", "desc"))); 
        list.innerHTML = ''; 
        snap.forEach(d => { 
            const q = d.data(); 
            const isTaken = takenQuizzes.hasOwnProperty(d.id);
            
            let actionBtn = '';
            let cardStyle = '';

            if(isTaken) {
                // تجميد الاختبار
                const myScore = takenQuizzes[d.id];
                cardStyle = 'border-gray-300 opacity-80 bg-gray-50';
                actionBtn = `<button disabled class="w-full py-2 bg-green-100 text-green-800 font-bold rounded-lg cursor-not-allowed">✅ تم تسليم إجابتك (${myScore}/${q.maxScore})</button>`;
            } else {
                cardStyle = 'border-purple-600 shadow-md bg-white';
                actionBtn = `<button onclick="window.startQuiz('${d.id}')" class="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg transition-colors">🚀 ابدأ الاختبار</button>`;
            }

            list.innerHTML += `<div class="p-6 rounded-xl border-t-4 ${cardStyle}"><div><span class="text-xs ${isTaken ? 'bg-gray-200 text-gray-700' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded font-bold">${q.subjectName}</span><h3 class="text-xl font-bold mt-2 mb-2">${q.title}</h3><p class="text-gray-500 text-sm mb-4">أسئلة: ${q.totalQuestions}</p></div>${actionBtn}</div>`; 
        }); 
    } catch(e) { console.error(e); }
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
                if(q.type === 'tf') { optionsHtml = `<label class="block p-3 border rounded-lg cursor-pointer hover:bg-purple-50"><input type="radio" name="q_${index}" value="صحيح" class="mr-2"> صحيح</label><label class="block p-3 border rounded-lg cursor-pointer hover:bg-purple-50"><input type="radio" name="q_${index}" value="خطأ" class="mr-2"> خطأ</label>`; }
                else { shuffleArray([...q.options]).forEach(opt => { optionsHtml += `<label class="block p-3 border rounded-lg cursor-pointer mb-2 hover:bg-purple-50"><input type="radio" name="q_${index}" value="${opt}" class="mr-2"> ${opt}</label>`; }); }
                container.innerHTML += `<div class="bg-white p-6 rounded-xl shadow-sm border mb-4"><h3 class="text-lg font-bold mb-4">${index + 1}. ${q.text}</h3>${optionsHtml}</div>`;
            });
            window.openModal('takeQuizModal');
        }
    } catch(e) { console.error(e); }
};

window.closeQuizModal = () => { window.closeModal('takeQuizModal'); currentQuizData = null; currentQuizId = null; };

window.submitQuiz = async () => {
    if(!currentQuizData || !userId) return; 
    let score = 0; let answeredCount = 0;
    
    currentQuizData.questions.forEach((q, index) => { 
        const selected = document.querySelector(`input[name="q_${index}"]:checked`); 
        if(selected) { answeredCount++; if(selected.value === q.correctAnswer) score += q.points; } 
    });
    if(answeredCount < currentQuizData.totalQuestions) { if(!confirm('لم تجب عن كل الأسئلة! متأكد من التسليم؟')) return; }

    // حفظ البيانات في متغيرات قبل مسحها بإغلاق النافذة
    const savedQuizId = currentQuizId;
    const savedQuizData = currentQuizData;

    window.closeQuizModal(); // الآن إغلاق النافذة آمن ولن يفقدنا البيانات
    document.getElementById('resultEmoji').innerText = score >= (savedQuizData.maxScore / 2) ? '🎉' : '💪'; 
    document.getElementById('studentScore').innerText = score; 
    document.getElementById('totalScore').innerText = savedQuizData.maxScore; 
    window.openModal('resultModal');

    try {
        await addDoc(collection(db, "quiz_results"), { 
            quizId: savedQuizId, 
            quizTitle: savedQuizData.title, 
            subjectName: savedQuizData.subjectName || "غير محدد", 
            teacherName: savedQuizData.teacherName || "غير محدد", 
            studentId: userId, 
            studentName: userName, 
            score: score, 
            maxScore: savedQuizData.maxScore, 
            timestamp: new Date() 
        });
        window.showToast('تم تسليم إجابتك'); // الإشعار المطلوب
        loadQuizzesList(); // تحديث القائمة فوراً لتجميد الاختبار
    } catch(e) { console.error(e); window.showToast('حدث خطأ أثناء التسليم', 'error'); }
};

window.closeResultModal = () => { window.closeModal('resultModal'); };
loadAnnouncements(); loadDocuments(); loadAssignments(); loadQuizzesList();