
// Fixed script.js — login + simple inventory (localStorage-backed)
const ADMIN_PASSWORD = "admin123";

(function () {
  // Helper: safe getter
  const $ = id => document.getElementById(id);

  // DOM elements (some may be missing; the code is defensive)
  const loginScreen = $('loginScreen');
  const dashboard = $('dashboard');
  const loginPassword = $('loginPassword');
  const loginBtn = $('loginBtn');

  const inventoryTableBody = document.querySelector('#inventoryTable tbody');
  const inventoryForm = $('inventoryForm');
  const editForm = $('editForm');
  const editCancelBtn = $('editCancelBtn');

  // Utility: load/save inventory
  const STORAGE_KEY = 'inventoryData_v1';
  let inventory = [];

  function loadInventory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      inventory = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load inventory', e);
      inventory = [];
    }
  }
  function saveInventory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }

  // Render table
  function renderInventory() {
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = '';
    inventory.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(item.model || '')}</td>
        <td>${escapeHtml(item.serialNumber || '')}</td>
        <td>${escapeHtml(item.type || '')}</td>
        <td>${escapeHtml(item.name || '')}</td>
        <td>${escapeHtml(item.status || '')}</td>
        <td>${escapeHtml(item.location || '')}</td>
        <td>
          <button data-idx="${idx}" class="editBtn">Edit</button>
          <button data-idx="${idx}" class="delBtn">Delete</button>
        </td>
      `;
      inventoryTableBody.appendChild(tr);
    });

    // attach listeners
    Array.from(document.getElementsByClassName('editBtn')).forEach(btn => {
      btn.onclick = onEditClick;
    });
    Array.from(document.getElementsByClassName('delBtn')).forEach(btn => {
      btn.onclick = onDeleteClick;
    });
  }

  // Basic XSS escape for displaying values
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

  // Show/hide screens
  function showDashboard() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    renderInventory();
  }
  function showLogin() {
    if (dashboard) dashboard.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
  }

  // Password checker used for edit/delete prompts
  function askPasswordPrompt() {
    const p = prompt('Enter admin password:');
    return p === ADMIN_PASSWORD;
  }

  // Edit / Delete handlers
  function onEditClick(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    if (!askPasswordPrompt()) {
      alert('Incorrect password.');
      return;
    }
    // populate edit form fields if present
    const item = inventory[idx];
    if (!item || !editForm) return;
    setFormValues(editForm, item);
    $('editIndex').value = idx;
    editForm.scrollIntoView({behavior:'smooth'});
  }

  function onDeleteClick(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    if (!askPasswordPrompt()) {
      alert('Incorrect password.');
      return;
    }
    if (!confirm('Delete this item?')) return;
    inventory.splice(idx,1);
    saveInventory();
    renderInventory();
  }

  // Fill a form's inputs from an object (matches by id)
  function setFormValues(formEl, obj) {
    if (!formEl) return;
    Array.from(formEl.elements).forEach(el => {
      if (!el.id) return;
      if (obj[el.id] !== undefined) {
        el.value = obj[el.id];
      } else {
        // also support mapping from expected property names without prefixes
        const prop = el.id.replace(/^edit/i, '').replace(/^inventory/i, '').replace(/^form/i, '');
        if (obj[prop] !== undefined) el.value = obj[prop];
      }
    });
  }

  // Read form fields into object (only inputs with ids)
  function readFormValues(formEl) {
    const out = {};
    if (!formEl) return out;
    Array.from(formEl.elements).forEach(el => {
      if (!el.id) return;
      if (el.type === 'checkbox') out[el.id] = el.checked;
      else out[el.id] = el.value.trim();
    });
    return out;
  }

  // Inventory add handler
  if (inventoryForm) {
    inventoryForm.onsubmit = function (ev) {
      ev.preventDefault();
      const values = readFormValues(inventoryForm);
      // normalize keys used elsewhere
      const item = {
        model: values.model || '',
        serialNumber: values.serialNumber || '',
        type: values.type || '',
        name: values.name || '',
        status: values.status || '',
        location: values.location || '',
        // save whole form as well for future fields
        ...values
      };
      inventory.push(item);
      saveInventory();
      inventoryForm.reset();
      renderInventory();
      alert('Item added.');
    };
  }

  // Edit form submit
  if (editForm) {
    editForm.onsubmit = function (ev) {
      ev.preventDefault();
      const idx = Number($('editIndex').value);
      if (!Number.isFinite(idx) || !inventory[idx]) {
        alert('Invalid edit index.');
        return;
      }
      const values = readFormValues(editForm);
      inventory[idx] = {
        model: values.editModel || values.model || inventory[idx].model || '',
        serialNumber: values.editSerialNumber || values.serialNumber || inventory[idx].serialNumber || '',
        type: values.editType || values.type || inventory[idx].type || '',
        name: values.editName || values.name || inventory[idx].name || '',
        status: values.editStatus || values.status || inventory[idx].status || '',
        location: values.editLocation || values.location || inventory[idx].location || '',
        ...values
      };
      saveInventory();
      renderInventory();
      editForm.reset();
      alert('Changes saved.');
    };

    if (editCancelBtn) {
      editCancelBtn.onclick = function () {
        editForm.reset();
      };
    }
  }

  // Login handling
  if (loginBtn && loginPassword) {
    loginBtn.onclick = function () {
      const val = loginPassword.value || '';
      if (val === ADMIN_PASSWORD) {
        localStorage.setItem('loggedIn', 'true');
        showDashboard();
        loginPassword.value = '';
      } else {
        alert('Incorrect password.');
      }
    };
  }

  // On load: initialize
  function init() {
    loadInventory();
    // if logged in already, show dashboard
    if (localStorage.getItem('loggedIn') === 'true') {
      showDashboard();
    } else {
      showLogin();
    }
  }

  // Wait for DOM ready if necessary
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
