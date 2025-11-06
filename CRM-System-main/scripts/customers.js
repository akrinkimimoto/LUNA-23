/* customers.js
   Customer management functionality including listing, filtering, and adding new customers
*/
(function () {
  const API = 'https://crm-system-9eof.onrender.com/customers';
  
  // DOM Elements
  const elements = {
    addButton: document.getElementById('addCustomerBtn'),
    modal: document.getElementById('addCustomerModal'),
    backdrop: document.getElementById('modalBackdrop'),
    modalHeader: document.getElementById('modalHeader'),
    form: {
      name: document.getElementById('customerName'),
      email: document.getElementById('customerEmail'),
      phone: document.getElementById('customerPhone'),
      status: document.getElementById('customerStatus'),
      family: document.getElementById('customerFamily')
    },
    saveBtn: document.getElementById('saveCustomer'),
    cancelBtn: document.getElementById('cancelCustomer'),
    errorDisplay: document.getElementById('customer-error'),
    searchInput: document.getElementById('q'),
    statusFilter: document.getElementById('status'),
    customersList: document.getElementById('customersList'),
    emptyState: document.getElementById('emptyState')
  };

  let customers = [];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupEventListeners();
    initDraggableModal();
    loadCustomers();
  }

  function setupEventListeners() {
    // Search and filter
    elements.searchInput.addEventListener('input', onFilterChange);
    elements.statusFilter.addEventListener('change', onFilterChange);
    
    // Add Customer button and modal
    elements.addButton.addEventListener('click', showModal);
    elements.saveBtn.addEventListener('click', saveCustomer);
    elements.cancelBtn.addEventListener('click', hideModal);
    elements.backdrop.addEventListener('click', hideModal);
    
    // Close modal on escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && elements.modal.classList.contains('visible')) {
        hideModal();
      }
    });

    // Handle status edits
    elements.customersList.addEventListener('click', handleStatusEdit);
    document.addEventListener('click', closeAllStatusDropdowns);
  }

  // Status editing functionality
  function handleStatusEdit(e) {
    const editBtn = e.target.closest('.edit-status');
    if (!editBtn) return;

    e.stopPropagation();
    closeAllStatusDropdowns();

    const dropdown = editBtn.nextElementSibling;
    dropdown.hidden = !dropdown.hidden;

    if (!dropdown.hidden) {
      const customerId = editBtn.dataset.id;
      dropdown.querySelectorAll('.status-option').forEach(btn => {
        btn.onclick = () => updateCustomerStatus(customerId, btn.dataset.status);
      });
    }
  }

  function closeAllStatusDropdowns() {
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
      dropdown.hidden = true;
    });
  }

  async function updateCustomerStatus(customerId, newStatus) {
    if (!customerId || !newStatus) return;

    try {
      const response = await fetch(`${API}/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ case_status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updated = await response.json();
      const index = customers.findIndex(c => c.id == customerId);
      
      if (index !== -1) {
        customers[index] = { ...customers[index], ...updated };
        render(customers);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      showError('Failed to update customer status');
    }
  }

  // Modal Management
  function showModal() {
    elements.modal.classList.add('visible');
    elements.backdrop.classList.add('visible');
    elements.form.name.focus();
  }

  function hideModal() {
    elements.modal.classList.remove('visible');
    elements.backdrop.classList.remove('visible');
    clearForm();
    hideError();
  }

  function clearForm() {
    Object.values(elements.form).forEach(input => {
      if (input) input.value = '';
    });
  }

  function showFormError(message) {
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.classList.add('visible');
  }

  function hideError() {
    elements.errorDisplay.classList.remove('visible');
  }

  // Save new customer
  async function saveCustomer() {
    // Validate form
    const customer = {
      customer_nameMale: elements.form.name.value.trim(),
      email: elements.form.email.value.trim(),
      phone_number: elements.form.phone.value.trim(),
      case_status: elements.form.status.value,
      family_status: elements.form.family.value
    };

    if (!validateCustomer(customer)) return;

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customer)
      });

      if (!response.ok) throw new Error('Failed to save customer');
      
      const saved = await response.json();
      customers.unshift(saved);
      render(customers);
      hideModal();
    } catch (err) {
      showFormError('Failed to save customer. Please try again.');
      console.error('Save error:', err);
    }
  }

  function validateCustomer(customer) {
    if (!customer.customer_nameMale) {
      showFormError('Please enter customer name');
      elements.form.name.focus();
      return false;
    }
    if (!customer.email || !customer.email.includes('@')) {
      showFormError('Please enter a valid email address');
      elements.form.email.focus();
      return false;
    }
    if (!customer.phone_number) {
      showFormError('Please enter phone number');
      elements.form.phone.focus();
      return false;
    }
    if (!customer.case_status) {
      showFormError('Please select case status');
      elements.form.status.focus();
      return false;
    }
    if (!customer.family_status) {
      showFormError('Please select family status');
      elements.form.family.focus();
      return false;
    }
    return true;
  }

  async function loadCustomers() {
    try {
      const resp = await fetch(API, { cache: 'no-store' });
      if (!resp.ok) throw new Error('API fetch failed');
      const data = await resp.json();
      // API may return an array or an object with customers prop
      customers = Array.isArray(data) ? data : (data.customers || []);
      render(customers);
    } catch (err) {
      console.warn('Primary fetch failed, attempting local fallback:', err.message);
      // local fallback: try to read db.json (works when running a local server)
      try {
        const resp2 = await fetch('./db.json');
        if (!resp2.ok) throw new Error('Local db.json fetch failed');
        const local = await resp2.json();
        customers = local.customers || [];
        render(customers);
      } catch (err2) {
        console.error('Could not load customers:', err2.message);
        showError('Unable to load customers. Make sure the API or local server is running.');
      }
    }
  }

  function onFilterChange() {
    const q = elements.searchInput.value.trim().toLowerCase();
    const status = elements.statusFilter.value;
    const filtered = customers.filter(c => {
      const name = (c.customer_nameMale || c.name || '').toString().toLowerCase();
      const email = (c.email || '').toString().toLowerCase();
      const phone = (c.phone_number || '').toString().toLowerCase();
      const matchesQ = !q || name.includes(q) || email.includes(q) || phone.includes(q);
      const matchesStatus = !status || (c.case_status || '').toLowerCase() === status.toLowerCase();
      return matchesQ && matchesStatus;
    });
    render(filtered);
  }

  function render(items) {
    elements.customersList.innerHTML = '';
    if (!items || items.length === 0) {
      elements.emptyState.hidden = false;
      return;
    }
    elements.emptyState.hidden = true;
    const frag = document.createDocumentFragment();
    items.forEach(item => {
      const card = createCard(item);
      frag.appendChild(card);
    });
    elements.customersList.appendChild(frag);
  }

  function createCard(item) {
    const el = document.createElement('article');
    el.className = 'customer-card';

    const name = item.customer_nameMale || item.name || '—';
    const status = item.case_status || '—';
    const family = item.family_status || '—';
    const phone = item.phone_number ? String(item.phone_number) : '—';
    const email = item.email || '—';

    el.innerHTML = `
      <header class="card-head">
        <h3 class="cust-name">${escapeHtml(name)}</h3>
        <div class="cust-meta">
          <div class="status-group">
            <span class="status ${statusToClass(status)}">${escapeHtml(status)}</span>
            <button class="edit-status" title="Edit Status" data-id="${escapeHtml(String(item.id))}">
              <span class="material-icons-outlined">edit</span>
            </button>
            <div class="status-dropdown" hidden>
              <button class="status-option" data-status="To do">To do</button>
              <button class="status-option" data-status="In progress">In progress</button>
              <button class="status-option" data-status="completed">Completed</button>
            </div>
          </div>
        </div>
      </header>
      <div class="card-body">
        <dl>
          <dt>Family</dt><dd>${escapeHtml(family)}</dd>
          <dt>Phone</dt><dd><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></dd>
          <dt>Email</dt><dd><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></dd>
        </dl>
      </div>
      <footer class="card-foot">ID: ${escapeHtml(String(item.id || '—'))}</footer>
    `;

    return el;
  }

  function statusToClass(s) {
    if (!s) return '';
    const key = s.toLowerCase();
    if (key.includes('progress')) return 'inprogress';
    if (key.includes('to do') || key.includes('todo')) return 'todo';
    if (key.includes('complete')) return 'completed';
    return '';
  }

  function showError(msg) {
    listEl.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Make modal draggable
  function initDraggableModal() {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    elements.modalHeader.addEventListener('mousedown', dragStart);
    elements.modalHeader.addEventListener('touchstart', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
      if (e.type === 'mousedown') {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      } else {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      }

      if (e.target === elements.modalHeader) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      if (e.type === 'mousemove') {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      } else {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, elements.modal);
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragEnd() {
      isDragging = false;
    }
  }
})();
