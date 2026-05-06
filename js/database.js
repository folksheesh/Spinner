/**
 * DATABASE KARYAWAN
 * Format: { id: "XXXXXX", name: "Nama Karyawan", department: "Divisi" }
 * ID harus 6 digit angka
 */

const EMPLOYEE_DATABASE = [
  { id: "100001", name: "Ahmad Fauzi", department: "Engineering" },
  { id: "100002", name: "Budi Santoso", department: "Marketing" },
  { id: "100003", name: "Citra Dewi", department: "HR" },
  { id: "100004", name: "Dian Pratiwi", department: "Finance" },
  { id: "100005", name: "Eko Prasetyo", department: "Operations" },
  { id: "100006", name: "Fitria Sari", department: "Sales" },
  { id: "100007", name: "Galih Wibowo", department: "IT" },
  { id: "100008", name: "Hana Kusuma", department: "Legal" },
  { id: "100009", name: "Irwan Hakim", department: "Product" },
  { id: "100010", name: "Joko Widodo", department: "Logistics" },
  { id: "100011", name: "Kartika Anwar", department: "Engineering" },
  { id: "100012", name: "Luthfi Putri", department: "Marketing" },
  { id: "100013", name: "Maya Rizki", department: "HR" },
  { id: "100014", name: "Nanda Setiawan", department: "Finance" },
  { id: "100015", name: "Oki Rahayu", department: "Operations" },
  { id: "100016", name: "Putri Amalia", department: "Sales" },
  { id: "100017", name: "Qori Maulana", department: "IT" },
  { id: "100018", name: "Rizky Indah", department: "Legal" },
  { id: "100019", name: "Sari Hidayat", department: "Product" },
  { id: "100020", name: "Taufik Kalsum", department: "Logistics" },
  { id: "100021", name: "Umi Bastian", department: "Engineering" },
  { id: "100022", name: "Vino Nugroho", department: "Marketing" },
  { id: "100023", name: "Wahyu Pradana", department: "HR" },
  { id: "100024", name: "Xena Nadia", department: "Finance" },
  { id: "100025", name: "Yogi Budiman", department: "Operations" },
  { id: "100026", name: "Zahra Safira", department: "Sales" },
  { id: "100027", name: "Aditya Kurniawan", department: "IT" },
  { id: "100028", name: "Bella Ramadhan", department: "Legal" },
  { id: "100029", name: "Chandra Wijaya", department: "Product" },
  { id: "100030", name: "Desy Siregar", department: "Logistics" },
  { id: "100031", name: "Reza Simanjuntak", department: "Engineering" },
  { id: "100032", name: "Kevin Lestari", department: "Marketing" },
  { id: "100033", name: "Siska Saputra", department: "HR" },
  { id: "100034", name: "Rini Fauzi", department: "Finance" },
  { id: "100035", name: "Dodi Santoso", department: "Operations" },
  { id: "100036", name: "Tito Dewi", department: "Sales" },
  { id: "100037", name: "Andre Pratiwi", department: "IT" },
  { id: "100038", name: "Ahmad Prasetyo", department: "Legal" },
  { id: "100039", name: "Budi Sari", department: "Product" },
  { id: "100040", name: "Citra Wibowo", department: "Logistics" },
  { id: "100041", name: "Dian Kusuma", department: "Engineering" },
  { id: "100042", name: "Eko Hakim", department: "Marketing" },
  { id: "100043", name: "Fitria Widodo", department: "HR" },
  { id: "100044", name: "Galih Anwar", department: "Finance" },
  { id: "100045", name: "Hana Putri", department: "Operations" },
  { id: "100046", name: "Irwan Rizki", department: "Sales" },
  { id: "100047", name: "Joko Setiawan", department: "IT" },
  { id: "100048", name: "Kartika Rahayu", department: "Legal" },
  { id: "100049", name: "Luthfi Amalia", department: "Product" },
  { id: "100050", name: "Maya Maulana", department: "Logistics" }
];

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
