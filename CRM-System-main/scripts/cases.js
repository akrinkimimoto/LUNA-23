// cases.js
// Implements Cases page behavior modeled on scripts/task.js

let caseName = document.getElementById("caseName");
let caseEmail = document.getElementById("caseEmail");
let casePhone = document.getElementById("casePhone");
let caseStatus = document.getElementById("caseStatus");
let caseFamily = document.getElementById("caseFamily");
let caseContent = document.getElementById("caseContent");
let saveCaseBtn = document.getElementById("saveCase");
let cancelCaseBtn = document.getElementById("cancelCase");
let maincasessection = document.getElementById("maincasessection");
let addcase = document.getElementById("addcase");
let caseadddiv = document.getElementById("caseadddiv");
let searchbar = document.getElementById("searchbar");
let clearSearchBtn = document.getElementById('clearSearch');

// Storage and API
const API_BASE = 'http://localhost:3001/users'; // json-server endpoint
let casesArr = [];
let editIndex = -1;

function initializeSearchCases() {
  if (!searchbar) return;
  let debounce = null;
  searchbar.addEventListener('input', function(e){
    const q = e.target.value.trim();
    clearSearchBtn.classList.toggle('visible', q.length>0);
    clearTimeout(debounce);
    debounce = setTimeout(()=> performCaseSearch(q), 250);
  });
  clearSearchBtn.addEventListener('click', () => {
    searchbar.value = '';
    clearSearchBtn.classList.remove('visible');
    searchbar.focus();
    renderCases(casesArr);
  });
  searchbar.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { searchbar.value=''; clearSearchBtn.classList.remove('visible'); renderCases(casesArr); }
  });
}

addcase.addEventListener('click', () => {
  caseadddiv.style.display = 'block';
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.classList.add('active');
  try{ document.body.style.overflow = 'hidden'; }catch(e){}
  try{ caseName.focus(); }catch(e){}
});

saveCaseBtn.addEventListener('click', () => {
  const errEl = document.getElementById('case-error');
  if (errEl) errEl.textContent = '';
  if (!caseName.value || !caseName.value.trim()){
    if (errEl) errEl.textContent = 'Name is required.';
    try{ caseName.focus(); }catch(e){}
    return;
  }
  submitCase();
});

cancelCaseBtn.addEventListener('click', () => {
  clearCaseForm();
  caseadddiv.style.display = 'none';
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.classList.remove('active');
  try{ document.body.style.overflow = ''; }catch(e){}
});

function clearCaseForm(){
  caseName.value=''; caseEmail.value=''; casePhone.value=''; caseStatus.value=''; caseFamily.value='';
  if (caseContent) caseContent.value = '';
  const errEl = document.getElementById('case-error'); if (errEl) errEl.textContent='';
  editIndex = -1;
}

async function loadCases() {
  try {
    const resp = await fetch(API_BASE);
    if (!resp.ok) throw new Error('fetch failed');
    casesArr = await resp.json();
    renderCases(casesArr);
  } catch (err) {
    console.warn('Failed to load from API, falling back to local db.json/localStorage', err.message);
    try {
      const resp2 = await fetch('./db.json');
      if (!resp2.ok) throw new Error('local fetch failed');
      const local = await resp2.json();
      casesArr = local.users || local.customers || [];
      renderCases(casesArr);
    } catch (err2) {
      console.error('Local load failed, using localStorage fallback', err2.message);
      casesArr = JSON.parse(localStorage.getItem('cases')) || [];
      renderCases(casesArr);
    }
  }
}

