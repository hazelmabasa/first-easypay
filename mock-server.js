// Express backend: register, login, balance, send
// File: mock-server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = {}; // Store users: { phone: { phone, email, balances, history[] } }

// Register user
app.post('/register', (req, res) => {
  const { phone, email } = req.body;
  if (users[phone]) return res.status(400).json({ error: 'User already exists' });

  users[phone] = {
    phone,
    email,
    balances: { ZAR: 1000, USD: 100, XRP: 100, XLM: 200, BTC: 0.01 },
    history: []
  };

  res.json({ message: 'User registered', user: users[phone] });
});

// Login user
app.post('/login', (req, res) => {
  const { phone, email } = req.body;
  const user = users[phone];

  if (!user || user.email !== email) {
    return res.json({ success: false });
  }

  res.json({ success: true, user });
});

// Get balances
app.get('/balance/:phone', (req, res) => {
  const user = users[req.params.phone];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.balances);
});

// Get history
app.get('/history/:phone', (req, res) => {
  const user = users[req.params.phone];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.history);
});

// Send asset
app.post('/send-asset', (req, res) => {
  const { senderPhone, recipientPhone, asset, amount, note } = req.body;
  const sender = users[senderPhone];
  const recipient = users[recipientPhone];

  if (!sender || !recipient) return res.status(404).json({ error: 'User not found' });
  if (!sender.balances[asset]) sender.balances[asset] = 0;
  if (!recipient.balances[asset]) recipient.balances[asset] = 0;
  if (sender.balances[asset] < amount) return res.status(400).json({ error: `Insufficient ${asset}` });

  sender.balances[asset] -= amount;
  recipient.balances[asset] += amount;

  const tx = {
    type: "send",
    asset,
    amount,
    to: recipientPhone,
    date: new Date().toISOString(),
    note: note || ''
  };
  sender.history.push(tx);
  recipient.history.push({ ...tx, type: "receive", from: senderPhone, note: note || '' });

  res.json({ message: `${asset} sent successfully`, from: senderPhone, to: recipientPhone, amount });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ EasyPay mock backend running on port ${PORT}`));

