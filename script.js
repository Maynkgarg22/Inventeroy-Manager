// Existing declarations...

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

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          alert('No valid data found in the Excel file.');
          return;
        }

        // Map Excel columns to inventory object model safely
        inventory = jsonData.map((item) => ({
          model: item.Model || '',
          serialNumber: item['Serial Number'] || '',
          type: item.Type || '',
          name: item['Name'] || item['Name of instance'] || '',
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
        alert('Error parsing Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert('Unsupported file type. Please upload a JSON or Excel file.');
  }
  importFileInput.value = '';
};
