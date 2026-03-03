import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
});
const db = getFirestore(app);

// عرض التكليفات للطالب
async function loadStudentAssignments() {
    const list = document.getElementById('studentAssignmentsList');
    list.innerHTML = '<p>جاري تحميل التكليفات...</p>';
    try {
        const snapshot = await getDocs(query(collection(db, "assignments"), orderBy("timestamp", "desc")));
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const ass = doc.data();
            list.innerHTML += `
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-blue-900">${ass.title}</h3>
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">النهاية: ${ass.maxScore}/20</span>
                    </div>
                    <p class="text-gray-700 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">${ass.description}</p>
                    <div class="mt-4 border-t pt-4">
                        <textarea id="answer_${doc.id}" class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 mb-3" rows="3" placeholder="اكتب إجابتك هنا..."></textarea>
                        <button onclick="window.submitAnswer('${doc.id}')" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow">إرسال الإنجاز</button>
                    </div>
                </div>`;
        });
        
        if (snapshot.empty) list.innerHTML = '<p class="text-gray-500 text-center p-8 bg-white rounded-xl">لا توجد تكليفات حالياً. أحسنت!</p>';
    } catch(e) { console.error(e); }
}

// إرسال الإنجاز
window.submitAnswer = async (assignmentId) => {
    const answerText = document.getElementById(`answer_${assignmentId}`).value;
    if(!answerText.trim()) { alert('الرجاء كتابة الإجابة أولاً!'); return; }
    
    try {
        await addDoc(collection(db, "submissions"), {
            assignmentId: assignmentId,
            answerText: answerText,
            timestamp: new Date()
        });
        alert('تم إرسال إنجازك للأستاذ بنجاح!');
        document.getElementById(`answer_${assignmentId}`).value = ''; // مسح الحقل بعد الإرسال
    } catch (error) {
        alert('حدث خطأ أثناء الإرسال.');
    }
};

loadStudentAssignments();