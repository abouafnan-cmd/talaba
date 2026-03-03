import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
});
const db = getFirestore(app);

// إدارة الأقسام والنوافذ
window.showSection = (id) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active'));
    document.getElementById(`section-${id}`).classList.add('section-active');
};
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => { 
    document.getElementById(id).classList.add('hidden'); 
    if(id === 'addQuizModal') { document.getElementById('questionsContainer').innerHTML = 'الرجاء اختيار عدد الأسئلة...'; document.getElementById('saveQuizBtn').classList.add('hidden'); document.getElementById('quizCount').value = "0"; document.getElementById('quizTitle').value = ""; }
};

// ================= الغياب والتكليفات (القديمة المحدثة) =================
document.getElementById('attendanceDate').valueAsDate = new Date();
async function loadStudents() {
    const tbody = document.getElementById('attendanceTableBody');
    const q = query(collection(db, "users"), where("role", "==", "طالب"));
    const snapshot = await getDocs(q);
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
        tbody.innerHTML += `<tr class="border-b student-row" data-id="${doc.id}"><td class="p-4 font-semibold">${doc.data().name}</td><td class="p-4 text-center"><label class="text-green-600 mx-2"><input type="radio" name="st_${doc.id}" value="حاضر" checked> حاضر</label><label class="text-red-600 mx-2"><input type="radio" name="st_${doc.id}" value="غائب"> غائب</label></td></tr>`;
    });
}
document.getElementById('saveAttendanceBtn').addEventListener('click', async () => {
    let records = [];
    document.querySelectorAll('.student-row').forEach(row => { const id = row.getAttribute('data-id'); records.push({ studentId: id, status: document.querySelector(`input[name="st_${id}"]:checked`).value }); });
    await addDoc(collection(db, "attendance"), { date: document.getElementById('attendanceDate').value, records, timestamp: new Date() });
    alert('تم الحفظ!');
});

document.getElementById('addAssignmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "assignments"), { title: document.getElementById('assTitle').value, description: document.getElementById('assDesc').value, maxScore: 20, type: 'text', timestamp: new Date() });
    window.closeModal('addAssignmentModal'); loadAssignments();
});
async function loadAssignments() {
    const list = document.getElementById('assignmentsList');
    const snapshot = await getDocs(query(collection(db, "assignments"), where("type", "==", "text")));
    list.innerHTML = '';
    snapshot.forEach(doc => { list.innerHTML += `<div class="bg-white p-6 rounded-xl border border-blue-100 shadow-sm"><h3 class="text-xl font-bold text-blue-900">${doc.data().title}</h3><p class="text-gray-600 mt-2">${doc.data().description}</p></div>`; });
}

// ================= القسم الجديد: وثائق وجذاذات =================
document.getElementById('addDocumentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "documents"), {
        title: document.getElementById('docTitle').value,
        description: document.getElementById('docDesc').value,
        link: document.getElementById('docLink').value,
        timestamp: new Date()
    });
    window.closeModal('addDocumentModal');
    loadDocuments();
});

async function loadDocuments() {
    const list = document.getElementById('documentsList');
    const snapshot = await getDocs(query(collection(db, "documents"), orderBy("timestamp", "desc")));
    list.innerHTML = '';
    snapshot.forEach(doc => {
        const d = doc.data();
        list.innerHTML += `
            <div class="bg-white p-5 rounded-xl border-r-4 border-orange-500 shadow-sm flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">📁 ${d.title}</h3>
                    <p class="text-sm text-gray-500 mt-1">${d.description}</p>
                </div>
                <a href="${d.link}" target="_blank" class="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200">عرض المرفق</a>
            </div>`;
    });
}

