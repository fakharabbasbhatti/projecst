/**
 * MediCare Elite — script.js
 * Handles: Navbar, Animations, Counters, Appointment Booking,
 *          Payment, Form Validation, Theme Toggle, Scroll, etc.
 */

'use strict';

/* ==========================================
   UTILS
   ========================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ==========================================
   NAVBAR — SCROLL SHRINK & ACTIVE LINKS
   ========================================== */
const nav = $('#mainNav');
const navLinks = $$('.nav-link');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);

  // Update active nav link based on scroll position
  const scrollPos = window.scrollY + 100;
  $$('section[id]').forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${section.id}`) a.classList.add('active');
      });
    }
  });

  // Scroll to top button
  const btn = $('#scrollTopBtn');
  if (btn) btn.classList.toggle('visible', window.scrollY > 300);
});

/* ==========================================
   SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ========================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav ? nav.offsetHeight : 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    // Close mobile nav if open
    const collapse = document.querySelector('.navbar-collapse');
    if (collapse && collapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(collapse);
      if (bsCollapse) bsCollapse.hide();
    }
  });
});

/* ==========================================
   ANIMATED COUNTERS
   ========================================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const step = 30;
  const increment = target / (duration / step);
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, step);
}

/* ==========================================
   INTERSECTION OBSERVER — Lazy animations & counters
   ========================================== */
const aosObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
      aosObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-aos]').forEach((el, i) => {
  // Respect data-aos-delay attribute
  const delay = parseInt(el.dataset.aosDelay || 0, 10);
  el.style.transitionDelay = delay + 'ms';
  aosObserver.observe(el);
});

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ==========================================
   THEME TOGGLE (Dark / Light)
   ========================================== */
const themeToggle = $('#themeToggle');
const themeIcon = $('#themeIcon');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('medicare-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

on(themeToggle, 'click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('medicare-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (!themeIcon) return;
  themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ==========================================
   APPOINTMENT FORM
   ========================================== */
const doctorsByDept = {
  cardiology:   ['Dr. Amir Khan — Cardiologist', 'Dr. Tariq Mehmood — Interventional Cardiologist'],
  neurology:    ['Dr. Sara Malik — Chief Neurologist', 'Dr. Bilal Akhtar — Neuro Surgeon'],
  orthopedics:  ['Dr. Hassan Qureshi — Orthopedic Surgeon', 'Dr. Usman Farooq — Spine Specialist'],
  pediatrics:   ['Dr. Ayesha Raza — Pediatric Specialist', 'Dr. Zara Siddiqui — Neonatologist'],
  dental:       ['Dr. Rafia Noor — Cosmetic Dentist', 'Dr. Kamran Shah — Orthodontist'],
  emergency:    ['Dr. Ali Hassan — Emergency Physician (24/7)', 'Dr. Sadia Ali — Trauma Surgeon'],
  icu:          ['Dr. Naveed Ahmed — Intensivist', 'Dr. Hina Batool — Critical Care Specialist'],
};
const feeBydept = {
  cardiology: 2500, neurology: 2000, orthopedics: 1800,
  pediatrics: 1200, dental: 1500, emergency: 3000, icu: 4000,
};

const deptSelect = $('#department');
const doctorSelect = $('#doctor');

on(deptSelect, 'change', () => {
  const dept = deptSelect.value;
  doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
  if (dept && doctorsByDept[dept]) {
    doctorsByDept[dept].forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc; opt.textContent = doc;
      doctorSelect.appendChild(opt);
    });
  }
  // Update payment fee based on department
  if (dept && feeBydept[dept]) {
    const fee = feeBydept[dept];
    updatePaymentFee(fee);
  }
  checkAvailability();
});

// Update fee summary dynamically
function updatePaymentFee(fee) {
  const tax = Math.round(fee * 0.05);
  const total = fee + 200 + tax;
  const consultFeeEl = $('#consultFee');
  const taxEl = $('#taxAmount');
  const totalEl = $('#totalAmount');
  const payBtn = $('#payBtnAmount');
  if (consultFeeEl) consultFeeEl.textContent = `Rs. ${fee.toLocaleString()}`;
  if (taxEl) taxEl.textContent = `Rs. ${tax.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;
  if (payBtn) payBtn.textContent = `Rs. ${total.toLocaleString()}`;
}

// Appointment date/time change
['#apptDate', '#apptTime'].forEach(sel => {
  const el = $(sel);
  on(el, 'change', checkAvailability);
});

// Set minimum date to today
const apptDateInput = $('#apptDate');
if (apptDateInput) {
  const today = new Date().toISOString().split('T')[0];
  apptDateInput.setAttribute('min', today);
}

