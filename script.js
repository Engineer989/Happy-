// Configuration
const CONTACT_NUMBER = '7410514965';
const COUNTRY_CODE = '91';
const UPI_ID = `${CONTACT_NUMBER}@upi`;
const PRODUCT_NAME = 'Digital Poster';
const PRICE = '199';

// Build UPI deep link
function buildUpiLink(amount = ''){
  const pa = encodeURIComponent(UPI_ID);
  const pn = encodeURIComponent(PRODUCT_NAME);
  const am = amount ? `&am=${encodeURIComponent(amount)}` : '';
  return `upi://pay?pa=${pa}&pn=${pn}${am}&cu=INR`;
}

// Populate QR using Google Chart API (simple approach)
function buildQrUrl(link){
  return 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + encodeURIComponent(link);
}

document.addEventListener('DOMContentLoaded', ()=>{
  // UPI link and QR
  const upiLink = buildUpiLink(PRICE);
  const upiAnchor = document.getElementById('upiLink');
  upiAnchor.setAttribute('href', upiLink);
  upiAnchor.addEventListener('click', (e)=>{
    // allow default to attempt to open app on mobile; prevent navigation in desktop
  });
  document.getElementById('qrImg').src = buildQrUrl(upiLink);

  // Visitor counting (per-browser simple counter)
  updateVisitorCounts();

  // Form handling
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const entry = {
      name: data.get('name'),
      email: data.get('email'),
      mobile: data.get('mobile'),
      address: data.get('address'),
      district: data.get('district'),
      state: data.get('state'),
      ts: new Date().toISOString()
    };
    saveContact(entry);
    formMsg.textContent = 'Order details saved locally. Click "I\'ve Paid — Notify Seller" after payment.';
    form.reset();
  });

  // Paid / notify seller button -> confirm payment with server to get download link
  document.getElementById('paidBtn').addEventListener('click', async ()=>{
    const contacts = JSON.parse(localStorage.getItem('contacts')||'[]');
    const last = contacts[contacts.length-1];
    if(!last){
      alert('Please submit your order details first using the form.');
      return;
    }

    const txnId = prompt('Enter UPI transaction/ref ID you received after payment:');
    if(!txnId){
      alert('Transaction ID is required to confirm payment.');
      return;
    }

    try{
      const resp = await fetch('/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: last.name,
          email: last.email,
          mobile: last.mobile,
          txnId,
          amount: PRICE
        })
      });
      if(!resp.ok) throw new Error('Server error');
      const json = await resp.json();
      // Open download link and WhatsApp notification
      if(json.downloadUrl) window.open(json.downloadUrl, '_blank');
      if(json.wa) window.open(json.wa, '_blank');
    }catch(err){
      alert('Unable to confirm payment: ' + (err.message||err));
    }
  });
});

function saveContact(entry){
  const contacts = JSON.parse(localStorage.getItem('contacts')||'[]');
  contacts.push(entry);
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Visitor counting functions (stored per-date in localStorage)
function todayKey(){
  const d = new Date();
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}
function monthKey(){
  const d = new Date();
  return d.toISOString().slice(0,7); // YYYY-MM
}

function updateVisitorCounts(){
  const counts = JSON.parse(localStorage.getItem('visitorCounts')||'{}');
  const tKey = todayKey();
  const mKey = monthKey();

  // Only increment once per session for this browser
  const sessionFlag = sessionStorage.getItem('visited_' + tKey);
  if(!sessionFlag){
    counts[tKey] = (counts[tKey]||0) + 1;
    localStorage.setItem('visitorCounts', JSON.stringify(counts));
    sessionStorage.setItem('visited_' + tKey, '1');
  }

  // daily
  const daily = counts[tKey] || 0;
  document.getElementById('dailyCount').textContent = daily;

  // monthly: sum keys that start with mKey
  let monthly = 0;
  Object.keys(counts).forEach(k=>{ if(k.startsWith(mKey)) monthly += counts[k]; });
  document.getElementById('monthlyCount').textContent = monthly;
}