// ================= القسم الجديد: الاختبارات الرقمية =================
window.generateQuizForms = () => {
    const count = parseInt(document.getElementById('quizCount').value);
    const container = document.getElementById('questionsContainer');
    const saveBtn = document.getElementById('saveQuizBtn');
    
    if(count === 0) { container.innerHTML = 'الرجاء اختيار عدد الأسئلة...'; saveBtn.classList.add('hidden'); return; }
    
    saveBtn.classList.remove('hidden');
    container.innerHTML = '';
    
    for(let i=1; i<=count; i++) {
        container.innerHTML += `
            <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold text-purple-900">السؤال رقم ${i} (نقطة واحدة)</h4>
                    <select id="qType_${i}" class="px-3 py-1 text-sm rounded border border-purple-200 focus:ring-purple-500" onchange="window.toggleQType(${i})">
                        <option value="mcq">اختيار من متعدد</option>
                        <option value="tf">صحيح / خطأ</option>
                    </select>
                </div>
                
                <input type="text" id="qText_${i}" class="w-full mb-3 px-3 py-2 rounded border focus:ring-2 focus:ring-purple-500" placeholder="اكتب نص السؤال هنا..." required>
                
                <div id="mcqContainer_${i}" class="grid grid-cols-2 gap-2">
                    <input type="text" id="qOpt_${i}_1" class="px-3 py-2 rounded border bg-green-50 border-green-300 placeholder-green-700" placeholder="الخيار الصحيح (الإجابة)" required>
                    <input type="text" id="qOpt_${i}_2" class="px-3 py-2 rounded border" placeholder="خيار خاطئ 1" required>
                    <input type="text" id="qOpt_${i}_3" class="px-3 py-2 rounded border" placeholder="خيار خاطئ 2">
                    <input type="text" id="qOpt_${i}_4" class="px-3 py-2 rounded border" placeholder="خيار خاطئ 3">
                </div>

                <div id="tfContainer_${i}" class="hidden">
                    <label class="block text-sm font-semibold mb-2 text-gray-700">حدد الإجابة الصحيحة لهذا السؤال:</label>
                    <select id="qTfAns_${i}" class="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-purple-500">
                        <option value="صحيح">صحيح</option>
                        <option value="خطأ">خطأ</option>
                    </select>
                </div>
            </div>
        `;
    }
};

window.toggleQType = (i) => {
    const type = document.getElementById(`qType_${i}`).value;
    if(type === 'mcq') {
        document.getElementById(`mcqContainer_${i}`).classList.remove('hidden');
        document.getElementById(`tfContainer_${i}`).classList.add('hidden');
    } else {
        document.getElementById(`mcqContainer_${i}`).classList.add('hidden');
        document.getElementById(`tfContainer_${i}`).classList.remove('hidden');
        // إزالة خاصية مطلوب من حقول المتعدد حتى لا يعيق الحفظ
        document.getElementById(`qOpt_${i}_1`).required = false;
        document.getElementById(`qOpt_${i}_2`).required = false;
    }
};

window.saveQuiz = async () => {
    const title = document.getElementById('quizTitle').value;
    const count = parseInt(document.getElementById('quizCount').value);
    if(!title) { alert('الرجاء كتابة عنوان الاختبار'); return; }

    let questions = [];
    
    // جمع البيانات من كل سؤال
    for(let i=1; i<=count; i++) {
        const qText = document.getElementById(`qText_${i}`).value;
        const qType = document.getElementById(`qType_${i}`).value;
        
        if(!qText) { alert(`الرجاء كتابة نص السؤال رقم ${i}`); return; }

        let qData = { text: qText, type: qType, points: 1 };
        
        if(qType === 'mcq') {
            const opt1 = document.getElementById(`qOpt_${i}_1`).value;
            const opt2 = document.getElementById(`qOpt_${i}_2`).value;
            if(!opt1 || !opt2) { alert(`الرجاء إكمال خيارات السؤال رقم ${i}`); return; }
            qData.correctAnswer = opt1; // برمجياً نعتبر الخيار الأول هو الصحيح دائماً عند الأستاذ
            qData.options = [opt1, opt2, document.getElementById(`qOpt_${i}_3`).value, document.getElementById(`qOpt_${i}_4`).value].filter(val => val); // مسح الخانات الفارغة
        } else {
            qData.correctAnswer = document.getElementById(`qTfAns_${i}`).value;
            qData.options = ["صحيح", "خطأ"];
        }
        questions.push(qData);
    }

    const btn = document.getElementById('saveQuizBtn');
    btn.innerText = "جاري الحفظ..."; btn.disabled = true;

    try {
        await addDoc(collection(db, "quizzes"), {
            title: title,
            totalQuestions: count,
            maxScore: count, // النقطة هي عدد الأسئلة
            questions: questions,
            timestamp: new Date()
        });
        alert('تم نشر الاختبار بنجاح!');
        window.closeModal('addQuizModal');
        loadQuizzes();
    } catch (e) { console.error(e); alert('حدث خطأ'); }
    finally { btn.innerText = "نشر الاختبار للطلبة"; btn.disabled = false; }
};

async function loadQuizzes() {
    const list = document.getElementById('quizzesList');
    const snapshot = await getDocs(query(collection(db, "quizzes"), orderBy("timestamp", "desc")));
    list.innerHTML = '';
    snapshot.forEach(doc => {
        const q = doc.data();
        list.innerHTML += `
            <div class="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                <h3 class="text-xl font-bold text-purple-900">${q.title}</h3>
                <div class="flex justify-between items-center mt-4">
                    <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">عدد الأسئلة: ${q.totalQuestions}</span>
                    <span class="text-gray-500 text-sm">النهاية: ${q.maxScore}/20</span>
                </div>
            </div>`;
    });
}

// التشغيل المبدئي
loadStudents();
loadAssignments();
loadDocuments();
loadQuizzes();