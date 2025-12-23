const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tokens.json');
const POSTER_FILE = path.join(__dirname, 'poster.svg');

function readData(){
  try{ return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'{}'); }catch(e){ return {}; }
}
function writeData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2)); }

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Serve frontend static files
app.use(express.static(path.join(__dirname)));

app.post('/confirm-payment', (req,res)=>{
  const { name, email, mobile, txnId, amount } = req.body || {};
  if(!txnId || !mobile){
    return res.status(400).json({ error: 'txnId and mobile required' });
  }

  const token = uuidv4();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

  const data = readData();
  data[token] = {
    file: 'poster.svg',
    createdAt: Date.now(),
    expiresAt,
    used: false,
    meta: { name, email, mobile, txnId, amount }
  };
  writeData(data);

  const downloadUrl = `/download/${token}`;
  // Return the download URL (relative) and the WhatsApp notify URL for convenience
  const sellerNumber = '917410514965'; // country+number (assumes +91)
  const message = encodeURIComponent(`Payment received. Txn: ${txnId}. Buyer: ${name || ''} ${mobile || ''}`);
  const wa = `https://wa.me/${sellerNumber}?text=${message}`;

  return res.json({ downloadUrl, wa });
});

app.get('/download/:token', (req,res)=>{
  const token = req.params.token;
  const data = readData();
  const entry = data[token];
  if(!entry) return res.status(404).send('Invalid or expired link');
  if(entry.used) return res.status(410).send('This download link has already been used');
  if(Date.now() > entry.expiresAt) return res.status(410).send('This download link has expired');

  // Mark used
  entry.used = true;
  data[token] = entry;
  writeData(data);

  // Serve the poster file as an attachment
  res.download(POSTER_FILE, 'digital-poster.svg');
});

app.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});
