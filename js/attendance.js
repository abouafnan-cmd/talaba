// تصدير إلى PDF - الآن يفتح صفحة التقارير
function exportToPDF() {
    const sectionId = document.getElementById('section-select').value;
    const subjectId = document.getElementById('subject-select').value;
    
    if (!sectionId || !subjectId) {
        alert('يرجى اختيار القسم والمادة أولاً');
        return;
    }
    
    // البحث عن آخر سجل حضور لهذا القسم والمادة
    const latestRecord = window.appData.attendanceRecords
        .filter(record => record.section === sectionId && record.subject == subjectId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    if (!latestRecord) {
        alert('لا توجد سجلات حضور لهذا القسم والمادة');
        return;
    }
    
    // فتح صفحة التقارير
    const reportUrl = `report.html?recordId=${latestRecord.id}`;
    window.open(reportUrl, '_blank', 'width=1000,height=800');
}

// تحديث زر التصدير في `js/attendance.js`
document.getElementById('export-pdf').addEventListener('click', function() {
    exportToPDF();
});