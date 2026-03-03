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

window.showSection = (id) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active'));
    document.getElementById(`section-${id}`).classList.add('section-active');
};
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => { document.getElementById(id).classList.add('hidden'); document.getElementById('addAssignmentForm').reset(); };

document.getElementById('attendanceDate').valueAsDate = new Date();

// جلب الطلبة للغياب
async function loadStudents() {
    const tbody = document.getElementById('attendanceTableBody');
    const q = query(collection(db, "users"), where("role", "==", "طالب"));
    const snapshot = await getDocs(q);
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
        const student = doc.data();
        tbody.innerHTML += `
            <tr class="border-b student-row" data-id="${doc.id}">
                <td class="p-4 font-semibold">${student.name}</td>
                <td class="p-4 text-center">
                    <label class="text-green-600 mx-2"><input type="radio" name="st_${doc.id}" value="حاضر" checked> حاضر</label>
                    <label class="text-red-600 mx-2"><input type="radio" name="st_${doc.id}" value="غائب"> غائب</label>
                </td>
            </tr>`;
    });
}

// حفظ الغياب
document.getElementById('saveAttendanceBtn').addEventListener('click', async () => {
    let records = [];
    document.querySelectorAll('.student-row').forEach(row => {
        const id = row.getAttribute('data-id');
        records.push({ studentId: id, status: document.querySelector(`input[name="st_${id}"]:checked`).value });
    });
    await addDoc(collection(db, "attendance"), { date: document.getElementById('attendanceDate').value, records, timestamp: new Date() });
    alert('تم حفظ سجل الغياب بنجاح!');
});

// إضافة تكليف
document.getElementById('addAssignmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "assignments"), {
        title: document.getElementById('assTitle').value,
        description: document.getElementById('assDesc').value,
        maxScore: 20,
        timestamp: new Date()
    });
    window.closeModal('addAssignmentModal');
    loadAssignments();
});

// عرض التكليفات
async function loadAssignments() {
    const list = document.getElementById('assignmentsList');
    const snapshot = await getDocs(query(collection(db, "assignments"), orderBy("timestamp", "desc")));
    list.innerHTML = '';
    snapshot.forEach(doc => {
        const ass = doc.data();
        list.innerHTML += `<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 class="text-xl font-bold text-blue-900 mb-2">${ass.title}</h3><p class="text-gray-600 mb-4">${ass.description}</p><span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">التنقيط: ${ass.maxScore} / 20</span></div>`;
    });
}

loadStudents();
loadAssignments();