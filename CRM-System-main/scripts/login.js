
const logoHome = document.getElementById('logo');
if (logoHome){
  logoHome.addEventListener('click', () => {
    try{ window.location.href = './login.html'; }catch(e){}
  });

}

// Toast helper: non-blocking alerts shown in the corner
function showToast(message, type = 'info', timeout = 4000){
  try{
    const container = document.getElementById('toast-container');
    if (!container) { window.alert(message); return; }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-hide`;
    const icon = document.createElement('div'); icon.className = 't-icon';
    // simple icons (SVG strings)
    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#034d2b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#7b1d0e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#1e3a8a" stroke-width="1.5"/><path d="M11 11h1v4h1" stroke="#1e3a8a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7h.01" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    icon.innerHTML = icons[type] || icons.info;
    const body = document.createElement('div'); body.className = 't-body'; body.textContent = message;
    const close = document.createElement('button'); close.className = 't-close'; close.setAttribute('aria-label','Dismiss notification'); close.innerHTML = '✕';
    close.addEventListener('click', () => { hideToast(toast); });
    toast.appendChild(icon); toast.appendChild(body); toast.appendChild(close);
    container.appendChild(toast);
    // force layout then show
    requestAnimationFrame(()=>{ toast.classList.remove('toast-hide'); toast.classList.add('toast-show'); });
    const tid = setTimeout(()=> hideToast(toast), timeout);
    // store timer on element
    toast._timeout = tid;
    return toast;
  }catch(e){ console.error(e); try{ window.alert(message); }catch(_){} }
}

function hideToast(toast){
  try{
    if (!toast) return;
    clearTimeout(toast._timeout);
    toast.classList.remove('toast-show'); toast.classList.add('toast-hide');
    setTimeout(()=>{ try{ toast.remove(); }catch(e){} }, 260);
  }catch(e){}
}

// Dark mode removed: always use light styles


const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");


signupBtn.onclick = (() => {
  // use class-based animation so CSS controls layout
  document.body.classList.add('signup-active');
  // sync radio input for visual consistency
  try{ const r = document.getElementById('signup'); if (r) r.checked = true; }catch(e){}
  // clear any previous inline errors
  try{ document.getElementById('login-error').textContent = ''; document.getElementById('signup-error').textContent = ''; }catch(e){}
});


loginBtn.onclick = (() => {
  document.body.classList.remove('signup-active');
  try{ const r = document.getElementById('login'); if (r) r.checked = true; }catch(e){}
  try{ document.getElementById('login-error').textContent = ''; document.getElementById('signup-error').textContent = ''; }catch(e){}
});


signupLink.onclick = (() => {
  signupBtn.click();
  return false;
});

const adminData = { "username": "Luna", "password": "LUNALUNA" };

const loginFormBtn = loginForm.querySelector("input[type='submit']");
const loginUsername = loginForm.querySelector("input[type='email']");

localStorage.setItem('username', loginUsername.value);

const loginPassword = loginForm.querySelector("input[type='password']");

loginFormBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const loginErrorEl = document.getElementById('login-error');
  if (loginErrorEl) loginErrorEl.textContent = '';
  if (loginUsername.value == "" || loginPassword.value == "") {
    if (loginErrorEl) loginErrorEl.textContent = 'Please fill the email and password.';
    return;
  }
  else if (loginUsername.value === adminData.username && loginPassword.value === adminData.password) {
    // mark authenticated and store username
    try{ localStorage.setItem('auth', '1'); localStorage.setItem('username', adminData.username); }catch(e){}
    showToast('Welcome Admin', 'success', 2000);
    setTimeout(()=>{ window.location.href = "./admin.html"; }, 700);
  }
  else {
    fetch("https://crm-system-9eof.onrender.com/users")
      .then(res => res.json())
      .then((data) => {
        let userFound = false;
        for (let i = 0; i < data.length; i++) {
          if ((data[i].email == loginUsername.value && data[i].password == loginPassword.value)) {
            console.log(data)
            try{ localStorage.setItem("username", JSON.stringify(data[i].name)); localStorage.setItem('auth','1'); }catch(e){}
            showToast(`Welcome Back ${data[i].name}`, 'success', 1800);
            setTimeout(()=>{ window.location.href = "./dashboard.html"; }, 700);
            userFound = true;
            break;
          }
        }
        if (!userFound) {
          if (loginErrorEl) loginErrorEl.textContent = 'Wrong credentials.';
          loginForm.reset();
        }
      })
      .catch(err => console.log(err))
  }

})


let signUpForm = document.querySelector('form.signup');
let signUpFormBtn = signUpForm.querySelector("input[type='submit']");
let signUpName = signUpForm.querySelector("input[type='text']");
let signUpEmail = signUpForm.querySelector("input[type='email']");
let signUpPassword = document.getElementById("password")
let signUpConfirmPassword = document.getElementById("confirm-password")

// Password strength UI elements
const psBox = document.getElementById('password-strength');
const psLength = document.getElementById('ps-length');
const psLower = document.getElementById('ps-lower');
const psUpper = document.getElementById('ps-upper');
const psNumber = document.getElementById('ps-number');
const psSpecial = document.getElementById('ps-special');

function validatePasswordRules(pw){
  return {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#\$%\^&\*\(\)\[\]\-_+=~`|:;"'<>,\.\/\\?]/.test(pw)
  };
}

