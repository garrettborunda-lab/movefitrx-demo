/**
 * MoveFitRx Stable PoC - Build 7.8 (MAXIMUM FIDELITY RESTORATION)
 * Full Clinical Workflow, RWE Simulation, and Patient Hand-off logic.
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

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': { steps: 3, url: 'https://movefitrx.com/regimen/hormonal-strength' },
    'Bone Density & Balance': { steps: 3, url: 'https://movefitrx.com/regimen/bone-density' },
    'Cardio Endurance & Insulin Sensitivity': { steps: 2, url: 'https://movefitrx.com/regimen/cardio-insulin' },
    'Cardio Vascular Health': { steps: 2, url: 'https://movefitrx.com/regimen/cardio-vascular-health' }
};

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, gymAccessCode: `20510${i}`, used: false }));
let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = [];
let PENDING_PATIENT_DATA = null;

// --- 2. CORE UTILITIES ---
const getPatientByMatrixId = (id) => REFERRED_PATIENTS.find(p => p.matrixId === id);

function initializeState() {
    if (REFERRED_PATIENTS.length === 0) {
        // Seed Sarah Connor
        const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
        const sarah = {
            name: 'Sarah Connor', email: 's.connor@sky.net', diagnosisId: 'HYPT',
            regimenName: 'Cardio Vascular Health', matrixId: c1.matrixId,
            gymAccessCode: c1.gymAccessCode, status: 'PAID', createdAt: Date.now() - 432000000
        };
        REFERRED_PATIENTS.push(sarah);
        
        // Mock some RWE data for Sarah
        PATIENT_RESULTS.push({ patientMatrixId: c1.matrixId, machine: 'Treadmill', activity: 'Aerobic Walk', completedAt: new Date(Date.now() - 86400000) });

        // Seed Jessica Jones
        const c2 = MOCK_CREDENTIALS[1]; c2.used = true;
        REFERRED_PATIENTS.push({
            name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE',
            regimenName: 'Bone Density & Balance', matrixId: c2.matrixId,
            gymAccessCode: c2.gymAccessCode, status: 'PENDING_PAYMENT', createdAt: Date.now() - 172800000
        });
    }
}

// --- 3. UI TAB NAVIGATION ---
function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(`${tab}-panel`);
    if (target) target.classList.add('active');
    
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'doctor') renderDoctorPatientList();
}

// --- 4. CLINICIAN PORTAL LOGIC ---
function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const color = p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500';
        const progress = p.status === 'PAID' ? 15 : 0; // Simple simulation

        return `
            <div class="card bg-white border-l-4 ${color} p-4 mb-3 shadow-sm hover:bg-gray-50 cursor-pointer" onclick="showPatientDetails('${p.matrixId}')">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-lg font-bold">${p.name}</p>
                        <p class="text-sm text-gray-600">${dx.name}</p>
                    </div>
                    <p class="text-xs font-bold uppercase ${p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}">${p.status.replace('_',' ')}</p>
                </div>
                <div class="mt-3">
                    <p class="text-xs text-gray-400 font-mono">ID: ${p.matrixId}</p>
                    ${p.status === 'PAID' ? `<div class="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div class="bg-blue-600 h-1.5 rounded-full" style="width: ${progress}%"></div></div>` : ''}
                </div>
            </div>`;
    }).join('');
}

function showPatientDetails(matrixId) {
    const p = getPatientByMatrixId(matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    alert(`CLINICAL VIEW: ${p.name}\n\nPrescribed Regimen: ${p.regimenName}\nICD-10 Code: ${dx.code}\n\nThis patient is monitored via Matrix specialized equipment. Real-World Evidence (RWE) is currently being collected.`);
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("System out of credentials.");

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
    
    // Show Success Modal
    const modal = document.getElementById('clinician-notification-modal');
    const content = document.getElementById('clinician-notification-content');
    content.innerHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold text-green-700 mb-2">Referral Completed</h3>
            <p class="text-gray-700">The prescription for <strong>${newPatient.name}</strong> has been created. A secure invitation has been sent to ${newPatient.email}.</p>
            <div class="mt-4 p-3 bg-gray-50 border rounded text-xs font-mono">
                REGIMEN: ${newPatient.regimenName}<br>
                AUTH_ID: ${newPatient.matrixId}
            </div>
        </div>`;
    modal.classList.remove('hidden');
    e.target.reset();
}

// --- 5. PATIENT PORTAL LOGIC ---
function openWelcomeModal(patient) {
    const modal = document.getElementById('patient-welcome-modal');
    document.getElementById('welcome-patient-name').textContent = patient.name;
    document.getElementById('welcome-matrix-id').textContent = patient.matrixId;
    modal.classList.remove('hidden');
}

// --- 6. STARTUP & EVENT BINDING ---
function initializeApp() {
    console.log("MoveFitRx System: FULL BUILD 7.8 ONLINE");
    initializeState();
    
    const diagSelect = document.getElementById('diagnosis-select');
    if (diagSelect) diagSelect.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    renderDoctorPatientList();
    
    const refForm = document.getElementById('referral-form');
    if (refForm) refForm.addEventListener('submit', handleReferral);

    // Modal Close Button Logic (The "Bridge")
    const closeNotifyBtn = document.getElementById('close-clinician-notification-btn');
    if (closeNotifyBtn) {
        closeNotifyBtn.onclick = () => {
            document.getElementById('clinician-notification-modal').classList.add('hidden');
            if (PENDING_PATIENT_DATA) {
                switchTab('patient');
                openWelcomeModal(PENDING_PATIENT_DATA);
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.switchTab = switchTab;