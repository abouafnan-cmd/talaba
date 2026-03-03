// استدعاء مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// مفاتيح مشروعك
const firebaseConfig = {
    apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
    authDomain: "talaba-app.firebaseapp.com",
    projectId: "talaba-app",
    storageBucket: "talaba-app.firebasestorage.app",
    messagingSenderId: "642352039580",
    appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
};

// تهيئة الاتصال بقاعدة البيانات Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// التحكم في النافذة المنبثقة (Modal)
const modal = document.getElementById('addModal');
const quickAddBtn = document.getElementById('quickAddBtn');

window.openModal = () => modal.classList.remove('hidden');
window.closeModal = () => {
    modal.classList.add('hidden');
    document.getElementById('addUserForm').reset(); // تصفير الحقول بعد الإغلاق
};

quickAddBtn.addEventListener('click', window.openModal);

// حفظ البيانات عند الضغط على زر (حفظ البيانات)
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // منع تحديث الصفحة
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = "جاري الحفظ...";
    saveBtn.disabled = true;

    // جلب البيانات من الحقول
    const name = document.getElementById('newName').value;
    const email = document.getElementById('newEmail').value;
    const role = document.getElementById('newRole').value;

    try {
        // إضافة البيانات إلى "مجموعة" اسمها users في قاعدة البيانات
        await addDoc(collection(db, "users"), {
            name: name,
            email: email,
            role: role,
            timestamp: new Date() // لحفظ وقت وتاريخ الإضافة
        });

        alert('تمت الإضافة إلى قاعدة البيانات بنجاح!');
        window.closeModal();
        loadUsers(); // تحديث الجدول فوراً

    } catch (error) {
        console.error("خطأ في الحفظ: ", error);
        alert('حدث خطأ أثناء الاتصال بقاعدة البيانات.');
    } finally {
        saveBtn.innerText = "حفظ البيانات";
        saveBtn.disabled = false;
    }
});

// دالة لجلب البيانات من قاعدة البيانات وعرضها في الجدول
async function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const studentsCount = document.getElementById('studentsCount');
    tableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">جاري تحميل البيانات...</td></tr>';
    
    try {
        // جلب البيانات مرتبة حسب الأحدث
        const q = query(collection(db, "users"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ''; // مسح رسالة التحميل
        let count = 0;

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            if(user.role === 'طالب') count++; // حساب عدد الطلبة فقط

            // تحديد لون الشارة حسب الصفة
            const roleBadge = user.role === 'طالب' 
                ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">طالب</span>'
                : '<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">أستاذ</span>';

            // إضافة الصف للجدول
            tableBody.innerHTML += `
                <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="p-4 font-semibold">${user.name}</td>
                    <td class="p-4 text-gray-600">${user.email}</td>
                    <td class="p-4">${roleBadge}</td>
                </tr>
            `;
        });

        // تحديث رقم إجمالي الطلبة في البطاقة العلوية
        studentsCount.innerText = count;

        // إذا كانت القاعدة فارغة
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">لا يوجد مستخدمين مضافين حتى الآن.</td></tr>';
        }

    } catch (error) {
        console.error("خطأ في جلب البيانات: ", error);
        tableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-red-500">حدث خطأ في تحميل البيانات.</td></tr>';
    }
}

// تشغيل دالة جلب البيانات بمجرد فتح الصفحة
loadUsers();