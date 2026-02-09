// --- GLOBAL EXPOSURE & STABILIZATION ---

// Seed Data for Build 7 Demo
let REFERRED_PATIENTS = [
    {
        name: "Sarah Connor",
        email: "sarah.c@sky.net",
        diagnosisId: "OSTE",
        regimenName: "Bone Density & Balance",
        matrixId: "MFRX-AB001",
        gymAccessCode: "205101",
        status: "PAID",
        createdAt: Date.now() - 86400000 * 2 // 2 days ago
    },
    {
        name: "Jessica Jones",
        email: "jjones@alias.com",
        diagnosisId: "SMT",
        regimenName: "Hormonal Balance & Strength",
        matrixId: "MFRX-CD002",
        gymAccessCode: "205102",
        status: "PENDING_PAYMENT",
        createdAt: Date.now() - 3600000 // 1 hour ago
    }
];

let PATIENT_RESULTS = []; 
let MOCK_CREDENTIALS = [
    { matrixId: 'MFRX-EF003', gymAccessCode: '205103', used: false },
    { matrixId: 'MFRX-GH004', gymAccessCode: '205104', used: false }
];

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }, 
];

// --- CORE FUNCTIONS (PLUMBING) ---

window.switchTab = function(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}-panel`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    const container = document.querySelector('.app-container');
    tab === 'doctor' ? container.classList.add('doctor-view') : container.classList.remove('doctor-view');
    
    if (tab === 'doctor') renderDoctorPatientList();
};

window.closeLMNModal = () => document.getElementById('lmn-modal').classList.add('hidden');
window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    
    list.innerHTML = REFERRED_PATIENTS.map(patient => {
        const isPaid = patient.status === 'PAID';
        return `
            <div class="card bg-white border-l-4 ${isPaid ? 'border-primary-green' : 'border-yellow-500'} cursor-pointer hover:bg-gray-50">
                <p class="text-lg font-semibold">${patient.name}</p>
                <p class="text-sm text-gray-600">ID: ${patient.matrixId}</p>
                <p class="text-xs font-bold ${isPaid ? 'text-green-600' : 'text-yellow-600'}">${patient.status}</p>
                <button onclick="window.openLMNModalByCode('${patient.matrixId}')" class="mt-2 text-xs text-blue-600 underline">View LMN</button>
            </div>
        `;
    }).join('');
}

window.openLMNModalByCode = function(matrixId) {
    const patient = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    const diagnosis = DIAGNOSES.find(d => d.id === patient.diagnosisId);
    // Logic from Build 7 for modal content would go here
    document.getElementById('lmn-content-display').innerHTML = `<h3>LMN for ${patient.name}</h3><p>Diagnosis: ${diagnosis.name}</p>`;
    document.getElementById('lmn-modal').classList.remove('hidden');
};

function handleReferral(e) {
    if (e) e.preventDefault();
    const form = document.getElementById('referral-form');
    const patientData = {
        name: form.name.value,
        email: form.email.value,
        diagnosisId: form.diagnosis.value,
        status: 'PENDING_PAYMENT',
        matrixId: `MFRX-${Math.floor(Math.random()*90000) + 10000}`,
        createdAt: Date.now()
    };
    REFERRED_PATIENTS.unshift(patientData);
    form.reset();
    renderDoctorPatientList();
    alert("Referral Submitted Successfully.");
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Populate Diagnosis
    const diagSelect = document.getElementById('diagnosis-select');
    if (diagSelect) {
        diagSelect.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
    
    // Attach Form Listeners
    const refForm = document.getElementById('referral-form');
    if (refForm) refForm.addEventListener('submit', handleReferral);
    
    // Initial Render
    renderDoctorPatientList();
});