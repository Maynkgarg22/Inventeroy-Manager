// Admin password
const ADMIN_PASSWORD = "admin123";

let inventory = [];

// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const filterLocation = document.getElementById("filterLocation");

const inventoryTableBody = document.querySelector("#inventoryTable tbody");
const inventoryForm = document.getElementById("inventoryForm");
const formTitle = document.getElementById("formTitle");
const editIndexInput = document.getElementById("editIndex");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

// Login Handling
window.onload = () => {
  if (localStorage.getItem("loggedIn") === "true") {
    showDashboard();
  }
};

loginBtn.onclick = () => {
  if (loginPassword.value === ADMIN_PASSWORD) {
    localStorage.setItem("loggedIn", "true");
    showDashboard();
  } else {
    alert("Incorrect password.");
  }
};

function showDashboard() {
  loginScreen.style.display = "none";
  dashboard.style.display = "block";
  loadFromStorage();
  renderTable();
  populateFilterOptions();
}

// Load from localStorage
function loadFromStorage() {
  const saved = localStorage.getItem("inventoryData");
  if (saved) {
    inventory = JSON.parse(saved);
  } else {
    inventory = [];
  }
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Render the inventory table
function renderTable() {
  inventoryTableBody.innerHTML = "";
  inventory.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.model}</td>
      <td>${item.serialNumber}</td>
      <td>${item.type}</td>
      <td>${item.name}</td>
      <td>${item.status}</td>
      <td>${item.location}</td>
      <td>${item.rackNu || ""}</td>
      <td>${item.cpuType || ""}</td>
      <td>${item.cpu || ""}</td>
      <td>${item.core || ""}</td>
      <td>${item.memory || ""}</td>
      <td>${item.hdd1 || ""}</td>
      <td>${item.hdd2 || ""}</td>
      <td>${item.hdd3 || ""}</td>
      <td>${item.hdd4 || ""}</td>
      <td>${item.externalStorage || ""}</td>
      <td>${item.os || ""}</td>
      <td>${item.application || ""}</td>
      <td>${item.ip || ""}</td>
      <td>
        <button class="editBtn" data-index="${index}">Edit</button>
        <button class="deleteBtn" data-index="${index}">Delete</button>
      </td>
    `;
    inventoryTableBody.appendChild(row);
  });

  addTableEventListeners();
  filterTable();
  populateFilterOptions();
}

// Add event listeners to Edit/Delete buttons
function addTableEventListeners() {
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.onclick = () => {
      askPassword(() => openEditModal(parseInt(btn.dataset.index)));
    };
  });
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.onclick = () => {
      askPassword(() => deleteItem(parseInt(btn.dataset.index)));
    };
  });
}

// Password prompt before Edit/Delete
function askPassword(callback) {
  const pass = prompt("Enter password:");
  if (pass === ADMIN_PASSWORD) {
    callback();
  } else {
    alert("Incorrect password.");
  }
}

// Open edit modal and populate fields
function openEditModal(index) {
  const item = inventory[index];
  editIndexInput.value = index;
  editForm.editModel.value = item.model;
  editForm.editSerialNumber.value = item.serialNumber;
  editForm.editType.value = item.type;
  editForm.editName.value = item.name;
  editForm.editStatus.value = item.status;
  editForm.editLocation.value = item.location;
  editForm.editRackNu.value = item.rackNu || "";
  editForm.editCpuType.value = item.cpuType || "";
  editForm.editCpu.value = item.cpu || "";
  editForm.editCore.value = item.core || "";
  editForm.editMemory.value = item.memory || "";
  editForm.editHdd1.value = item.hdd1 || "";
  editForm.editHdd2.value = item.hdd2 || "";
  editForm.editHdd3.value = item.hdd3 || "";
  editForm.editHdd4.value = item.hdd4 || "";
  editForm.editExternalStorage.value = item.externalStorage || "";
  editForm.editOs.value = item.os || "";
  editForm.editApplication.value = item.application || "";
  editForm.editIp.value = item.ip || "";

  editModal.style.display = "flex";
}

// Close modal
document.querySelector(".close").onclick = () => {
  editModal.style.display = "none";
};

document.getElementById("editCancelBtn").onclick = () => {
  editModal.style.display = "none";
};

// Submit edit form
editForm.onsubmit = e => {
  e.preventDefault();
  const idx = parseInt(editIndexInput.value);
  inventory[idx] = {
    model: editForm.editModel.value.trim(),
    serialNumber: editForm.editSerialNumber.value.trim(),
    type: editForm.editType.value.trim(),
    name: editForm.editName.value.trim(),
    status: editForm.editStatus.value.trim(),
    location: editForm.editLocation.value.trim(),
    rackNu: editForm.editRackNu.value.trim(),
    cpuType: editForm.editCpuType.value.trim(),
    cpu: editForm.editCpu.value.trim(),
    core: editForm.editCore.value.trim(),
    memory: editForm.editMemory.value.trim(),
    hdd1: editForm.editHdd1.value.trim(),
    hdd2: editForm.editHdd2.value.trim(),
    hdd3: editForm.editHdd3.value.trim(),
    hdd4: editForm.editHdd4.value.trim(),
    externalStorage: editForm.editExternalStorage.value.trim(),
    os: editForm.editOs.value.trim(),
    application: editForm.editApplication.value.trim(),
    ip: editForm.editIp.value.trim(),
  };
  saveToStorage();
  renderTable();
  editModal.style.display = "none";
};

// Submit new item form
inventoryForm.onsubmit = e => {
  e.preventDefault();
  const newItem = {
    model: inventoryForm.model.value.trim(),
    serialNumber: inventoryForm.serialNumber.value.trim(),
    type: inventoryForm.type.value.trim(),
    name: inventoryForm.name.value.trim(),
    status: inventoryForm.status.value.trim(),
    location: inventoryForm.location.value.trim(),
    rackNu: inventoryForm.rack
.js
