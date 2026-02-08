/**
 * MoveFitRx Full Workflow - Build 8.1 (Stabilized)
 */

// --- 1. CORE DATA MODELS ---
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
let PENDING_PATIENT_DATA = null;

// --- 2. INITIALIZATION ---
function initializeState() {
    if (REFERRED_PATIENTS.length === 0) {
        const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
        const c2 = MOCK_CREDENTIALS[1]; c2.used = true;

        REFERRED_PATIENTS.push({
            name: 'Sarah Connor', email: 's.connor@sky.net', diagnosisId: 'HYPT',
            regimenName: 'Cardio Vascular Health', matrixId: c1.matrixId,
            gymAccessCode: c1.gymAccessCode, status: 'PAID', createdAt: Date.now() - 432000000
        });

        REFERRED_PATIENTS.push({
            name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE',
            regimenName: 'Bone Density & Balance', matrixId: c2.matrixId,
            gymAccessCode: c2.gymAccessCode, status: 'PENDING_PAYMENT', createdAt: Date.now() - 172800000
        });
    }
}

// --- 3. UI & NAVIGATION ---
function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}-panel`).classList.add('active');
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'doctor') renderDoctorPatientList();
}

// --- 4. CLINICIAN LOGIC ---
function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const color = p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500';
        const textClass = p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600';
        
        return `
            <div class="card bg-white border-l-4 ${color} p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onclick="alert('Regimen: ${p.regimenName}\\nICD-10: ${dx.code}')">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-lg font-bold text-gray-800">${p.name}</p>
                        <p class="text-sm text-gray-500">${dx.name}</p>
                    </div>
                    <span class="text-xs font-black px-2 py-1 rounded bg-gray-100 ${textClass}">${p.status.replace('_', ' ')}</span>
                </div>
            </div>`;
    }).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("System error: No Matrix Credentials remaining.");

    cred.used = true;
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);

    const newPatient = {
        name: e.target.name.value,
        email: e.target.email.value,
        diagnosisId: dx.id,
        regimenName: dx.regimen,
        matrixId: cred.matrixId,
        gymAccessCode: cred.gymAccessCode,
        status: 'PENDING_PAYMENT',
        createdAt: Date.now()
    };

    REFERRED_PATIENTS.unshift(newPatient);
    PENDING_PATIENT_DATA = newPatient;

    renderDoctorPatientList();
    
    // Success Modal UI
    const modal = document.getElementById('clinician-notification-modal');
    const content = document.getElementById('clinician-notification-content');
    content.innerHTML = `
        <div class="p-6 text-center">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-2xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Referral Completed</h3>
            <p class="text-gray-600 mb-4">Prescription sent to <strong>${newPatient.name}</strong>.</p>
            <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-xs font-bold text-gray-400 uppercase">Prescription Data</p>
                <p class="text-sm text-gray-700"><strong>DX:</strong> ${dx.name}</p>
                <p class="text-sm text-gray-700"><strong>ID:</strong> ${newPatient.matrixId}</p>
            </div>
        </div>`;
    modal.classList.remove('hidden');
    e.target.reset();
}

// --- 5. PATIENT & BINKEY WORKFLOW ---
function openPatientWelcome(patient) {
    const modal = document.getElementById('patient-welcome-modal');
    document.getElementById('welcome-patient-name').textContent = patient.name;
    document.getElementById('welcome-matrix-id').textContent = patient.matrixId;
    modal.classList.remove('hidden');
}

function startBinkeySimulation(matrixId) {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    
    const confirmed = confirm(
        `Binkey HSA/FSA Eligibility Check:\n\n` +
        `Diagnosis: ${dx.name} (${dx.code})\n` +
        `Prescription: MoveFitRx Corrective Exercise\n\n` +
        `Authorized Amount: $180.00\n\n` +
        `Approve HSA/FSA payment?`
    );

    if (confirmed) {
        p.status = 'PAID';
        alert("Payment Processed. Gym Access Code: " + p.gymAccessCode);
        switchTab('doctor'); // Show updated status in list
    }
}

// --- 6. STARTUP ---
function initializeApp() {
    console.log("MoveFitRx System: BUILD 8.1 ONLINE");
    initializeState();
    
    const select = document.getElementById('diagnosis-select');
    if (select) select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    renderDoctorPatientList();

    const refForm = document.getElementById('referral-form');
    if (refForm) refForm.addEventListener('submit', handleReferral);

    const closeNotifyBtn = document.getElementById('close-clinician-notification-btn');
    if (closeNotifyBtn) {
        closeNotifyBtn.onclick = function() {
            document.getElementById('clinician-notification-modal').classList.add('hidden');
            if (PENDING_PATIENT_DATA) {
                switchTab('patient');
                openPatientWelcome(PENDING_PATIENT_DATA);
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.switchTab = switchTab;
window.startBinkeySimulation = startBinkeySimulation;