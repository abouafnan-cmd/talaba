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
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// دالة لتنسيق التاريخ
function formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// دالة لعرض رسالة للمستخدم
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#e74c3c';
    } else {
        messageDiv.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// إضافة أنيميشن للرسائل
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);