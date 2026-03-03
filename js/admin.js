import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const modal = document.getElementById('addModal');
const quickAddBtn = document.getElementById('quickAddBtn');

window.openModal = () => modal.classList.remove('hidden');
window.closeModal = () => {
    modal.classList.add('hidden');
    document.getElementById('addUserForm').reset(); 
};

quickAddBtn.addEventListener('click', window.openModal);

// حفظ البيانات في قاعدة البيانات
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = "جاري الحفظ...";
    saveBtn.disabled = true;

    const name = document.getElementById('newName').value;
    const phone = document.getElementById('newPhone').value; // تم تغيير البريد إلى رقم الهاتف
    const role = document.getElementById('newRole').value;

    try {
        await addDoc(collection(db, "users"), {
            name: name,
            phone: phone, // حفظ رقم الهاتف
            role: role,
            timestamp: new Date()
        });

        alert('تمت الإضافة بنجاح!');
        window.closeModal();
        loadUsers(); 

    } catch (error) {
        console.error("خطأ: ", error);
        alert('حدث خطأ! تأكد من تعديل قواعد بيانات Firebase (Rules) كما هو مشروح.');
    } finally {
        saveBtn.innerText = "حفظ البيانات";
        saveBtn.disabled = false;
    }
});

// جلب البيانات من القاعدة
async function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const studentsCount = document.getElementById('studentsCount');
    tableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">جاري تحميل البيانات...</td></tr>';
    
    try {
        const q = query(collection(db, "users"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ''; 
        let count = 0;

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            if(user.role === 'طالب') count++; 

            const roleBadge = user.role === 'طالب' 
                ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">طالب</span>'
                : '<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">أستاذ</span>';

            tableBody.innerHTML += `
                <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="p-4 font-semibold">${user.name}</td>
                    <td class="p-4 text-gray-600 font-bold" dir="ltr">${user.phone}</td>
                    <td class="p-4">${roleBadge}</td>
                </tr>
            `;
        });

        studentsCount.innerText = count;

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">لا يوجد مستخدمين مضافين حتى الآن.</td></tr>';
        }

    } catch (error) {
        console.error("خطأ: ", error);
        tableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-red-500">حدث خطأ في تحميل البيانات (يرجى التحقق من قواعد Security Rules).</td></tr>';
    }
}

loadUsers();
