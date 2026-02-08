/**
 * MoveFitRx Stable PoC - Build 8.2 (Data Persistence & Error Shield)
 */

// --- 1. CORE DATA MODELS ---
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

// --- 2. INITIALIZATION ---
function initializeState() {
    if (REFERRED_PATIENTS.length === 0) {
        const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
        const c2 = MOCK_CREDENTIALS[1]; c2.used = true;
        REFERRED_PATIENTS.push({ name: 'Sarah Connor', email: 's.connor@sky.net', diagnosisId: 'HYPT', regimenName: 'Cardio Vascular Health', matrixId: c1.matrixId, gymAccessCode: c1.gymAccessCode, status: 'PAID', createdAt: Date.now() - 432000000 });
        REFERRED_PATIENTS.push({ name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: c2.matrixId, gymAccessCode: c2.gymAccessCode, status: 'PENDING_PAYMENT', createdAt: Date.now() - 172800000 });
    }
}

// --- 3. UI & NAVIGATION ---
function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const panel = document.getElementById(`${tab}-panel`);
    if (panel) panel.classList.add('active');
    
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'doctor') renderDoctorPatientList();
}

// --- 4. WORKFLOW HAND-OFF ---
function openPatientWelcome(patient) {
    const modal = document.getElementById('patient-welcome-modal');
    if (!modal) return;

    // Safety checks for text elements
    const nameEl = document.getElementById('welcome-patient-name');
    const idEl = document.getElementById('welcome-matrix-id');
    
    if (nameEl) nameEl.textContent = patient.name;
    if (idEl) idEl.textContent = patient.matrixId;
    
    modal.classList.remove('hidden');
}

// --- 5. PATIENT DASHBOARD & LOGIN ---
function handlePatientLogin(e) {
    if (e) e.preventDefault(); // Stop page refresh
    const input = document.querySelector('#patient-login-form input[name="matrixId"]');
    const id = input ? input.value : '';
    
    const patient = REFERRED_PATIENTS.find(p => p.matrixId === id);
    
    if (patient) {
        document.getElementById('patient-login-section').classList.add('hidden');
        const dash = document.getElementById('patient-dashboard');
        if (dash) dash.classList.remove('hidden');
        renderPatientDashboard(patient);
    } else {
        alert("Invitation Code not found. Please check your email simulation.");
    }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-dashboard-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-600">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome, ${p.name}</h2>
            <p class="mb-6 text-gray-600">Status: <span class="font-bold text-yellow-600">${p.status.replace('_',' ')}</span></p>
            
            ${p.status === 'PENDING_PAYMENT' ? `
                <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                    <p class="text-sm text-blue-800 mb-4">Your provider has prescribed <strong>${p.regimenName}</strong>. This is eligible for HSA/FSA reimbursement.</p>
                    <button onclick="startBinkeySimulation('${p.matrixId}')" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">
                        Verify & Pay with Binkey
                    </button>
                </div>
            ` : `
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p class="text-green-800 font-bold mb-2">Payment Verified via HSA/FSA</p>
                    <p class="text-sm text-gray-700">Gym Access Code: <span class="text-lg font-mono font-bold">${p.gymAccessCode}</span></p>
                    <p class="text-xs text-gray-500 mt-2">Present this code at Coronado Fitness Club.</p>
                </div>
            `}
        </div>
    `;
}

function startBinkeySimulation(matrixId) {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    
    if (confirm(`Binkey HSA/FSA Eligibility:\n\nDiagnosis: ${dx.name} (${dx.code})\nPrescription: ${p.regimenName}\n\nAuthorized: $180.00\n\nProcess Payment?`)) {
        p.status = 'PAID';
        renderPatientDashboard(p);
    }
}

// --- 6. CLINICIAN RENDER ---
function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const color = p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500';
        return `<div class="card bg-white border-l-4 ${color} p-4 mb-2 shadow-sm">
            <p class="font-bold">${p.name}</p>
            <p class="text-xs text-gray-500">${dx.name} | ${p.matrixId}</p>
        </div>`;
    }).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("Out of Credentials");
    
    cred.used = true;
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const newPatient = {
        name: e.target.name.value, email: e.target.email.value, diagnosisId: dx.id,
        regimenName: dx.regimen, matrixId: cred.matrixId, gymAccessCode: cred.gymAccessCode,
        status: 'PENDING_PAYMENT', createdAt: Date.now()
    };

    REFERRED_PATIENTS.unshift(newPatient);
    PENDING_PATIENT_DATA = newPatient;
    renderDoctorPatientList();

    const modal = document.getElementById('clinician-notification-modal');
    const content = document.getElementById('clinician-notification-content');
    if (content) content.innerHTML = `<div class="p-6 text-center"><h3 class="text-xl font-bold text-green-700">Referral Successful</h3><p>Invitation sent to ${newPatient.name}</p></div>`;
    if (modal) modal.classList.remove('hidden');
    e.target.reset();
}

// --- 7. STARTUP ---
function initializeApp() {
    initializeState();
    const select = document.getElementById('diagnosis-select');
    if (select) select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    renderDoctorPatientList();

    // Bind Forms
    const refForm = document.getElementById('referral-form');
    if (refForm) refForm.addEventListener('submit', handleReferral);
    
    const loginForm = document.getElementById('patient-login-form');
    if (loginForm) loginForm.addEventListener('submit', handlePatientLogin);

    // Bind Modal Button
    const closeBtn = document.getElementById('close-clinician-notification-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
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