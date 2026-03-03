import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('userPhone').value;
    const password = document.getElementById('userPassword').value;
    const btn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');
    
    btn.innerText = "جاري التحقق...";
    btn.disabled = true;
    errorMsg.classList.add('hidden');

    try {
        // --- دخول استثنائي للمدير العام ---
        // استخدم هذا الرقم وكلمة المرور للدخول للوحة الإدارة دائماً
        if(phone === '0600000000' && password === 'admin2026') {
            localStorage.setItem('role', 'مدير');
            window.location.href = 'pages/admin.html';
            return;
        }

        // --- دخول الأساتذة والطلبة ---
        // البحث في قاعدة البيانات عن المستخدم
        const q = query(collection(db, "users"), where("phone", "==", phone), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // تم العثور على المستخدم
            const userData = querySnapshot.docs[0].data();
            const userId = querySnapshot.docs[0].id; // نحفظ المعرف لنحتاجه في الاختبارات

            // حفظ بيانات الجلسة
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('role', userData.role);

            // التوجيه حسب الصفة
            if(userData.role === 'أستاذ') {
                window.location.href = 'pages/teacher.html';
            } else {
                window.location.href = 'pages/student.html';
            }
        } else {
            // بيانات خاطئة
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("خطأ: ", error);
        alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
        btn.innerText = "تسجيل الدخول";
        btn.disabled = false;
    }
});