function checkAvailability() {
  const indicator = $('#availabilityIndicator');
  if (!indicator) return;
  const date = $('#apptDate')?.value;
  const time = $('#apptTime')?.value;
  if (!date || !time) {
    indicator.innerHTML = '<i class="fa-solid fa-circle-info text-primary"></i><span>Select date & time to check availability</span>';
    return;
  }
  // Simulate availability check
  const busy = ['09:00', '14:00'];
  if (busy.includes(time)) {
    indicator.innerHTML = '<i class="fa-solid fa-circle-xmark text-danger"></i><span>This slot is fully booked — please choose another time.</span>';
  } else {
    indicator.innerHTML = '<i class="fa-solid fa-circle-check text-success"></i><span>Slot available! Confirm your booking below.</span>';
  }
}

// Appointment form submission
const apptForm = $('#appointmentForm');
on(apptForm, 'submit', e => {
  e.preventDefault();
  if (!validateForm(apptForm)) return;

  const name    = $('#patientName')?.value?.trim();
  const phone   = $('#patientPhone')?.value?.trim();
  const dept    = $('#department')?.value;
  const doctor  = $('#doctor')?.value;
  const date    = $('#apptDate')?.value;
  const time    = $('#apptTime')?.value;

  if (!name || !phone || !dept || !doctor || !date || !time) {
    showToast('Please fill in all required fields.', 'danger');
    return;
  }

  // Show loading state
  const btn = $('#bookBtn');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-calendar-check me-2"></i>Confirm Appointment';
    btn.disabled = false;

    // Build confirmation details
    const details = $('#apptConfirmDetails');
    if (details) {
      details.innerHTML = `
        <div class="confirm-row"><span>Patient Name</span><strong>${name}</strong></div>
        <div class="confirm-row"><span>Phone</span><strong>${phone}</strong></div>
        <div class="confirm-row"><span>Department</span><strong>${dept.charAt(0).toUpperCase()+dept.slice(1)}</strong></div>
        <div class="confirm-row"><span>Doctor</span><strong>${doctor}</strong></div>
        <div class="confirm-row"><span>Date</span><strong>${formatDate(date)}</strong></div>
        <div class="confirm-row"><span>Time</span><strong>${formatTime(time)}</strong></div>
        <div class="confirm-row"><span>Reference ID</span><strong>#MCE-${Math.floor(Math.random()*90000)+10000}</strong></div>
      `;
    }

    const modal = new bootstrap.Modal('#apptModal');
    modal.show();
    apptForm.reset();
  }, 1800);
});

/* ==========================================
   PAYMENT
   ========================================== */
let currentPayMethod = 'jazzcash';

window.selectPayment = function(el, method) {
  currentPayMethod = method;
  $$('.pay-method').forEach(m => m.classList.remove('active'));
  el.classList.add('active');
  const cardFields = $('#cardFields');
  const mobileFields = $('#mobileFields');
  if (method === 'card') {
    cardFields.classList.remove('d-none');
    if (mobileFields) mobileFields.classList.add('d-none');
  } else {
    cardFields.classList.add('d-none');
    if (mobileFields) mobileFields.classList.remove('d-none');
  }
};

window.processPayment = function() {
  const payBtn = $('#payBtn');
  const mobileNum = $('#mobilePayNum')?.value?.trim();
  const cardNum = $('#cardNum')?.value?.trim();

  if (currentPayMethod !== 'card' && !mobileNum) {
    showToast('Please enter your registered mobile number.', 'danger');
    return;
  }
  if (currentPayMethod === 'card' && (!cardNum || cardNum.length < 16)) {
    showToast('Please enter a valid card number.', 'danger');
    return;
  }

  payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing Payment...';
  payBtn.disabled = true;

  setTimeout(() => {
    payBtn.innerHTML = '<i class="fa-solid fa-lock me-2"></i>Pay Securely — <span id="payBtnAmount">' + ($('#payBtnAmount')?.textContent || 'Rs. 1,785') + '</span>';
    payBtn.disabled = false;

    const invoice = $('#invoiceCard');
    if (invoice) {
      const txnId = 'TXN' + Date.now().toString().slice(-8);
      const method = currentPayMethod === 'jazzcash' ? 'JazzCash' : currentPayMethod === 'easypaisa' ? 'EasyPaisa' : 'Credit/Debit Card';
      invoice.innerHTML = `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border)">
          <span>Transaction ID</span><strong>${txnId}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border)">
          <span>Payment Method</span><strong>${method}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--border)">
          <span>Date</span><strong>${new Date().toLocaleDateString('en-PK')}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;color:var(--primary);font-weight:700">
          <span>Amount Paid</span><strong>${$('#totalAmount')?.textContent || 'Rs. 1,785'}</strong>
        </div>
      `;
    }

    new bootstrap.Modal('#payModal').show();
  }, 2000);
};

// Card number formatting
const cardNumInput = $('#cardNum');
on(cardNumInput, 'input', () => {
  let val = cardNumInput.value.replace(/\D/g, '').slice(0, 16);
  cardNumInput.value = val.replace(/(.{4})/g, '$1 ').trim();
});

/* ==========================================
   AMBULANCE BOOKING
   ========================================== */
