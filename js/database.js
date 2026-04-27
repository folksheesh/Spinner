/**
 * DATABASE KARYAWAN
 * Format: { id: "XXXXXX", name: "Nama Karyawan", department: "Divisi" }
 * ID harus 6 digit angka
 */

// Generate 1200 dummy employees dynamically
function generateEmployees(count) {
  const depts = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales', 'IT', 'Legal', 'Product', 'Logistics'];
  const firstNames = ['Ahmad', 'Budi', 'Citra', 'Dian', 'Eko', 'Fitria', 'Galih', 'Hana', 'Irwan', 'Joko', 'Kartika', 'Luthfi', 'Maya', 'Nanda', 'Oki', 'Putri', 'Qori', 'Rizky', 'Sari', 'Taufik', 'Umi', 'Vino', 'Wahyu', 'Xena', 'Yogi', 'Zahra', 'Aditya', 'Bella', 'Chandra', 'Desy', 'Reza', 'Kevin', 'Siska', 'Rini', 'Dodi', 'Tito', 'Andre'];
  const lastNames = ['Fauzi', 'Santoso', 'Dewi', 'Pratiwi', 'Prasetyo', 'Sari', 'Wibowo', 'Kusuma', 'Hakim', 'Widodo', 'Anwar', 'Putri', 'Rizki', 'Setiawan', 'Rahayu', 'Amalia', 'Maulana', 'Indah', 'Hidayat', 'Kalsum', 'Bastian', 'Nugroho', 'Pradana', 'Nadia', 'Budiman', 'Safira', 'Kurniawan', 'Ramadhan', 'Wijaya', 'Siregar', 'Simanjuntak', 'Lestari', 'Saputra'];
  
  const data = [];
  const usedIds = new Set();
  
  for (let i = 0; i < count; i++) {
    let id;
    do {
      // Generate random 6-digit number (100000 to 999999)
      id = String(Math.floor(100000 + Math.random() * 900000));
    } while (usedIds.has(id));
    usedIds.add(id);
    
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dept = depts[Math.floor(Math.random() * depts.length)];
    data.push({ id, name: `${fname} ${lname}`, department: dept });
  }
  return data;
}

const EMPLOYEE_DATABASE = generateEmployees(1200);

// State management for winners
const DB = {
  employees: [...EMPLOYEE_DATABASE],
  winners: [],
  
  getAvailable() {
    return this.employees.filter(e => !this.winners.find(w => w.id === e.id));
  },
  
  pickRandom() {
    const available = this.getAvailable();
    if (available.length === 0) return null;
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  },
  
  markWinner(employee) {
    if (!this.winners.find(w => w.id === employee.id)) {
      this.winners.push({ ...employee, wonAt: new Date().toISOString() });
      this.saveState();
    }
  },
  
  saveState() {
    try {
      localStorage.setItem('doorprize_winners', JSON.stringify(this.winners));
    } catch(e) {}
  },
  
  loadState() {
    try {
      const saved = localStorage.getItem('doorprize_winners');
      if (saved) this.winners = JSON.parse(saved);
    } catch(e) {}
  },
  
  resetWinners() {
    this.winners = [];
    localStorage.removeItem('doorprize_winners');
  },
  
  getTotalParticipants() {
    return this.employees.length;
  },
  
  getRemainingCount() {
    return this.getAvailable().length;
  },
  
  getWinnersCount() {
    return this.winners.length;
  }
};

// Initialize
DB.loadState();
