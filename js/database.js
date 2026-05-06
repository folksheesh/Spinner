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
  absent: [],
  
  getAvailable() {
    return this.employees.filter(e => 
      !this.winners.find(w => w.id === e.id) && 
      !this.absent.find(a => a.id === e.id)
    );
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

  markAbsent(employee) {
    // Remove from winners if they are there
    this.winners = this.winners.filter(w => w.id !== employee.id);
    // Add to absent list so they aren't drawn again
    if (!this.absent.find(a => a.id === employee.id)) {
      this.absent.push({ ...employee, absentAt: new Date().toISOString() });
    }
    this.saveState();
  },
  
  saveState() {
    try {
      localStorage.setItem('doorprize_winners', JSON.stringify(this.winners));
      localStorage.setItem('doorprize_absent', JSON.stringify(this.absent));
    } catch(e) {}
  },
  
  loadState() {
    try {
      const savedWinners = localStorage.getItem('doorprize_winners');
      if (savedWinners) this.winners = JSON.parse(savedWinners);
      const savedAbsent = localStorage.getItem('doorprize_absent');
      if (savedAbsent) this.absent = JSON.parse(savedAbsent);
    } catch(e) {}
  },
  
  resetWinners() {
    this.winners = [];
    this.absent = [];
    localStorage.removeItem('doorprize_winners');
    localStorage.removeItem('doorprize_absent');
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