function updatePasswordUI(pw){
  if (!psBox) return;
  const r = validatePasswordRules(pw);
  psBox.hidden = pw.length === 0;
  psLength.classList.toggle('valid', r.length);
  psLower.classList.toggle('valid', r.lower);
  psUpper.classList.toggle('valid', r.upper);
  psNumber.classList.toggle('valid', r.number);
  psSpecial.classList.toggle('valid', r.special);
  return r;
}

if (signUpPassword){
  signUpPassword.addEventListener('input', (e)=>{
    updatePasswordUI(e.target.value);
  });
}

signUpFormBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const signupErrorEl = document.getElementById('signup-error');
  if (signupErrorEl) signupErrorEl.textContent = '';
  if (signUpName.value == "" || signUpEmail.value == "" || signUpPassword.value == "" || signUpConfirmPassword.value == "") {
    if (signupErrorEl) signupErrorEl.textContent = 'Please fill all required details.';
    return;
  }

  // Validate password strength
  const rules = validatePasswordRules(signUpPassword.value);
  const allOk = rules.length && rules.lower && rules.upper && rules.number && rules.special;
  if (!allOk) {
    if (signupErrorEl) signupErrorEl.textContent = 'Password is not strong enough. Please follow the requirements.';
    updatePasswordUI(signUpPassword.value);
    return;
  }

  if (signUpPassword.value !== signUpConfirmPassword.value) {
    if (signupErrorEl) signupErrorEl.textContent = 'Passwords do not match.';
    return;
  }

  // proceed with signup
  else {
    let newSignUp = {
      name: signUpName.value,
      email: signUpEmail.value,
      password: signUpPassword.value
    };
    fetch("https://crm-system-9eof.onrender.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newSignUp)
    })
      .then(res => res.json())
      .then(data => {
  if (signupErrorEl) signupErrorEl.textContent = '';
  showToast('Signup successful! Logging you in...', 'success', 1800);
        // set auth and username then redirect to dashboard
        try{ localStorage.setItem('auth','1'); localStorage.setItem('username', JSON.stringify(data.name || signUpName.value)); }catch(e){}
        setTimeout(()=>{ window.location.href = './dashboard.html'; }, 800);
      })
      .catch(error => console.error(error));
  }
});

// dark mode toggle removed to keep UI consistent and lighter

// Forgot password flow: show an in-page modal with verification code and rate-limiting
const forgotLink = document.querySelector('.pass-link a');
const apiUsers = "https://crm-system-9eof.onrender.com/users";

// Elements for reset modal
const resetBackdrop = document.getElementById('reset-backdrop');
const resetModal = document.getElementById('resetModal');
const resetEmail = document.getElementById('reset-email');
const sendCodeBtn = document.getElementById('send-code');
const sendStatus = document.getElementById('send-status');
const resetCodeInput = document.getElementById('reset-code');
const resetNewPass = document.getElementById('reset-newpass');
const resetConfirm = document.getElementById('reset-confirm');
const resetSubmit = document.getElementById('reset-submit');
const resetCancel = document.getElementById('reset-cancel');
const resetError = document.getElementById('reset-error');
const resetDebug = document.getElementById('reset-debug');
const resetPSBox = document.getElementById('reset-password-strength');
const rPsLength = document.getElementById('r-ps-length');
const rPsLower = document.getElementById('r-ps-lower');
const rPsUpper = document.getElementById('r-ps-upper');
const rPsNumber = document.getElementById('r-ps-number');
const rPsSpecial = document.getElementById('r-ps-special');

