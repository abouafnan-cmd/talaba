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

// ================= إدارة الأقسام والنوافذ =================
window.showSection = (sectionId) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('section-active'));
    document.getElementById(`section-${sectionId}`).classList.add('section-active');
};
window.openModal = (modalId) => document.getElementById(modalId).classList.remove('hidden');
window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
    const form = document.querySelector(`#${modalId} form`);
    if(form) form.reset();
    if(modalId === 'addAnnouncementModal') {
        document.getElementById('targetListContainer').classList.add('hidden');
        document.getElementById('dateContainer').classList.add('hidden');
    }
};

// ================= 1. إدارة المستخدمين (مع كلمات المرور) =================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">جاري التحميل...</td></tr>';
    try {
        const snapshot = await getDocs(query(collection(db, "users"), orderBy("timestamp", "desc")));
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const badge = user.role === 'طالب' ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">طالب</span>' : '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">أستاذ</span>';
            let phoneForWa = user.phone ? user.phone : "";
            if(phoneForWa.startsWith('0')) phoneForWa = "212" + phoneForWa.substring(1);
            
            // إضافة صف كلمة المرور باللون الأحمر ليكون واضحاً للمدير
            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 font-semibold">${user.name}</td>
                    <td class="p-4">${badge}</td>
                    <td class="p-4 font-bold" dir="ltr">${user.phone}</td>
                    <td class="p-4 text-center text-red-600 font-bold bg-red-50" dir="ltr">${user.password || '---'}</td>
                    <td class="p-4 text-center"><a href="https://wa.me/${phoneForWa}" target="_blank" class="px-3 py-1 bg-green-500 text-white rounded text-sm shadow">💬 مراسلة</a></td>
                </tr>`;
        });
        updateSelectDropdowns(); 
    } catch(e) { console.error(e); }
}

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    await addDoc(collection(db, "users"), { 
        name: document.getElementById('newName').value, 
        phone: document.getElementById('newPhone').value, 
        password: document.getElementById('newPassword').value, // حفظ كلمة المرور
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
        updateSelectDropdowns(); 
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

// ================= 3. المواد الدراسية =================
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
                    <td class="p-4 text-xs text-gray-500 max-w-xs truncate">${sub.info || 'لا توجد معلومات'}</td>
                </tr>`;
        });
    } catch(e) { console.error(e); }
}

document.getElementById('addSubjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tSelect = document.getElementById('selectTeacher');
    const cSelect = document.getElementById('selectCohort');
    await addDoc(collection(db, "subjects"), {
        name: document.getElementById('newSubjectName').value,
        info: document.getElementById('subjectInfo').value, 
        syllabus: document.getElementById('subjectSyllabus').value, 
        teacherName: tSelect.options[tSelect.selectedIndex].text,
        cohortName: cSelect.options[cSelect.selectedIndex].text,
        timestamp: new Date()
    });
    window.closeModal('addSubjectModal');
    loadSubjects();
});

async function updateSelectDropdowns() {
    const tSelect = document.getElementById('selectTeacher'); 
    const cSelect = document.getElementById('selectCohort');
    
    const tSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "أستاذ")));
    tSelect.innerHTML = ''; 
    tSnapshot.forEach(doc => { tSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
    
    const cSnapshot = await getDocs(collection(db, "cohorts"));
    cSelect.innerHTML = ''; 
    cSnapshot.forEach(doc => { cSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
}

// ================= 4. الإخبارات والمواعيد =================
window.toggleDateInput = () => {
    const type = document.getElementById('annType').value;
    const dateDiv = document.getElementById('dateContainer');
    if(type === 'موعد') dateDiv.classList.remove('hidden'); else dateDiv.classList.add('hidden');
};

window.toggleTargetList = async () => {
    const target = document.getElementById('annTarget').value;
    const container = document.getElementById('targetListContainer');
    const checkboxList = document.getElementById('targetCheckboxes');
    
    if (target === 'all') { container.classList.add('hidden'); return; }
    
    container.classList.remove('hidden');
    checkboxList.innerHTML = '<p class="text-sm text-gray-500">جاري تحميل الأسماء من القاعدة...</p>';
    
    const role = target === 'teachers' ? 'أستاذ' : 'طالب';
    const snapshot = await getDocs(query(collection(db, "users"), where("role", "==", role)));
    
    const labelTitle = target === 'teachers' ? 'جميع الأساتذة' : 'جميع الطلبة';
    let html = `
        <label class="block mb-3 font-bold text-primary border-b pb-2">
            <input type="checkbox" id="selectAllTargets" onchange="window.toggleAll(this)" class="mr-2 w-4 h-4"> ${labelTitle}
        </label>
        <div class="space-y-2 pr-2">`;
    
    snapshot.forEach(doc => {
        html += `<label class="block text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"><input type="checkbox" name="targetUser" value="${doc.id}" data-name="${doc.data().name}" class="mr-2 target-cb w-4 h-4"> ${doc.data().name}</label>`;
    });
    html += '</div>';
    checkboxList.innerHTML = html;
};

window.toggleAll = (source) => {
    document.querySelectorAll('.target-cb').forEach(cb => cb.checked = source.checked);
};

document.getElementById('addAnnouncementForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveAnnBtn');
    btn.innerText = "جاري النشر..."; btn.disabled = true;

    const type = document.getElementById('annType').value;
    const target = document.getElementById('annTarget').value;
    
    let selectedIds = [];
    let targetSummary = "الجميع";
    if(target !== 'all') {
        const checked = document.querySelectorAll('.target-cb:checked');
        if(checked.length === 0) { alert('الرجاء اختيار شخص واحد على الأقل!'); btn.innerText = "نشر"; btn.disabled = false; return; }
        checked.forEach(cb => selectedIds.push(cb.value));
        targetSummary = target === 'teachers' ? `مخصص لأساتذة محددين (${selectedIds.length})` : `مخصص لطلبة محددين (${selectedIds.length})`;
    }

    try {
        await addDoc(collection(db, "announcements"), {
            type: type,
            targetMode: target,
            specificUsers: selectedIds, 
            targetSummary: targetSummary,
            date: type === 'موعد' ? document.getElementById('annDate').value : null,
            content: document.getElementById('annContent').value,
            timestamp: new Date()
        });
        window.closeModal('addAnnouncementModal');
        loadAnnouncements();
    } catch (err) { console.error(err); alert("حدث خطأ!"); }
    finally { btn.innerText = "نشر"; btn.disabled = false; }
});

async function loadAnnouncements() {
    const list = document.getElementById('announcementsList');
    list.innerHTML = '<p>جاري التحميل...</p>';
    try {
        const snapshot = await getDocs(query(collection(db, "announcements"), orderBy("timestamp", "desc")));
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const ann = doc.data();
            const icon = ann.type === 'موعد' ? '🗓️' : '📢';
            const dateStr = ann.type === 'موعد' ? `<p class="text-red-600 font-bold text-sm mb-2">تاريخ الموعد: ${ann.date.replace('T', ' ')}</p>` : '';
            
            list.innerHTML += `
                <div class="bg-white p-5 rounded-xl border-l-4 ${ann.type === 'موعد' ? 'border-red-500' : 'border-yellow-500'} shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-bold text-gray-800">${icon} ${ann.type}</span>
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${ann.targetSummary}</span>
                    </div>
                    ${dateStr}
                    <p class="text-gray-700 whitespace-pre-line text-sm">${ann.content}</p>
                </div>`;
        });
    } catch(e) { console.error(e); }
}

// التشغيل المبدئي
loadUsers();
loadCohorts();
loadSubjects();
loadAnnouncements();