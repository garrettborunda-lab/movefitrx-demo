/**
 * MoveFitRx Full Workflow - Build 7.9
 * Unlocks: Referral -> Patient Welcome -> Binkey Payment -> LMN -> Gym Access
 */

// --- DATA LAYER ---
const CLINICIAN_DETAILS = { name: 'Dr. Jane Foster, MD', clinic: 'MoveFitRx Clinical Group', phone: '(555) 123-4567', date: new Date().toLocaleDateString() };
const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }
];

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, gymAccessCode: `20510${i}`, used: false }));
let REFERRED_PATIENTS = [];
let PENDING_PATIENT_DATA = null;

// --- WORKFLOW ENGINE ---

function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-panel`).classList.add('active');
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');
}

// 1. DOCTOR SIDE: Referral
function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("System error: No Credentials");
    
    cred.used = true;
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const patient = {
        name: e.target.name.value,
        email: e.target.email.value,
        diagnosisId: dx.id,
        regimenName: dx.regimen,
        matrixId: cred.matrixId,
        gymAccessCode: cred.gymAccessCode,
        status: 'PENDING_PAYMENT',
        createdAt: Date.now()
    };

    REFERRED_PATIENTS.unshift(patient);
    PENDING_PATIENT_DATA = patient; // Save for the hand-off
    
    renderDoctorPatientList();
    document.getElementById('clinician-notification-content').innerHTML = `
        <div class="p-4 text-center">
            <h3 class="text-xl font-bold text-green-600">Referral Sent</h3>
            <p>Prescription for ${patient.name} is active.</p>
        </div>`;
    document.getElementById('clinician-notification-modal').classList.remove('hidden');
    e.target.reset();
}

// 2. THE BRIDGE: Hand-off to Patient
function closeClinicianNotification() {
    document.getElementById('clinician-notification-modal').classList.add('hidden');
    if (PENDING_PATIENT_DATA) {
        switchTab('patient');
        openPatientWelcome(PENDING_PATIENT_DATA);
    }
}

function openPatientWelcome(patient) {
    document.getElementById('welcome-patient-name').textContent = patient.name;
    document.getElementById('welcome-matrix-id').textContent = patient.matrixId;
    document.getElementById('patient-welcome-modal').classList.remove('hidden');
}

// 3. PATIENT SIDE: Login & Payment
function handlePatientLogin(e) {
    e.preventDefault();
    const id = e.target.matrixId.value;
    const patient = REFERRED_PATIENTS.find(p => p.matrixId === id);
    
    if (patient) {
        document.getElementById('patient-login-section').classList.add('hidden');
        document.getElementById('patient-dashboard').classList.remove('hidden');
        renderPatientDashboard(patient);
    } else {
        alert("Invalid ID");
    }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-dashboard-content');
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
            <h2 class="text-2xl font-bold mb-2">Welcome, ${p.name}</h2>
            <p class="text-gray-600 mb-4">Prescription Status: <span class="font-bold text-yellow-600">${p.status}</span></p>
            ${p.status === 'PENDING_PAYMENT' ? 
                `<button onclick="startBinkeySimulation('${p.matrixId}')" class="w-full bg-green-600 text-white p-4 rounded-lg font-bold">Complete HSA/FSA Payment (Binkey)</button>` 
                : `<p class="text-green-600 font-bold">Payment Complete. Gym Access Code: ${p.gymAccessCode}</p>`}
        </div>`;
}

// 4. THE BINKEY / LMN STEP
function startBinkeySimulation(matrixId) {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    
    // Simulate Binkey LMN verification
    const confirmed = confirm(`Binkey HSA/FSA Verification:\n\nPrescription found for: ${dx.name}\nMedically Necessary Regimen: ${p.regimenName}\n\nProceed with payment?`);
    
    if (confirmed) {
        p.status = 'PAID';
        alert("Payment Successful! Your Letter of Medical Necessity has been generated and gym access is now unlocked.");
        renderPatientDashboard(p);
    }
}

// --- INITIALIZATION ---
function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (list) {
        list.innerHTML = REFERRED_PATIENTS.map(p => `<div class="p-3 border-b">${p.name} - ${p.status}</div>`).join('');
    }
}

function initializeApp() {
    // Seed Sarah & Jessica
    const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
    REFERRED_PATIENTS.push({ name: 'Sarah Connor', diagnosisId: 'HYPT', matrixId: c1.matrixId, status: 'PAID', gymAccessCode: c1.gymAccessCode });
    const c2 = MOCK_CREDENTIALS[1]; c2.used = true;
    REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', matrixId: c2.matrixId, status: 'PENDING_PAYMENT', gymAccessCode: c2.gymAccessCode });

    const diagSelect = document.getElementById('diagnosis-select');
    if (diagSelect) diagSelect.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    renderDoctorPatientList();

    // Event Bindings
    document.getElementById('referral-form').addEventListener('submit', handleReferral);
    document.getElementById('patient-login-form').addEventListener('submit', handlePatientLogin);
    document.getElementById('close-clinician-notification-btn').onclick = closeClinicianNotification;
    document.getElementById('close-patient-welcome-btn').onclick = () => document.getElementById('patient-welcome-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.switchTab = switchTab;
window.startBinkeySimulation = startBinkeySimulation;