function openResetModal(){
  if (resetBackdrop) resetBackdrop.hidden = false;
  if (resetModal) resetModal.hidden = false;
  if (resetError) resetError.textContent = '';
  if (sendStatus) sendStatus.textContent = '';
  if (resetDebug) { resetDebug.style.display = 'none'; resetDebug.textContent = ''; }
  if (resetEmail) resetEmail.value = '';
  if (resetCodeInput) resetCodeInput.value = '';
  if (resetNewPass) resetNewPass.value = '';
  if (resetConfirm) resetConfirm.value = '';
  if (resetPSBox) resetPSBox.hidden = true;
}

function closeResetModal(){
  if (resetBackdrop) resetBackdrop.hidden = true;
  if (resetModal) resetModal.hidden = true;
}

function updateResetPasswordUI(pw){
  if (!resetPSBox) return;
  const r = validatePasswordRules(pw);
  resetPSBox.hidden = pw.length === 0;
  rPsLength.classList.toggle('valid', r.length);
  rPsLower.classList.toggle('valid', r.lower);
  rPsUpper.classList.toggle('valid', r.upper);
  rPsNumber.classList.toggle('valid', r.number);
  rPsSpecial.classList.toggle('valid', r.special);
  return r;
}

if (resetNewPass){
  resetNewPass.addEventListener('input', (e)=> updateResetPasswordUI(e.target.value));
}

// Rate limiting helpers (keeps state in sessionStorage for demo)
function canSendCode(email){
  try{
    const key = 'pwResetStore';
    const now = Date.now();
    const raw = sessionStorage.getItem(key) || '{}';
    const store = JSON.parse(raw);
    const entry = store[email] || { history: [], lastSent: 0 };
    // prune history older than 1 hour
    entry.history = entry.history.filter(ts => now - ts < 60*60*1000);
    if (entry.history.length >= 5) return { ok:false, reason: 'hour_limit' };
    if (now - (entry.lastSent || 0) < 60*1000) return { ok:false, reason: 'wait', wait: Math.ceil((60*1000 - (now - entry.lastSent))/1000) };
    return { ok:true };
  }catch(e){ return { ok:true } }
}

function recordSend(email){
  try{
    const key = 'pwResetStore';
    const now = Date.now();
    const raw = sessionStorage.getItem(key) || '{}';
    const store = JSON.parse(raw);
    const entry = store[email] || { history: [], lastSent: 0 };
    entry.history = entry.history.filter(ts => now - ts < 60*60*1000);
    entry.history.push(now);
    entry.lastSent = now;
    store[email] = entry;
    sessionStorage.setItem(key, JSON.stringify(store));
  }catch(e){}
}

function storeCodeForEmail(email, code){
  try{
    const key = 'pwResetCodes';
    const now = Date.now();
    const raw = sessionStorage.getItem(key) || '{}';
    const store = JSON.parse(raw);
    store[email] = { code, expires: now + (10*60*1000) }; // 10 minutes
    sessionStorage.setItem(key, JSON.stringify(store));
  }catch(e){}
}

function getCodeForEmail(email){
  try{
    const key = 'pwResetCodes';
    const now = Date.now();
    const raw = sessionStorage.getItem(key) || '{}';
    const store = JSON.parse(raw);
    const entry = store[email];
    if (!entry) return null;
    if (now > entry.expires) { delete store[email]; sessionStorage.setItem(key, JSON.stringify(store)); return null; }
    return entry.code;
  }catch(e){ return null }
}

async function sendVerificationCode(){
  if (!resetEmail) return;
  const email = resetEmail.value && resetEmail.value.trim();
  if (!email) { if (resetError) resetError.textContent = 'Please enter your email.'; return; }
  if (resetError) resetError.textContent = '';
  const rl = canSendCode(email);
  if (!rl.ok){
    if (rl.reason === 'wait') { if (sendStatus) sendStatus.textContent = `Please wait ${rl.wait}s before requesting another code.`; }
    else if (rl.reason === 'hour_limit') { if (sendStatus) sendStatus.textContent = `You've reached the limit for code requests. Try again later.`; }
    return;
  }

  // Verify account exists
  try{
    sendCodeBtn.disabled = true;
    sendStatus.textContent = 'Checking account...';
    const res = await fetch(`${apiUsers}?email=${encodeURIComponent(email)}`);
    const users = await res.json();
    if (!users || users.length === 0) {
      if (resetError) resetError.textContent = 'No account found with that email.';
      sendStatus.textContent = '';
      sendCodeBtn.disabled = false;
      return;
    }
    // generate 6-digit code
    const code = Math.floor(100000 + Math.random()*900000).toString();
    storeCodeForEmail(email, code);
    recordSend(email);
    // For demo without real email delivery, show the code in a debug area and console.log
    if (resetDebug) { resetDebug.style.display = 'block'; resetDebug.textContent = `Demo code: ${code}`; }
    console.log('Password reset code for', email, ':', code);
    sendStatus.textContent = 'Verification code sent (demo). Check the code shown below.';
  }catch(e){
    console.error(e);
    if (resetError) resetError.textContent = 'Failed to send verification code. Try again later.';
  }finally{ sendCodeBtn.disabled = false; }
}

