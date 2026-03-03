import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
});
const db = getFirestore(app);

// إدارة التنقل
window.showSection = (id) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active'));
    document.getElementById(`section-${id}`).classList.add('section-active');
};

// ================= 1. الإخبارات والمواعيد =================
async function loadAnnouncements() {
    const list = document.getElementById('announcementsList');
    try {
        // نجلب الإعلانات الموجهة للجميع أو للطلبة
        const q1 = query(collection(db, "announcements"), where("targetMode", "in", ["all", "students"]));
        const snapshot = await getDocs(q1);
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const ann = doc.data();
            const icon = ann.type === 'موعد' ? '🗓️' : '📢';
            const dateStr = ann.type === 'موعد' ? `<p class="text-red-600 font-bold text-sm mb-2">تاريخ الموعد: ${ann.date.replace('T', ' ')}</p>` : '';
            list.innerHTML += `
                <div class="bg-white p-5 rounded-xl border-l-4 ${ann.type === 'موعد' ? 'border-red-500' : 'border-yellow-500'} shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-2">${icon} ${ann.type}</h3>
                    ${dateStr}
                    <p class="text-gray-700 whitespace-pre-line text-sm">${ann.content}</p>
                </div>`;
        });
        if(snapshot.empty) list.innerHTML = '<p class="text-gray-500">لا توجد إخبارات حالياً.</p>';
    } catch(e) { console.error(e); }
}

// ================= 2. الوثائق والجذاذات =================
async function loadDocuments() {
    const list = document.getElementById('documentsList');
    try {
        const snapshot = await getDocs(query(collection(db, "documents"), orderBy("timestamp", "desc")));
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            list.innerHTML += `
                <div class="bg-white p-5 rounded-xl border-r-4 border-orange-500 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">📁 ${d.title}</h3>
                        <p class="text-sm text-gray-500 mb-4">${d.description}</p>
                    </div>
                    <a href="${d.link}" target="_blank" class="text-center px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200">تحميل / عرض الوثيقة</a>
                </div>`;
        });
        if(snapshot.empty) list.innerHTML = '<p class="text-gray-500">لا توجد وثائق مرفوعة بعد.</p>';
    } catch(e) { console.error(e); }
}

// ================= 3. التكليفات العادية =================
async function loadAssignments() {
    const list = document.getElementById('assignmentsList');
    try {
        const snapshot = await getDocs(query(collection(db, "assignments"), orderBy("timestamp", "desc")));
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const ass = doc.data();
            list.innerHTML += `
                <div class="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
                    <div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold text-blue-900">${ass.title}</h3><span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">على 20</span></div>
                    <p class="text-gray-700 mb-4 bg-blue-50 p-4 rounded-lg">${ass.description}</p>
                    <textarea id="ans_${doc.id}" class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 mb-3" rows="3" placeholder="اكتب إجابتك هنا..."></textarea>
                    <button onclick="window.submitAssignment('${doc.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow">إرسال الإنجاز</button>
                </div>`;
        });
    } catch(e) { console.error(e); }
}

window.submitAssignment = async (id) => {
    const text = document.getElementById(`ans_${id}`).value;
    if(!text.trim()) { alert('الرجاء كتابة الإجابة أولاً!'); return; }
    try {
        await addDoc(collection(db, "submissions"), { assignmentId: id, answerText: text, timestamp: new Date() });
        alert('تم إرسال إنجازك بنجاح!');
        document.getElementById(`ans_${id}`).value = '';
    } catch(e) { alert('خطأ في الإرسال'); }
};

// ================= 4. الاختبارات الرقمية (التفاعلية) =================
let currentQuizData = null; // لتخزين بيانات الاختبار المفتوح حالياً
let currentQuizId = null;

// دالة لبعثرة خيارات المتعدد حتى لا يكون الأول دائما صحيحاً
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadQuizzesList() {
    const list = document.getElementById('quizzesList');
    try {
        const snapshot = await getDocs(query(collection(db, "quizzes"), orderBy("timestamp", "desc")));
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const q = doc.data();
            list.innerHTML += `
                <div class="bg-white p-6 rounded-xl border-t-4 border-purple-600 shadow-md flex flex-col justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-purple-900 mb-2">${q.title}</h3>
                        <p class="text-gray-500 text-sm mb-4">يحتوي على ${q.totalQuestions} أسئلة | التنقيط: ${q.maxScore}/20</p>
                    </div>
                    <button onclick="window.startQuiz('${doc.id}')" class="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg transition-colors">🚀 ابدأ الاختبار الآن</button>
                </div>`;
        });
    } catch(e) { console.error(e); }
}

