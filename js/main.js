// بيانات الأقسام والطلبة
const classes = {
    'جذع مشترك علوم 5': 'TC-05.txt',
    'جذع مشترك علوم 6': 'TC-06.txt',
    'جذع مشترك علوم 7': 'TC-07.txt',
    'جذع مشترك علوم 8': 'TC-08.txt',
    'الأولى علوم 5': '1erbacFR-05.txt',
    'الأولى علوم 6': '1erbacFR-06.txt',
    'الأولى آداب 3': '1erbaL-03.txt'
};

// دالة لتحميل بيانات القسم
async function loadClassData(className) {
    const fileName = classes[className];
    try {
        const response = await fetch(`data/${fileName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const parts = line.split('\t');
                return {
                    fullName: parts[0],
                    lastName: parts[0].split(' ')[0],
                    firstName: parts[0].split(' ').slice(1).join(' ')
                };
            });
    } catch (error) {
        console.error('Error loading class data:', error);
        showMessage('حدث خطأ في تحميل بيانات الطلبة', 'error');
        return [];
    }
}

// دالة لتحميل البيانات المحفوظة من localStorage
function loadSavedData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error loading saved data:', error);
        return {};
    }
}

// دالة لحفظ البيانات في localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showMessage('حدث خطأ في حفظ البيانات', 'error');
        return false;
    }
}

// دالة لتنسيق التاريخ
function formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// دالة لعرض رسالة للمستخدم
function showMessage(message, type = 'info') {
    // إزالة أي رسائل سابقة
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-toast';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-family: 'El Messiri', sans-serif;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    } else if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%)';
    } else if (type === 'warning') {
        messageDiv.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// إضافة أنيميشن للرسائل
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    @keyframes slideIn {
        from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(-20px); 
        }
        to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
        }
    }
    
    @keyframes slideOut {
        from { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
        }
        to { 
            opacity: 0; 
            transform: translateX(-50%) translateY(-20px); 
        }
    }
    
    .message-toast {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(messageStyles);

// تهيئة التاريخ في صفحات الحضور
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('dateSelect');
    if (dateInput) {
        dateInput.value = formatDate();
    }
});