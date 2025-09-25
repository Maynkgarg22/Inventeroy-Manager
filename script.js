// Add references to new elements
const logoutBtn = document.getElementById('logoutBtn');
const inventoryChartCtx = document.getElementById('inventoryChart').getContext('2d');
const importFileInput = document.getElementById('importFile');
const importBtn = document.getElementById('importBtn');
const itemNameBtn = document.getElementById('itemNameBtn');

let inventoryChartInstance = null; // Will hold Chart.js instance

// Existing login, loadFromStorage, saveToStorage, renderTable functions remain.

// Show dashboard and render chart
function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'block';

  loadFromStorage();
  renderTable();
  populateFilterOptions();
  renderInventoryChart();
}

// Logout logic
logoutBtn.onclick = () => {
  localStorage.removeItem('loggedIn');
  dashboard.style.display = 'none';
  loginScreen.style.display = 'block';
  loginPassword.value = '';
};

// Import Excel and JSON
importBtn.onclick = () => {
  importFileInput.click();
};

importFileInput.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          inventory = data;
          saveToStorage();
          renderTable();
          renderInventoryChart();
          alert('Inventory JSON imported successfully.');
        } else {
          alert('Invalid JSON format.');
        }
      } catch (e) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data columns to inventory array format
        inventory = jsonData.map(item => ({
          model: item.Model || '',
          serialNumber: item['Serial Number'] || '',
          type: item.Type || '',
          name: item['Name of instance'] || '',
          status: item.Status || '',
          location: item.Location || '',
          rackNu: item['Rack Nu'] || '',
          cpuType: item['Type CPU'] || '',
          cpu: item.CPU || '',
          core: item.Core || '',
          memory: item['Memory GB'] || '',
          hdd1: item['HDD1 GB'] || '',
          hdd2: item['HDD2 GB'] || '',
          hdd3: item['HDD3 GB'] || '',
          hdd4: item['HDD4 GB'] || '',
          externalStorage: item['External Storage'] || '',
          os: item.OS || '',
          application: item.Application || '',
          ip: item.IP || ''
        }));

        saveToStorage();
        renderTable();
        renderInventoryChart();
        alert('Inventory Excel imported successfully.');
      } catch (error) {
        alert('Error reading Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert('Unsupported file type. Please upload JSON or Excel file.');
  }
  // Clear input to allow re-import if needed
  importFileInput.value = '';
};

// Render inventory chart with Chart.js
function renderInventoryChart() {
  if (inventoryChartInstance) {
    inventoryChartInstance.destroy();
  }

  // Example: Show counts by status
  const counts = inventory.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(counts);
  const data = Object.values(counts);

  inventoryChartInstance = new Chart(inventoryChartCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Inventory Count by Status',
        data: data,
        backgroundColor: 'rgba(0, 123, 255, 0.7)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Item button click opens edit modal (example to open the first item or a new blank form)
itemNameBtn.onclick = () => {
  if (inventory.length > 0) {
    openEditModal(0); // Open first item for edit for demonstration
  } else {
    alert('No items available to edit.');
  }
};
