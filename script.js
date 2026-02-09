// --- 1. IMMEDIATE GLOBAL EXPOSURE (Fixes ReferenceErrors) ---
// We define these before anything else so the HTML can always find them.

window.switchTab = function(tab) {
    console.log("MoveFitRx: Switching to " + tab);
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}-panel`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    const container = document.querySelector('.app-container');
    if (tab === 'doctor') {
        container.classList.add('doctor-view');
        window.renderDoctorPatientList();
    } else {
        container.classList.remove('doctor-view');
    }
};

window.closeLMNModal = () => document.getElementById('lmn-modal').classList.add('hidden');
window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');

// --- 2. DATA SEEDING & CONSTANTS ---

let REFERRED_PATIENTS = [
    {
        name: "Sarah Connor",
        email: "sarah.c@sky.net",
        diagnosisId: "OSTE",
        regimenName: "Bone Density & Balance",
        matrixId: "MFRX-AB001",
        gymAccessCode: "205101",
        status: "PAID",
        createdAt: Date.now() - 86400000 * 2 
    },
    {
        name: "Jessica Jones",
        email: "jjones@alias.com",
        diagnosisId: "SMT",
        regimenName: "Hormonal Balance & Strength",
        matrixId: "MFRX-CD002",
        gymAccessCode: "205102",
        status: "PENDING_PAYMENT",
        createdAt: Date.now() - 3600000 
    }
];

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }, 
];

// --- 3. CORE LOGIC ENGINES (Build 7) ---

window.renderDoctorPatientList = function() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    
    list.innerHTML = REFERRED_PATIENTS.map(patient => {
        const isPaid = patient.status === 'PAID';
        return `
            <div class="card bg-white border-l-4 ${isPaid ? 'border-primary-green' : 'border-yellow-500'} cursor-pointer hover:bg-gray-50 p-4 mb-2">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-lg font-semibold">${patient.name}</p>
                        <p class="text-sm text-gray-600">ID: ${patient.matrixId}</p>
                    </div>
                    <span class="text-xs font-bold px-2 py-1 rounded ${isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}">
                        ${patient.status}
                    </span>
                </div>
                <button onclick="window.openLMNModalByCode('${patient.matrixId}')" class="mt-2 text-xs text-blue-600 underline hover:text-blue-800">
                    <i class="fas fa-file-medical mr-1"></i> View LMN
                </button>
            </div>
        `;
    }).join('');
};

window.openLMNModalByCode = function(matrixId) {
    const patient = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    if (!patient) return;
    const diagnosis = DIAGNOSES.find(d => d.id === patient.diagnosisId);
    
    document.getElementById('lmn-content-display').innerHTML = `
        <h3 class="text-xl font-bold mb-4">Letter of Medical Necessity</h3>
        <p><strong>Patient:</strong> ${patient.name}</p>
        <p><strong>Diagnosis:</strong> ${diagnosis.name} (${diagnosis.code})</p>
        <p><strong>Prescribed Regimen:</strong> ${diagnosis.regimen}</p>
        <hr class="my-4">
        <p class="text-sm text-gray-600">This document serves as a formal prescription for medical fitness services as part of the MoveFitRx clinical protocol.</p>
    `;
    document.getElementById('lmn-modal').classList.remove('hidden');
};

window.handleReferral = function(e) {
    if (e) e.preventDefault(); // Secondary guard against page reload
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
    window.renderDoctorPatientList();
    form.reset();
    alert("Referral successfully logged in the demo environment.");
};

window.handlePatientSearch = function(e) {
    if (e) e.preventDefault();
    const matrixId = document.getElementById('matrix-id-input').value.trim().toUpperCase();
    const patient = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    const statusEl = document.getElementById('patient-status');
    
    if (patient) {
        statusEl.className = "text-sm text-green-600 mt-2";
        statusEl.innerText = "Access Granted. Loading Prescription...";
        // Logic to show patient data would trigger here
        alert("Success: " + patient.name + "'s portal would now load.");
    } else {
        statusEl.className = "text-sm text-red-600 mt-2";
        statusEl.innerText = "Invalid Invitation Code. Please check your email.";
    }
};

// --- 4. INITIALIZATION HANDSHAKE ---

function initializeApp() {
    console.log("MoveFitRx Build 7: Engine Started.");
    
    // Populate Diagnosis Dropdown
    const diagSelect = document.getElementById('diagnosis-select');
    if (diagSelect) {
        diagSelect.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
    
    // Initial Render of Seed Data
    window.renderDoctorPatientList();
}

// Execute initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
