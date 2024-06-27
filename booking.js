const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
    res.sendFile(__dirname + '/service.html');

});

app.post('/submit_booking', async (req, res) => {
    const {
        'event-name': event_name,
        'event-date': event_date,
        venue,
        'full-name': full_name,
        email,
        phone,
        address,
        'ticket-type': ticket_type,
        quantity,
        'billing-address': billing_address,
        terms,
    } = req.body;

    try {
        const eventDate = new Date(event_date);

        const result = await pool.query(
            'INSERT INTO bookings (event_name, event_date, venue, full_name, email, phone, address, ticket_type, quantity, billing_address, terms_agreed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [event_name, eventDate, venue, full_name, email, phone, address, ticket_type, quantity, billing_address, terms === 'on']
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error inserting data into PostgreSQL:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});