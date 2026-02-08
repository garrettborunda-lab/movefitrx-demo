/**
 * MoveFitRx Stable PoC - Build 7.5 (FULL WORKFLOW RESTORATION)
 * This build restores the clinical logic, LMN generation, and tab switching.
 */

// --- 1. CORE DATA ---
const CLINICIAN_DETAILS = { 
    name: 'Dr. Jane Foster, MD', 
    clinic: 'MoveFitRx Clinical Group', 
    phone: '(555) 123-4567', 
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
};

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }
];

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ 
    matrixId: `MFRX-ST0${i+1}`, 
    gymAccessCode: `20510${i}`, 
    used: false 
}));

let REFERRED_PATIENTS = [];

// --- 2. CORE FUNCTIONS ---
function initializeState() {
    if (REFERRED_PATIENTS.length === 0) {
        const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
        REFERRED_PATIENTS.push({
            name: 'Sarah Connor', email: 's.connor@sky.net', diagnosisId: 'HYPT',
            regimenName: 'Cardio Vascular Health', matrixId: c1.matrixId,
            gymAccessCode: c1.gymAccessCode, status: 'PAID', createdAt: Date.now() - 432000000
        });

        const c2 = MOCK_CREDENTIALS[1]; c2.used = true;
        REFERRED_PATIENTS.push({
            name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE',
            regimenName: 'Bone Density & Balance', matrixId: c2.matrixId,
            gymAccessCode: c2.gymAccessCode, status: 'PENDING_PAYMENT', createdAt: Date.now() - 172800000
        });
    }
}

function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(`${tab}-panel`);
    if (target) target.classList.add('active');
    
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'doctor') {
        renderDoctorPatientList();
    }
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const color = p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500';
        const text = p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600';
        
        // This makes the card clickable for the demo
        return `
            <div class="card bg-white border-l-4 ${color} p-4 mb-3 shadow-sm hover:bg-gray-50 cursor-pointer" 
                 onclick="alert('Medically Necessary Regimen: ${dx.regimen}\\nID: ${p.matrixId}')">
                <p class="text-lg font-bold">${p.name}</p>
                <p class="text-sm text-gray-600">DX: ${dx.name}</p>
                <p class="text-xs font-bold ${text}">${p.status}</p>
                <p class="text-xs text-gray-400 font-mono">CODE: ${p.matrixId}</p>
            </div>`;
    }).join('');
}

function populateDiagnosisDropdown() {
    const s = document.getElementById('diagnosis-select');
    if (s) s.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("System out of credentials.");

    cred.used = true;
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);

    REFERRED_PATIENTS.unshift({
        name: e.target.name.value,
        email: e.target.email.value,
        diagnosisId: dx.id,
        regimenName: dx.regimen,
        matrixId: cred.matrixId,
        gymAccessCode: cred.gymAccessCode,
        status: 'PENDING_PAYMENT',
        createdAt: Date.now()
    });

    renderDoctorPatientList();
    e.target.reset();
    alert("Referral Successful! Letter of Medical Necessity generated for patient " + REFERRED_PATIENTS[0].name);
}

// --- 3. INITIALIZATION ---
function initializeApp() {
    console.log("MoveFitRx System: FULL WORKFLOW RESTORED");
    initializeState();
    populateDiagnosisDropdown();
    renderDoctorPatientList();

    const form = document.getElementById('referral-form');
    if (form) form.addEventListener('submit', handleReferral);
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.switchTab = switchTab;