async function submitCase(){
  caseadddiv.style.display = 'none';
  try{ document.body.style.overflow = ''; }catch(e){}
  const obj = {
    customer_nameMale: caseName.value.trim(),
    email: caseEmail.value.trim(),
    phone_number: casePhone.value.trim(),
    case_status: caseStatus.value,
    family_status: caseFamily.value
    , case_description: caseContent ? caseContent.value.trim() : ''
  };

  try {
    if (editIndex !== -1) {
      const id = casesArr[editIndex].id;
      const resp = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(obj)
      });
      if (!resp.ok) throw new Error('Update failed');
      editIndex = -1;
    } else {
      const resp = await fetch(API_BASE, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(obj)
      });
      if (!resp.ok) throw new Error('Create failed');
    }
    await loadCases();
  } catch (err) {
    console.error('API error, using localStorage fallback', err);
    if (editIndex !== -1) {
      casesArr[editIndex] = obj; editIndex = -1;
    } else {
      casesArr.push(obj);
    }
    localStorage.setItem('cases', JSON.stringify(casesArr));
    renderCases(casesArr);
  }
}

function renderCases(list){
  maincasessection.innerHTML = '';
  if (!list || list.length === 0) {
    maincasessection.innerHTML = `
      <div class="no-results">
        <span class="material-icons-outlined">folder_open</span>
        <p>No cases found</p>
      </div>`;
    return;
  }
  list.forEach((it, idx) => maincasessection.appendChild(createCaseCard(it, idx)));
}