// فتح نافذة الاختبار وبناء الأسئلة
window.startQuiz = async (quizId) => {
    try {
        const docSnap = await getDoc(doc(db, "quizzes", quizId));
        if (docSnap.exists()) {
            currentQuizData = docSnap.data();
            currentQuizId = quizId;
            
            document.getElementById('activeQuizTitle').innerText = currentQuizData.title;
            document.getElementById('activeQuizInfo').innerText = `عدد الأسئلة: ${currentQuizData.totalQuestions} | النهاية المخصصة: ${currentQuizData.maxScore}/20`;
            
            const container = document.getElementById('quizQuestionsContainer');
            container.innerHTML = '';

            currentQuizData.questions.forEach((q, index) => {
                let optionsHtml = '';
                
                if(q.type === 'tf') {
                    // أسئلة صحيح وخطأ
                    optionsHtml = `
                        <label class="block p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition"><input type="radio" name="q_${index}" value="صحيح" class="mr-2 w-4 h-4 text-purple-600"> صحيح</label>
                        <label class="block p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition"><input type="radio" name="q_${index}" value="خطأ" class="mr-2 w-4 h-4 text-purple-600"> خطأ</label>
                    `;
                } else {
                    // أسئلة اختيار من متعدد (نقوم ببعثرة الخيارات أولا)
                    let shuffledOptions = shuffleArray([...q.options]);
                    shuffledOptions.forEach(opt => {
                        optionsHtml += `<label class="block p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition mb-2"><input type="radio" name="q_${index}" value="${opt}" class="mr-2 w-4 h-4 text-purple-600"> ${opt}</label>`;
                    });
                }

                container.innerHTML += `
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-800 mb-4"><span class="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">${index + 1}</span> ${q.text}</h3>
                        <div class="space-y-2 pr-4">
                            ${optionsHtml}
                        </div>
                    </div>`;
            });

            document.getElementById('takeQuizModal').classList.remove('hidden');
        }
    } catch (e) { console.error(e); alert("خطأ في تحميل الاختبار"); }
};

window.closeQuizModal = () => {
    document.getElementById('takeQuizModal').classList.add('hidden');
    currentQuizData = null; currentQuizId = null;
};

// تصحيح الاختبار وحساب النقطة
window.submitQuiz = async () => {
    if(!currentQuizData) return;
    
    let score = 0;
    let answeredCount = 0;

    currentQuizData.questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q_${index}"]:checked`);
        if(selected) {
            answeredCount++;
            if(selected.value === q.correctAnswer) score += q.points;
        }
    });

    if(answeredCount < currentQuizData.totalQuestions) {
        if(!confirm('لم تقم بالإجابة على جميع الأسئلة! هل أنت متأكد من رغبتك في التسليم؟')) return;
    }

    // إغلاق نافذة الاختبار وإظهار النتيجة
    window.closeQuizModal();
    
    const emoji = score >= (currentQuizData.maxScore / 2) ? '🎉' : '💪';
    document.getElementById('resultEmoji').innerText = emoji;
    document.getElementById('studentScore').innerText = score;
    document.getElementById('totalScore').innerText = currentQuizData.maxScore;
    document.getElementById('resultModal').classList.remove('hidden');

    // حفظ النتيجة في قاعدة البيانات
    try {
        await addDoc(collection(db, "quiz_results"), {
            quizId: currentQuizId,
            quizTitle: currentQuizData.title,
            score: score,
            maxScore: currentQuizData.maxScore,
            timestamp: new Date()
        });
    } catch(e) { console.error("لم يتم حفظ النتيجة", e); }
};

window.closeResultModal = () => {
    document.getElementById('resultModal').classList.add('hidden');
};

// التشغيل المبدئي
loadAnnouncements();
loadDocuments();
loadAssignments();
loadQuizzesList();