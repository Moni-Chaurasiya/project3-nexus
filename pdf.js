const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// PostgreSQL database configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "m@o#n&i!1504MONI",
  port: 15411,
});
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process on unexpected errors
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);

});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/service.html');

});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post('/submit_payment', upload.single('paymentPDF'), async (req, res) => {
  const { name, receiptNumber } = req.body;
  const paymentPdfPath = req.file.path;

  try {
    const result = await pool.query(
      'INSERT INTO user_information (name, receipt_number, payment_pdf_path) VALUES ($1, $2, $3) RETURNING *',
      [name, receiptNumber, paymentPdfPath]
    );

    res.status(201).json({ message: 'User information submitted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});