async function performReset(){
  if (!resetEmail) return;
  const email = resetEmail.value && resetEmail.value.trim();
  const code = resetCodeInput.value && resetCodeInput.value.trim();
  const pw = resetNewPass.value || '';
  const confirm = resetConfirm.value || '';
  if (!email || !code) { if (resetError) resetError.textContent = 'Please provide email and verification code.'; return; }
  if (pw.length === 0 || confirm.length === 0) { if (resetError) resetError.textContent = 'Please provide and confirm your new password.'; return; }
  if (pw !== confirm) { if (resetError) resetError.textContent = 'Passwords do not match.'; return; }
  const rules = validatePasswordRules(pw);
  if (!(rules.length && rules.lower && rules.upper && rules.number && rules.special)) { if (resetError) resetError.textContent = 'Password does not meet strength requirements.'; updateResetPasswordUI(pw); return; }

  const stored = getCodeForEmail(email);
  if (!stored) { if (resetError) resetError.textContent = 'No valid verification code found (it may have expired). Please request a new code.'; return; }
  if (stored !== code) { if (resetError) resetError.textContent = 'Invalid verification code.'; return; }

  // Lookup user and PATCH password
  try{
    resetSubmit.disabled = true;
    const res = await fetch(`${apiUsers}?email=${encodeURIComponent(email)}`);
    const users = await res.json();
    if (!users || users.length === 0) { if (resetError) resetError.textContent = 'No account found with that email.'; return; }
    const user = users[0];
    const patchRes = await fetch(`${apiUsers}/${user.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw })
    });
    if (patchRes.ok) {
  closeResetModal();
  showToast('Password has been reset. You can now log in with your new password.', 'success', 3200);
      // remove used code
      try{ const key='pwResetCodes'; const raw = sessionStorage.getItem(key) || '{}'; const store=JSON.parse(raw); delete store[email]; sessionStorage.setItem(key, JSON.stringify(store)); }catch(e){}
    } else {
      if (resetError) resetError.textContent = 'Failed to update password. Try again later.';
    }
  }catch(e){ console.error(e); if (resetError) resetError.textContent = 'An error occurred while resetting the password.'; }
  finally{ resetSubmit.disabled = false; }
}

// Initialize show-password toggles for all password fields
try{
  document.querySelectorAll('.show-pass').forEach(btn => {
    // inject initial SVG icon
    const openSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const slashSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7 .98-1.74 2.3-3.3 3.88-4.64M3 3l18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.88 9.88A3 3 0 0114.12 14.12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    // set initial icon
    btn.innerHTML = openSvg;
    btn.setAttribute('aria-label', 'Show password');
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.pass-wrap');
      if (!wrap) return;
      const input = wrap.querySelector('input');
      if (!input) return;
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.setAttribute('aria-pressed', isPwd ? 'true' : 'false');
      btn.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
      btn.innerHTML = isPwd ? slashSvg : openSvg;
    });
  });
}catch(e){ /* ignore */ }

if (forgotLink){
  forgotLink.addEventListener('click', (ev)=>{ ev.preventDefault(); openResetModal(); });
}

if (sendCodeBtn) sendCodeBtn.addEventListener('click', (ev)=>{ ev.preventDefault(); sendVerificationCode(); });
if (resetCancel) resetCancel.addEventListener('click', (ev)=>{ ev.preventDefault(); closeResetModal(); });
if (resetBackdrop) resetBackdrop.addEventListener('click', ()=> closeResetModal());
if (resetSubmit) resetSubmit.addEventListener('click', (ev)=>{ ev.preventDefault(); performReset(); });