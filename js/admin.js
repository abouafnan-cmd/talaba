import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// نظام التنقل بين الأقسام
window.showSection = (sectionId) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active'));
    document.getElementById(`section-${sectionId}`).classList.add('section-active');
};

// نظام النوافذ المنبثقة
window.openModal = (modalId) => document.getElementById(modalId).classList.remove('hidden');
window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
    // مسح الحقول عند الإغلاق
    if(modalId === 'addUserModal') document.getElementById('addUserForm').reset();
    if(modalId === 'addCohortModal') document.getElementById('addCohortForm').reset();
    if(modalId === 'addSubjectModal') document.getElementById('addSubjectForm').reset();
};

// ================= 1. إدارة المستخدمين (مع زر الواتساب) =================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center">جاري التحميل...</td></tr>';
    try {
        const q = query(collection(db, "users"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const badge = user.role === 'طالب' ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">طالب</span>' : '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">أستاذ</span>';
            
            // تهيئة رابط الواتساب المجاني (نحول 06 إلى 2126)
            let phoneForWa = user.phone;
            if(phoneForWa && phoneForWa.startsWith('0')) phoneForWa = "212" + phoneForWa.substring(1);
            const waLink = `https://wa.me/${phoneForWa}`;

            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 font-semibold">${user.name}</td>
                    <td class="p-4">${badge}</td>
                    <td class="p-4" dir="ltr">${user.phone}</td>
                    <td class="p-4 text-center">
                        <a href="${waLink}" target="_blank" class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm shadow inline-block">💬 مراسلة</a>
                    </td>
                </tr>`;
        });
        updateSelectDropdowns(); // لتحديث قوائم الأساتذة في نافذة المواد
    } catch(e) { console.error(e); }
}

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "users"), {
        name: document.getElementById('newName').value,
        phone: document.getElementById('newPhone').value,
        role: document.getElementById('newRole').value,
        timestamp: new Date()
    });
    window.closeModal('addUserModal');
    loadUsers();
});

// ================= 2. إدارة الأفواج =================
async function loadCohorts() {
    const tbody = document.getElementById('cohortsTableBody');
    try {
        const snapshot = await getDocs(query(collection(db, "cohorts"), orderBy("timestamp", "desc")));
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            tbody.innerHTML += `<tr class="border-b hover:bg-gray-50"><td class="p-4 font-semibold text-primary">🏫 ${doc.data().name}</td></tr>`;
        });
        updateSelectDropdowns(); // لتحديث قوائم الأفواج في نافذة المواد
    } catch(e) { console.error(e); }
}

document.getElementById('addCohortForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "cohorts"), {
        name: document.getElementById('newCohortName').value,
        timestamp: new Date()
    });
    window.closeModal('addCohortModal');
    loadCohorts();
});

// ================= 3. إدارة المواد وإسنادها =================
async function loadSubjects() {
    const tbody = document.getElementById('subjectsTableBody');
    try {
        const snapshot = await getDocs(query(collection(db, "subjects"), orderBy("timestamp", "desc")));
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const sub = doc.data();
            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 font-bold">📚 ${sub.name}</td>
                    <td class="p-4 text-gray-600">👨‍🏫 ${sub.teacherName}</td>
                    <td class="p-4 text-blue-600">${sub.cohortName}</td>
                </tr>`;
        });
    } catch(e) { console.error(e); }
}

document.getElementById('addSubjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const teacherSelect = document.getElementById('selectTeacher');
    const cohortSelect = document.getElementById('selectCohort');
    await addDoc(collection(db, "subjects"), {
        name: document.getElementById('newSubjectName').value,
        teacherName: teacherSelect.options[teacherSelect.selectedIndex].text,
        cohortName: cohortSelect.options[cohortSelect.selectedIndex].text,
        timestamp: new Date()
    });
    window.closeModal('addSubjectModal');
    loadSubjects();
});

// ================= دوال مساعدة لملء القوائم المنسدلة =================
async function updateSelectDropdowns() {
    const tSelect = document.getElementById('selectTeacher');
    const cSelect = document.getElementById('selectCohort');
    
    // جلب الأساتذة فقط
    const tSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "أستاذ")));
    tSelect.innerHTML = '';
    tSnapshot.forEach(doc => { tSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });

    // جلب الأفواج
    const cSnapshot = await getDocs(collection(db, "cohorts"));
    cSelect.innerHTML = '';
    cSnapshot.forEach(doc => { cSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
}

// تشغيل التحميل عند فتح الصفحة
loadUsers();
loadCohorts();
loadSubjects();