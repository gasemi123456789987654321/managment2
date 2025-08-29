const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();

// مسیر پوشه آپلودها
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// تنظیمات multer برای آپلود فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// خواندن اطلاعات دیتابیس از Environment Variables
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "medical_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadFolder));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- ذخیره اطلاعات بیمار ----------------
app.post('/save', upload.fields([
  { name: 'drugFile', maxCount: 1 },
  { name: 'imagingFile', maxCount: 1 },
  { name: 'labFile', maxCount: 1 }
]), (req, res) => {
  const patientCode = req.body.patientCode;
  if (!patientCode) return res.json({ status: "error", message: "کد بیمار الزامی است" });

  const drugName = req.body.drugName || '';
  const usageText = req.body.usage || '';
  const doctor = req.body.doctor || '';

  const drugFile = req.files['drugFile'] ? req.files['drugFile'][0].filename : '';
  const imagingFile = req.files['imagingFile'] ? req.files['imagingFile'][0].filename : '';
  const labFile = req.files['labFile'] ? req.files['labFile'][0].filename
