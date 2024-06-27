const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));

// Database connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "m@o#n&i!1504MONI",
  port: 15411,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'MoniChaurasiyaNikkiShuklaSanchiDehmukhPritiJaswar',
  resave: false,
  saveUninitialized: true
}));

// Signup route
app.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)';
    await pool.query(query, [first_name, last_name, email, hashedPassword]);
    res.send('User created successfully!');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/logSign.html');
  
  });
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send('Invalid email or password');
    }

    req.session.userId = user.id;
    res.send('Login successful!');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Check if user is logged in
app.get('/checkLogin', (req, res) => {
  if (req.session.userId) {
    res.send('User is logged in');
  } else {
    res.status(401).send('User is not logged in');
  }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });