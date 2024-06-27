const http = require('http')
const fs = require('fs')
const fileContent = fs.readFileSync('contact.html')
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "m@o#n&i!1504MONI",
  port: 15411,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Attempt to connect for 2 seconds
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process on unexpected errors
});




app.get('/', (req, res) => {
  res.sendFile(__dirname + '/contact.html');

});

app.post('/submit', async (req, res) => {
  const { name, email, message, telephone, rating } = req.body;

  try {

    const result = await pool.query(
      'INSERT INTO contacts (name, email, message, tel, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, message, telephone, rating]
    );


    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error inserting data into PostgreSQL:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
