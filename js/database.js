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
  { id: "100006", name: "Fitria Sari", department: "Engineering" },
  { id: "100007", name: "Galih Wibowo", department: "Sales" },
  { id: "100008", name: "Hana Kusuma", department: "Marketing" },
  { id: "100009", name: "Irwan Hakim", department: "IT" },
  { id: "100010", name: "Joko Widodo", department: "Operations" },
  { id: "100011", name: "Kartika Sari", department: "Finance" },
  { id: "100012", name: "Luthfi Anwar", department: "Engineering" },
  { id: "100013", name: "Maya Putri", department: "HR" },
  { id: "100014", name: "Nanda Rizki", department: "Sales" },
  { id: "100015", name: "Oki Setiawan", department: "IT" },
  { id: "100016", name: "Putri Rahayu", department: "Marketing" },
  { id: "100017", name: "Qori Amalia", department: "Finance" },
  { id: "100018", name: "Rizky Maulana", department: "Engineering" },
  { id: "100019", name: "Sari Indah", department: "Operations" },
  { id: "100020", name: "Taufik Hidayat", department: "Sales" },
  { id: "100021", name: "Umi Kalsum", department: "HR" },
  { id: "100022", name: "Vino Bastian", department: "Marketing" },
  { id: "100023", name: "Wahyu Nugroho", department: "Engineering" },
  { id: "100024", name: "Xena Putri", department: "IT" },
  { id: "100025", name: "Yogi Pradana", department: "Finance" },
  { id: "100026", name: "Zahra Nadia", department: "Operations" },
  { id: "100027", name: "Arief Budiman", department: "Sales" },
  { id: "100028", name: "Bella Safira", department: "Engineering" },
  { id: "100029", name: "Cecep Kurniawan", department: "Marketing" },
  { id: "100030", name: "Dewi Ratnasari", department: "HR" },
  { id: "100031", name: "Eko Wahyudi", department: "IT" },
  { id: "100032", name: "Fani Oktavia", department: "Finance" },
  { id: "100033", name: "Gilang Ramadhan", department: "Operations" },
  { id: "100034", name: "Hendra Gunawan", department: "Engineering" },
  { id: "100035", name: "Indri Lestari", department: "Sales" },
  { id: "100036", name: "Jaka Sembung", department: "Marketing" },
  { id: "100037", name: "Kiki Amalia", department: "HR" },
  { id: "100038", name: "Lili Kurnia", department: "Finance" },
  { id: "100039", name: "Maman Suryaman", department: "Engineering" },
  { id: "100040", name: "Nita Anggraini", department: "Operations" },
  { id: "100041", name: "Omar Bakri", department: "IT" },
  { id: "100042", name: "Peni Rahayu", department: "Sales" },
  { id: "100043", name: "Qiqi Amara", department: "Marketing" },
  { id: "100044", name: "Rendi Pratama", department: "Engineering" },
  { id: "100045", name: "Siska Pertiwi", department: "HR" },
  { id: "100046", name: "Toni Wahyudi", department: "Finance" },
  { id: "100047", name: "Udin Sedunia", department: "Operations" },
  { id: "100048", name: "Vivi Natalia", department: "Marketing" },
  { id: "100049", name: "Wulan Sari", department: "Engineering" },
  { id: "100050", name: "Yusuf Mansur", department: "Sales" },
];

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
