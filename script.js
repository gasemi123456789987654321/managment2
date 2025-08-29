const API_SAVE = "/save";
const API_GET = "/getPatient";
const API_DELETE = "/deletePatient";

// ---------------- مدیریت تب‌ها ----------------
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ---------------- توابع مشترک ----------------
function validateFile(file) {
    return !(file && file.size > 3 * 1024 * 1024);
}

function getCurrentPatientCode() {
    return document.getElementById('patientCode').value.trim();
}

// ارسال فرم به سرور
async function sendFormData(formData, apiUrl = API_SAVE) {
    try {
        const res = await fetch(apiUrl, { method: "POST", body: formData });
        const data = await res.json();
        alert(data.message);
        return data;
    } catch (err) {
        console.error(err);
        alert("خطا در ارتباط با سرور");
    }
}

// پاک‌سازی فیلدها
function clearFields() {
    ['drugNameText','usageText','doctorName','drugFile',
     'imagingDoctor','imagingType','imagingProblem','imagingFile',
     'labTest','labDoctor','labFile'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
     });
}

// ---------------- ذخیره دارو ----------------
document.getElementById('saveDrug').addEventListener('click', async () => {
    const patientCode = getCurrentPatientCode();
    if (!/^\d{10}$/.test(patientCode)) return alert("کد ملی معتبر نیست");

    const drugName = document.getElementById('drugNameText').value.trim();
    const usage = document.getElementById('usageText').value.trim();
    const doctor = document.getElementById('doctorName').value.trim();
    const file = document.getElementById('drugFile').files[0];
    if (file && !validateFile(file)) return alert("حجم فایل دارو بیشتر از ۳ مگابایت است");

    const formData = new FormData();
    formData.append("patientCode", patientCode);
    formData.append("drugName", drugName);
    formData.append("usage", usage);
    formData.append("doctor", doctor);
    if (file) formData.append("drugFile", file);

    await sendFormData(formData);
    clearFields();
});

// ---------------- ذخیره تصویربرداری ----------------
document.getElementById('saveImaging').addEventListener('click', async () => {
    const patientCode = getCurrentPatientCode();
    if (!/^\d{10}$/.test(patientCode)) return alert("کد ملی معتبر نیست");

    const imagingDoctor = document.getElementById('imagingDoctor').value.trim();
    const imagingType = document.getElementById('imagingType').value;
    const imagingProblem = document.getElementById('imagingProblem').value.trim();
    const file = document.getElementById('imagingFile').files[0];
    if (file && !validateFile(file)) return alert("حجم فایل تصویربرداری بیشتر از ۳ مگابایت است");

    const formData = new FormData();
    formData.append("patientCode", patientCode);
    formData.append("doctor", imagingDoctor);
    formData.append("usage", imagingType); // استفاده موقت برای نوع تصویربرداری
    formData.append("drugName", imagingProblem); // استفاده موقت برای توضیح مشکل
    if (file) formData.append("imagingFile", file);

    await sendFormData(formData);
    clearFields();
});

// ---------------- ذخیره آزمایشگاه ----------------
document.getElementById('saveLab').addEventListener('click', async () => {
    const patientCode = getCurrentPatientCode();
    if (!/^\d{10}$/.test(patientCode)) return alert("کد ملی معتبر نیست");

    const labTest = document.getElementById('labTest').value.trim();
    const labDoctor = document.getElementById('labDoctor').value.trim();
    const file = document.getElementById('labFile').files[0];
    if (file && !validateFile(file)) return alert("حجم فایل آزمایشگاه بیشتر از ۳ مگابایت است");

    const formData = new FormData();
    formData.append("patientCode", patientCode);
    formData.append("drugName", labTest); // استفاده موقت برای نام آزمایش
    formData.append("usage", labDoctor);  // استفاده موقت برای نام پزشک
    if (file) formData.append("labFile", file);

    await sendFormData(formData);
    clearFields();
});

// ---------------- جستجوی بیمار ----------------
document.getElementById('searchBtn').addEventListener('click', async () => {
    const patientCode = getCurrentPatientCode();
    if (!/^\d{10}$/.test(patientCode)) return alert("کد ملی معتبر نیست");

    const formData = new FormData();
    formData.append("patientCode", patientCode);

    try {
        const res = await fetch(API_GET, { method: "POST", body: formData });
        const data = await res.json();
        if (data.status === "success" && data.data) {
            const d = data.data;
            document.getElementById('drugNameText').value = d.drugName || '';
            document.getElementById('usageText').value = d.usageText || '';
            document.getElementById('doctorName').value = d.doctor || '';
            document.getElementById('results').style.display = "block";
        } else {
            alert("اطلاعاتی برای این بیمار پیدا نشد");
        }
    } catch (err) {
        console.error(err);
        alert("خطا در دریافت اطلاعات");
    }
});

// ---------------- حذف اطلاعات بیمار ----------------
document.getElementById('deletePatientBtn').addEventListener('click', async () => {
    const patientCode = getCurrentPatientCode();
    if (!/^\d{10}$/.test(patientCode)) return alert("کد ملی معتبر نیست");

    if (!confirm("آیا از حذف اطلاعات این بیمار مطمئن هستید؟")) return;

    const formData = new FormData();
    formData.append("patientCode", patientCode);

    await sendFormData(formData, API_DELETE);
    clearFields();
    document.getElementById('results').style.display = "none";
});
