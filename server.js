const express = require('express'); 
const app = express();
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt'); // Correct import for express-jwt v6+
const path = require('path');

// Use express built-in middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Adjust to match your frontend's protocol and domain
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const PORT = 3000;
const secretKey = 'My super secret key';

// JWT Middleware (Updated)
const jwtMiddleware = expressjwt({
    secret: secretKey,
    algorithms: ['HS256'],
});

// User data for authentication
let users = [
    {
        id: 1,
        username: 'Rohith',
        password: '123'
    },
    {
        id: 2,
        username: 'Surya',
        password: '456'
    }
];

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let userFound = false;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token
            });
            userFound = true;
            break;
        }
    }

    if (!userFound) {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

// Protected Dashboard Route
app.get('/api/dashboard', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged-in users can see'
    });
});

// Protected Settings Route
app.get('/api/settings', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        settingsContent: 'This is a protected settings page'
    });
});

// Serve Index File
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error Handling Middleware for Unauthorized Access
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized access, invalid token'
        });
    } else {
        next(err);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