function createCaseCard(item, index){
  const card = document.createElement('div');
  card.className = 'case-card';
  const h3 = document.createElement('h3'); h3.textContent = item.customer_nameMale || item.name || '—';
  const pDesc = document.createElement('p');
  const statusVal = (item.case_status || '').toString().toLowerCase();
  let statusClass = '';
  if (statusVal.includes('progress')) statusClass = 'inprogress';
  else if (statusVal.includes('to do') || statusVal.includes('todo')) statusClass = 'todo';
  else if (statusVal.includes('complete')) statusClass = 'completed';
  const statusText = item.case_status || '—';
  pDesc.innerHTML = `<span class="status-pill ${statusClass}">${escapeHtml(statusText)}</span>`;
  const pPhone = document.createElement('p'); pPhone.innerHTML = `<strong>Phone:</strong> ${item.phone_number || '—'}`;
  const pContent = document.createElement('p');
  pContent.className = 'case-details';
  if (item.case_description) {
    const raw = String(item.case_description || '');
    const txt = escapeHtml(raw);
    const isLong = txt.length > 220;
    const short = isLong ? txt.slice(0,220) + '…' : txt;
    // store full (URI-encoded) in data-full for safe retrieval
    const encoded = encodeURIComponent(raw);
    if (isLong) {
      pContent.innerHTML = `<strong>Details:</strong> <div class="case-desc collapsed" data-full="${encoded}">${short}</div><button class="read-more" aria-expanded="false">Read more</button>`;
    } else {
      pContent.innerHTML = `<strong>Details:</strong> <div class="case-desc">${short}</div>`;
    }
  } else {
    pContent.innerHTML = `<strong>Details:</strong> —`;
  }
  const pEmail = document.createElement('p'); pEmail.innerHTML = `<strong>Email:</strong> ${item.email || '—'}`;

  const edit = document.createElement('button'); edit.className='edit'; edit.textContent = 'Edit';
  const del = document.createElement('button'); del.className='deleted'; del.textContent = 'Delete';

  edit.addEventListener('click', ()=> {
    openEdit(item, index);
  });

  del.addEventListener('click', async ()=> {
    try {
      if (item.id) {
        const resp = await fetch(`${API_BASE}/${item.id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Delete failed');
        await loadCases();
        return;
      }
      // fallback: remove from local array
      casesArr = casesArr.filter((_,i)=> i!==index);
      localStorage.setItem('cases', JSON.stringify(casesArr));
      renderCases(casesArr);
    } catch (err) {
      console.error('Delete error', err);
      casesArr = casesArr.filter((_,i)=> i!==index);
      localStorage.setItem('cases', JSON.stringify(casesArr));
      renderCases(casesArr);
    }
  });

  card.append(h3, pDesc, pContent, pPhone, pEmail, edit, del);

  // attach read-more toggle if present
  try{
    const rm = card.querySelector('.read-more');
    if (rm) {
      const descEl = card.querySelector('.case-desc');
      rm.addEventListener('click', function(){
        const expanded = rm.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          // expand: replace content with full text
          const full = descEl.getAttribute('data-full') || '';
          descEl.textContent = decodeURIComponent(full);
          descEl.classList.remove('collapsed');
          rm.textContent = 'Show less';
          rm.setAttribute('aria-expanded','true');
        } else {
          // collapse
          const full = descEl.getAttribute('data-full') || '';
          const shortText = escapeHtml(decodeURIComponent(full)).slice(0,220) + '…';
          descEl.innerHTML = shortText;
          descEl.classList.add('collapsed');
          rm.textContent = 'Read more';
          rm.setAttribute('aria-expanded','false');
        }
      });
    }
  }catch(e){}
  return card;
}

function openEdit(item, index){
  caseadddiv.style.display = 'block';
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.classList.add('active');
  try{ document.body.style.overflow = 'hidden'; }catch(e){}
  try{ document.getElementById('case-error').textContent = ''; }catch(e){}
  try{ caseName.focus(); }catch(e){}
  caseName.value = item.customer_nameMale || item.name || '';
  caseEmail.value = item.email || '';
  casePhone.value = item.phone_number || '';
  caseStatus.value = item.case_status || '';
  caseFamily.value = item.family_status || '';
  if (caseContent) caseContent.value = item.case_description || '';
  editIndex = index;
}

function performCaseSearch(q){
  if (!q) { renderCases(casesArr); return; }
  const lower = q.toLowerCase();
  const res = casesArr.filter(c => {
    const name = (c.customer_nameMale || c.name || '').toString().toLowerCase();
    const email = (c.email || '').toString().toLowerCase();
    const phone = (c.phone_number || '').toString().toLowerCase();
    const status = (c.case_status || '').toString().toLowerCase();
    return name.includes(lower) || email.includes(lower) || phone.includes(lower) || status.includes(lower);
  });
  renderCases(res);
}

// Draggable modal similar to task.js
function initDraggableCases(){
  const modal = document.getElementById('caseadddiv');
  const modalHeader = document.getElementById('modalHeader');
  if (!modalHeader) return;
  let isDragging=false, currentX, currentY, initialX, initialY, xOffset=0, yOffset=0;
  function dragStart(e){
    initialX = (e.type==='touchstart') ? e.touches[0].clientX - xOffset : e.clientX - xOffset;
    initialY = (e.type==='touchstart') ? e.touches[0].clientY - yOffset : e.clientY - yOffset;
    if (e.target.closest('#modalHeader')) { isDragging=true; modalHeader.style.cursor='grabbing'; }
  }
  function drag(e){ if (!isDragging) return; e.preventDefault(); currentX = (e.type==='touchmove')? e.touches[0].clientX - initialX : e.clientX - initialX; currentY = (e.type==='touchmove')? e.touches[0].clientY - initialY : e.clientY - initialY; xOffset = currentX; yOffset = currentY; modal.style.transform = `translate(${currentX}px, ${currentY}px)`; }
  function dragEnd(){ isDragging=false; modalHeader.style.cursor='grab'; }
  modalHeader.addEventListener('mousedown', dragStart); document.addEventListener('mousemove', drag); document.addEventListener('mouseup', dragEnd);
  modalHeader.addEventListener('touchstart', dragStart); document.addEventListener('touchmove', drag); document.addEventListener('touchend', dragEnd);
  cancelCaseBtn.addEventListener('click', () => { xOffset=0; yOffset=0; modal.style.transform=''; });
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadCases();
  initializeSearchCases();
  initDraggableCases();
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      caseadddiv.style.display = 'none';
      backdrop.classList.remove('active');
      try{ document.body.style.overflow = ''; }catch(e){}
    });
  }
});

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