window.bookAmbulance = function() {
  // Simple prompt flow
  const confirmed = confirm('🚑 Book Emergency Ambulance?\n\nClick OK to connect with our dispatch center.\nAlternatively call: +92-300-1111-MED');
  if (confirmed) {
    showToast('Connecting to dispatch center... Please call +92-300-1111-MED for fastest response.', 'danger');
  }
};

/* ==========================================
   PRINT RECEIPT
   ========================================== */
window.printReceipt = function() {
  const details = $('#apptConfirmDetails');
  if (!details) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>MediCare Elite — Appointment Receipt</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #1a2b3c; }
      .header { text-align: center; border-bottom: 2px solid #0a7ea4; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #0a7ea4; font-size: 1.8rem; margin-bottom: 6px; }
      .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #dde8f0; }
      .footer { text-align: center; margin-top: 40px; color: #6b8090; font-size: .88rem; }
    </style></head><body>
    <div class="header">
      <h1>❤ MediCare Elite Hospital</h1>
      <p>Appointment Confirmation Receipt</p>
      <p>123 Medical Plaza, Lahore, Pakistan | Tel: +92-42-111-MEDICARE</p>
    </div>
    ${details.innerHTML.replace(/confirm-row/g, 'row')}
    <div class="footer">
      <p>Thank you for choosing MediCare Elite. Please arrive 15 minutes before your appointment.</p>
      <p>Printed on: ${new Date().toLocaleString('en-PK')}</p>
    </div>
    </body></html>
  `);
  win.document.close();
  win.print();
};

/* ==========================================
   CONTACT FORM
   ========================================== */
const contactForm = $('#contactForm');
on(contactForm, 'submit', e => {
  e.preventDefault();
  showToast('Your message has been sent! We will get back to you within 24 hours.', 'success');
  contactForm.reset();
});

/* ==========================================
   FORM VALIDATION HELPER
   ========================================== */
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    if (!input.value.trim()) {
      input.closest('.input-group-med')?.classList.add('error');
      valid = false;
    } else {
      input.closest('.input-group-med')?.classList.remove('error');
    }
  });
  return valid;
}

/* ==========================================
   TOAST NOTIFICATIONS
   ========================================== */
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.med-toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#27ae60', icon: 'fa-circle-check' },
    danger:  { bg: '#e74c3c', icon: 'fa-circle-xmark' },
    info:    { bg: '#0a7ea4', icon: 'fa-circle-info' },
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.className = 'med-toast';
  toast.innerHTML = `<i class="fa-solid ${c.icon}"></i> <span>${msg}</span>`;
  toast.style.cssText = `
    position: fixed; bottom: 90px; right: 30px; z-index: 9999;
    background: ${c.bg}; color: #fff;
    padding: 14px 22px; border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    font-size: .93rem; font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,.25);
    max-width: 360px; line-height: 1.5;
    animation: slideInToast .35s cubic-bezier(.4,0,.2,1);
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes slideInToast { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`;
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all .35s ease';
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}

/* ==========================================
   DATE / TIME FORMATTERS
   ========================================== */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/* ==========================================
   GALLERY — Lightbox (simple)
   ========================================== */
$$('.gallery-item').forEach(item => {
  on(item, 'click', () => {
    const img = item.querySelector('img');
    const label = item.querySelector('.gallery-overlay span')?.textContent;
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.9);
      display:flex; align-items:center; justify-content:center;
      z-index:9999; cursor:zoom-out; flex-direction:column; gap:14px;
    `;
    const imgEl = document.createElement('img');
    imgEl.src = img.src.replace('w=500', 'w=1200').replace('w=400', 'w=1000');
    imgEl.style.cssText = 'max-width:90vw; max-height:80vh; border-radius:12px; object-fit:contain;';
    const cap = document.createElement('span');
    cap.textContent = label || '';
    cap.style.cssText = 'color:#fff; font-size:1rem; font-weight:600;';
    overlay.append(imgEl, cap);
    on(overlay, 'click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});

/* ==========================================
   NEWSLETTER FORM
   ========================================== */
const newsForm = document.querySelector('.newsletter-form');
on(newsForm, 'submit', e => {
  e?.preventDefault();
});
const newsBtn = newsForm?.querySelector('.btn');
on(newsBtn, 'click', () => {
  const input = newsForm?.querySelector('input');
  if (!input?.value.trim() || !input.value.includes('@')) {
    showToast('Please enter a valid email address.', 'danger');
    return;
  }
  showToast('Subscribed successfully! Stay healthy! 🩺', 'success');
  input.value = '';
});

/* ==========================================
   INIT ON DOM READY
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Fire AOS for elements already in view
  setTimeout(() => {
    $$('[data-aos]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) el.classList.add('aos-animate');
    });
  }, 100);

  console.log('%c💉 MediCare Elite Hospital — Loaded Successfully', 'color:#0a7ea4;font-weight:bold;font-size:14px');
});