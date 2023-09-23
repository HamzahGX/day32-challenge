const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const csurf = require('csurf');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'POKEMON',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true, maxAge: 600000 } // Secure session settings
}));
app.use(csurf({ cookie: true }));

// In-memory user database (for demonstration)
const users = [
  { username: 'admin', passwordHash: '#1#OKAYokay#1#' }, 
];

// Helper function to verify user credentials
async function verifyUser(username, password) {
  const user = users.find((user) => user.username === username);
  if (!user) return false;
  return await bcrypt.compare(password, user.passwordHash);
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Secure Node.js Application');
});

app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <input type="hidden" name="_csrf" value="${req.csrfToken()}"> <!-- CSRF token -->
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const isAuthenticated = await verifyUser(username, password);

  if (isAuthenticated) {
    req.session.authenticated = true;
    req.session.username = username; // Store username in the session
    res.redirect('/profile');
  } else {
    res.send('Invalid username or password');
  }
});

app.get('/profile', (req, res) => {
  if (req.session.authenticated) {
    res.send(`<h1>Welcome to your profile, ${req.session.username}</h1>`);
  } else {
    res.redirect('/login');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
