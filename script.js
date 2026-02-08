/**
 * MoveFitRx Full Fidelity - Build 8.3
 * Restores professional UI, LMN data, and modal hand-offs.
 */

// --- 1. DATA MODELS ---
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

// --- 3. NAVIGATION ---
function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}-panel`).classList.add('active');
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'doctor') renderDoctorPatientList();
}

// --- 4. CLINICIAN WORKFLOW ---
function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const color = p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500';
        const textClass = p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600';
        
        return `
            <div class="card bg-white border-l-4 ${color} p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onclick="alert('Rx: ${p.regimenName}\\nCode: ${dx.code}')">
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
    
    // Show Professional Modal
    const modal = document.getElementById('clinician-notification-modal');
    const content = document.getElementById('clinician-notification-content');
    if (content) {
        content.innerHTML = `
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Referral Completed</h3>
                <p class="text-gray-600 mb-4">Invitation sent to <strong>${newPatient.name}</strong>.</p>
                <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p class="text-sm"><strong>Diagnosis:</strong> ${dx.name} (${dx.code})</p>
                    <p class="text-sm"><strong>Program:</strong> ${dx.regimen}</p>
                </div>
            </div>`;
    }
    modal.classList.remove('hidden');
    e.target.reset();
}

// --- 5. PATIENT & MODAL FIXES ---
function openPatientWelcome(patient) {
    const modal = document.getElementById('patient-welcome-modal');
    if (!modal) return;
    
    const nameEl = document.getElementById('welcome-patient-name');
    const idEl = document.getElementById('welcome-matrix-id');
    
    if (nameEl) nameEl.textContent = patient.name;
    if (idEl) idEl.textContent = patient.matrixId;
    
    modal.classList.remove('hidden');
}

// FIX: This is the missing function that caused the Line 28 crash
function closePatientWelcomeModal() {
    const modal = document.getElementById('patient-welcome-modal');
    if (modal) modal.classList.add('hidden');
}

function handlePatientLogin(e) {
    if (e) e.preventDefault();
    const input = document.querySelector('#patient-login-form input[name="matrixId"]');
    const id = input ? input.value : '';
    const patient = REFERRED_PATIENTS.find(p => p.matrixId === id);
    
    if (patient) {
        document.getElementById('patient-login-section').classList.add('hidden');
        document.getElementById('patient-dashboard').classList.remove('hidden');
        renderPatientDashboard(patient);
    } else {
        alert("Invitation Code not found.");
    }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-dashboard-content');
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-600">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome, ${p.name}</h2>
            <p class="mb-6 text-gray-600">Prescription Status: <span class="font-bold text-yellow-600">${p.status.replace('_',' ')}</span></p>
            
            ${p.status === 'PENDING_PAYMENT' ? `
                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p class="text-blue-900 font-bold mb-1">Medically Necessary Prescribed Service:</p>
                    <p class="text-blue-800 mb-4">${p.regimenName} (Diagnosis: ${dx.code})</p>
                    <button onclick="startBinkeySimulation('${p.matrixId}')" class="w-full bg-green-600 text-white font-bold py-4 rounded-lg shadow-md hover:bg-green-700 transition">
                        Pay with Binkey (HSA/FSA)
                    </button>
                </div>
            ` : `
                <div class="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                    <p class="text-green-800 font-bold text-xl mb-2">Payment Verified</p>
                    <p class="text-gray-700">Present this Gym Access Code at Coronado Fitness Club:</p>
                    <p class="text-3xl font-mono font-black text-green-700 mt-2">${p.gymAccessCode}</p>
                </div>
            `}
        </div>`;
}

function startBinkeySimulation(matrixId) {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    
    if (confirm(`Binkey Eligibility Check:\n\nICD-10: ${dx.code}\nPrescription: ${p.regimenName}\n\nAuthorized HSA/FSA Amount: $180.00\n\nProcess with Binkey?`)) {
        p.status = 'PAID';
        renderPatientDashboard(p);
    }
}

// --- 6. STARTUP ---
function initializeApp() {
    initializeState();
    const select = document.getElementById('diagnosis-select');
    if (select) select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    renderDoctorPatientList();

    if (document.getElementById('referral-form')) document.getElementById('referral-form').addEventListener('submit', handleReferral);
    if (document.getElementById('patient-login-form')) document.getElementById('patient-login-form').addEventListener('submit', handlePatientLogin);

    // Close Notification Bridge
    const closeNotifyBtn = document.getElementById('close-clinician-notification-btn');
    if (closeNotifyBtn) {
        closeNotifyBtn.onclick = () => {
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
window.closePatientWelcomeModal = closePatientWelcomeModal; // FIX EXPOSURE