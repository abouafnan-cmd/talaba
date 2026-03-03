// استدعاء مكتبات Firebase الإصدار الحديث
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// مفاتيح مشروعك (التي قمت بنسخها)
const firebaseConfig = {
  apiKey: "AIzaSyDpawG59DxmrdHOxmglW7Ez3HcefvO5b6E",
  authDomain: "talaba-app.firebaseapp.com",
  projectId: "talaba-app",
  storageBucket: "talaba-app.firebasestorage.app",
  messagingSenderId: "642352039580",
  appId: "1:642352039580:web:307d32a9c8eb3c2b388f59"
};

// تهيئة الاتصال بقاعدة البيانات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentRole = 'student';

// وظيفة التبديل بين التبويبات (أضفنا window لجعلها تعمل داخل الـ module)
window.switchTab = function(role) {
    currentRole = role;
    
    document.getElementById('tab-student').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    document.getElementById('tab-teacher').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    document.getElementById('tab-admin').className = 'flex-1 py-3 text-center text-sm tab-inactive transition-all duration-300';
    
    document.getElementById(`tab-${role}`).className = 'flex-1 py-3 text-center text-sm tab-active transition-all duration-300';

    const userLabel = document.getElementById('userLabel');
    if (role === 'student') userLabel.innerText = 'البريد الإلكتروني (للطالب)';
    else if (role === 'teacher') userLabel.innerText = 'البريد الإلكتروني (للأستاذ)';
    else if (role === 'admin') userLabel.innerText = 'البريد الإلكتروني (للمدير)';
}

// وظيفة الدخول الحقيقية
window.handleLogin = function(event) {
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('submitBtn');
    
    // تغيير نص الزر أثناء التحميل
    const originalText = btn.innerText;
    btn.innerText = 'جاري التحقق...';
    btn.disabled = true;
    btn.classList.add('opacity-70');

    // إرسال البيانات لـ Firebase للتحقق
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // الدخول ناجح! توجيه المستخدم لصفحته
            if (currentRole === 'admin') window.location.href = 'pages/admin.html';
            else if (currentRole === 'teacher') window.location.href = 'pages/teacher.html';
            else window.location.href = 'pages/student.html';
        })
        .catch((error) => {
            // الدخول فاشل
            console.error("Error:", error.message);
            alert("خطأ: البريد الإلكتروني أو الرقم السري غير صحيح.");
            
            // إعادة الزر لحالته الطبيعية
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-70');
        });
}