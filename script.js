/**
 * CRITICAL INSTRUCTION: This script is a STABLE, PUBLICLY DEPLOYABLE DEMO.
 * It strictly adheres to the NO FIREBASE/Database SDKs rule.
 * All data operations (Referral, Payment Status Lookup, RWE results)
 * occur exclusively on local JavaScript arrays in memory.
 */

// --- CORE DATA MODELS (Local Mock Data) ---
const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    phone: '(555) 123-4567',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
};

const GYM_DETAILS = {
    name: 'Coronado Fitness Club',
    address: '875 Orange Ave suite 101, Coronado, CA 92118',
    website: 'https://www.coronadofitnessclub.com/',
};

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }, 
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': {
        url: 'https://movefitrx.com/regimen/hormonal-strength',
        totalSteps: 3, 
        steps: [
            { machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min', matrixWorkoutId: 'MXW-HRM-01' },
            { machine: 'Leg Press', activity: '3 Sets x 12 Reps', matrixWorkoutId: 'MXW-HRM-02' },
            { machine: 'Diverging Seated Row', activity: '3 Sets x 10 Reps', matrixWorkoutId: 'MXW-HRM-03' },
        ]
    },
    'Bone Density & Balance': {
        url: 'https://movefitrx.com/regimen/bone-density',
        totalSteps: 3,
        steps: [
            { machine: 'Treadmill', activity: 'Brisk Walk w/ Low Incline 30 min', matrixWorkoutId: 'MXW-BND-01' },
            { machine: 'Calf Extension', activity: '3 Sets x 15 Reps (Light)', matrixWorkoutId: 'MXW-BND-02' },
            { machine: 'Hip Adductor', activity: '3 Sets x 12 Reps', matrixWorkoutId: 'MXW-BND-03' },
        ]
    },
    'Cardio Endurance & Insulin Sensitivity': {
        url: 'https://movefitrx.com/regimen/cardio-insulin',
        totalSteps: 2,
        steps: [
            { machine: 'Ascent Trainer', activity: 'Steady State 45 min', matrixWorkoutId: 'MXW-CDI-01' },
            { machine: 'Pec Fly', activity: '3 Sets x 15 Reps (Circuit)', matrixWorkoutId: 'MXW-CDI-02' },
        ]
    },
    'Cardio Vascular Health': { 
        url: 'https://movefitrx.com/regimen/cardio-vascular-health',
        totalSteps: 2,
        steps: [
            { machine: 'Treadmill', activity: 'Aerobic Walk 40 min (Target HR: 110-130)', matrixWorkoutId: 'MXW-CVH-01' },
            { machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps (Low Resistance)', matrixWorkoutId: 'MXW-CVH-02' },
        ]
    },
};

// Global Mock Data Arrays
let MOCK_CREDENTIALS = [
    { matrixId: 'MFRX-AB001', gymAccessCode: '205101', used: false },
    { matrixId: 'MFRX-CD002', gymAccessCode: '205102', used: false },
    { matrixId: 'MFRX-EF003', gymAccessCode: '205103', used: false }
];
let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null; 

// --- FIXED: DROPDOWN POPULATION LOGIC ---
function populateDiagnosisDropdown() {
    const diagnosisSelect = document.getElementById('diagnosis-select');
    if (diagnosisSelect) {
        diagnosisSelect.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
}

// --- UTILITY FUNCTIONS ---
function getAndMarkAvailableCredential() {
    const credential = MOCK_CREDENTIALS.find(c => !c.used);
    if (credential) {
        credential.used = true;
        return credential;
    }
    return null;
}

function getPatientByMatrixId(matrixId) {
    return REFERRED_PATIENTS.find(p => p.matrixId === matrixId) || null;
}

// --- NAVIGATION ---
window.switchTab = function(tabName, matrixId = null, patientName = null, paymentType = null) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    
    if (tabName !== 'payment') {
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    document.getElementById(`${tabName}-panel`).classList.add('active');

    const container = document.querySelector('.app-container');
    if (tabName === 'doctor') {
        container.classList.add('doctor-view');
        renderDoctorPatientList();
    } else {
        container.classList.remove('doctor-view');
    }
};

// --- DOCTOR PORTAL ---
function setupDoctorPortal() {
    populateDiagnosisDropdown(); // Added fix here
    document.getElementById('referral-form').addEventListener('submit', handleReferral);
}

function handleReferral(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const diagnosisId = form.diagnosis.value;
    
    const credential = getAndMarkAvailableCredential();
    if (!credential) return alert('No credentials left!');

    const diagnosis = DIAGNOSES.find(d => d.id === diagnosisId);
    
    const patientData = {
        name,
        email,
        diagnosisId,
        regimenName: diagnosis.regimen,
        matrixId: credential.matrixId,
        gymAccessCode: credential.gymAccessCode,
        status: 'PENDING_PAYMENT',
        createdAt: Date.now(),
    };
    
    REFERRED_PATIENTS.unshift(patientData);
    form.reset();
    renderDoctorPatientList();
    alert(`Referral Sent for ${name}! Code: ${patientData.matrixId}`);
}

function renderDoctorPatientList() {
    const listEl = document.getElementById('patients-list');
    if (REFERRED_PATIENTS.length === 0) {
        listEl.innerHTML = '<p class="text-gray-500 text-sm">No patients referred yet.</p>';
        return;
    }
    listEl.innerHTML = REFERRED_PATIENTS.map(p => `
        <div class="card bg-white border-l-4 border-yellow-500">
            <p class="font-bold">${p.name}</p>
            <p class="text-xs text-gray-500">ID: ${p.matrixId} | Status: ${p.status}</p>
        </div>
    `).join('');
}

// --- PATIENT PORTAL ---
function setupPatientPortal() {
    document.getElementById('patient-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('matrix-id-input').value.trim().toUpperCase();
        const patient = getPatientByMatrixId(code);
        if (patient) {
            renderPatientData(patient);
        } else {
            alert('Code not found.');
        }
    });
}

function renderPatientData(patient) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');
    display.innerHTML = `
        <div class="card bg-green-50">
            <h3 class="font-bold text-green-800">Welcome, ${patient.name}</h3>
            <p class="text-sm">Regimen: ${patient.regimenName}</p>
            <p class="text-xs mt-2">Access Code: <strong>${patient.gymAccessCode}</strong></p>
        </div>
    `;
}

// --- INIT ---
function initializeApp() {
    setupDoctorPortal();
    setupPatientPortal();
}

window.onload = initializeApp;
