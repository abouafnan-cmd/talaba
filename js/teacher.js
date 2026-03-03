import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// مفاتيح مشروعك
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

const attendanceModal = document.getElementById('attendanceModal');
const attendanceTableBody = document.getElementById('attendanceTableBody');

// تحديد تاريخ اليوم تلقائياً
document.getElementById('attendanceDate').valueAsDate = new Date();

window.openAttendanceModal = () => {
    attendanceModal.classList.remove('hidden');
    loadStudentsForAttendance(); // جلب الطلبة عند فتح النافذة
};

window.closeAttendanceModal = () => {
    attendanceModal.classList.add('hidden');
};

// جلب الطلبة فقط من قاعدة البيانات
async function loadStudentsForAttendance() {
    attendanceTableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">جاري جلب قائمة الطلبة...</td></tr>';
    
    try {
        // البحث فقط عن المستخدمين الذين صفتهم "طالب"
        const q = query(collection(db, "users"), where("role", "==", "طالب"));
        const querySnapshot = await getDocs(q);
        
        attendanceTableBody.innerHTML = ''; 
        let studentCount = 0;

        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentId = doc.id; // المعرف السري للطالب في قاعدة البيانات
            studentCount++;

            // إضافة الطالب مع أزرار اختيار (Radio buttons) للحضور والغياب
            attendanceTableBody.innerHTML += `
                <tr class="border-b border-gray-100 hover:bg-gray-50 student-row" data-id="${studentId}" data-name="${student.name}">
                    <td class="p-4 font-semibold">${student.name}</td>
                    <td class="p-4 text-center">
                        <input type="radio" name="status_${studentId}" value="حاضر" class="w-5 h-5 text-green-600" checked>
                    </td>
                    <td class="p-4 text-center">
                        <input type="radio" name="status_${studentId}" value="غائب" class="w-5 h-5 text-red-600">
                    </td>
                </tr>
            `;
        });

        // تحديث الرقم في الواجهة الرئيسية
        document.getElementById('studentCount').innerText = studentCount;

        if (querySnapshot.empty) {
            attendanceTableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500">لا يوجد طلبة مسجلين بعد.</td></tr>';
        }

    } catch (error) {
        console.error("خطأ: ", error);
        attendanceTableBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-red-500">حدث خطأ في جلب الطلبة.</td></tr>';
    }
}

// تشغيل دالة حساب الطلبة فور فتح صفحة الأستاذ
loadStudentsForAttendance();

// حفظ سجل الغياب في قاعدة البيانات
document.getElementById('saveAttendanceBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveAttendanceBtn');
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    const date = document.getElementById('attendanceDate').value;
    const studentRows = document.querySelectorAll('.student-row');
    let attendanceRecord = [];

    // المرور على كل طالب وتسجيل حالته (حاضر أم غائب)
    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-id');
        const studentName = row.getAttribute('data-name');
        const status = document.querySelector(`input[name="status_${studentId}"]:checked`).value;
        
        attendanceRecord.push({
            studentId: studentId,
            studentName: studentName,
            status: status
        });
    });

    try {
        // حفظ السجل كاملاً في مجموعة جديدة اسمها attendance
        await addDoc(collection(db, "attendance"), {
            date: date,
            records: attendanceRecord,
            timestamp: new Date()
        });

        alert('تم حفظ سجل الغياب بنجاح!');
        window.closeAttendanceModal();

    } catch (error) {
        console.error("خطأ في حفظ الغياب: ", error);
        alert('حدث خطأ أثناء حفظ البيانات.');
    } finally {
        btn.innerText = "حفظ السجل";
        btn.disabled = false;
    }
});