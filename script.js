// --- CORE DATA ---
const CLINICIAN_DETAILS = { name: 'Dr. Jane Foster, MD', clinic: 'MoveFitRx Clinical Group', phone: '(555) 123-4567', date: new Date().toLocaleDateString() };
const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }
];
let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, used: false }));
let REFERRED_PATIENTS = [];

// --- CORE FUNCTIONS ---
function initializeApp() {
    console.log("POC ACTIVE");
    const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
    REFERRED_PATIENTS.push({ name: 'Sarah Connor', diagnosisId: 'HYPT', matrixId: c1.matrixId, status: 'PAID', createdAt: Date.now() });
    populateDiagnosisDropdown();
    renderDoctorPatientList();
}

function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${t}-panel`).classList.add('active');
    if (t === 'doctor') renderDoctorPatientList();
}

function populateDiagnosisDropdown() {
    const s = document.getElementById('diagnosis-select');
    if (s) s.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function renderDoctorPatientList() {
    const l = document.getElementById('patients-list');
    if (!l) return;
    l.innerHTML = REFERRED_PATIENTS.map(p => `
        <div class="card bg-white border-l-4 border-blue-500 p-4 mb-2">
            <p class="font-bold">${p.name}</p>
            <p class="text-sm text-gray-600">ID: ${p.matrixId} | Status: ${p.status}</p>
        </div>`).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("Out of credentials");
    cred.used = true;
    REFERRED_PATIENTS.unshift({ name: e.target.name.value, matrixId: cred.matrixId, status: 'PENDING_PAYMENT', createdAt: Date.now() });
    renderDoctorPatientList();
    e.target.reset();
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    const f = document.getElementById('referral-form');
    if (f) f.addEventListener('submit', handleReferral);
});
window.switchTab = switchTab;
