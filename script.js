/**
 * MoveFitRx Build 8.13 - FULL FIDELITY RESTORATION
 * RESTORED: Email Fields, NPIs, 36-Session Adherence, and Machine-Level RWE.
 */

// --- 1. CLINICAL & NPI DATA ---
const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    npi_type1: '9876543210', 
    npi_type2: '1234567890',
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

const MACHINE_PROTOCOLS = {
    'Hormonal Balance & Strength': [
        { machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min' },
        { machine: 'Leg Press', activity: '3 Sets x 12 Reps' },
        { machine: 'Diverging Seated Row', activity: '3 Sets x 10 Reps' }
    ],
    'Bone Density & Balance': [
        { machine: 'Treadmill', activity: 'Brisk Walk 30 min' },
        { machine: 'Calf Extension', activity: '3 Sets x 15 Reps' },
        { machine: 'Hip Adductor', activity: '3 Sets x 12 Reps' }
    ],
    'Cardio Vascular Health': [
        { machine: 'Treadmill', activity: 'Aerobic Walk 40 min' },
        { machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps' }
    ]
};

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, code: `20510${i}` }));
let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null;

// --- 2. INITIALIZATION ---
function initializeApp() {
    if (REFERRED_PATIENTS.length === 0) {
        const c1 = MOCK_CREDENTIALS[0];
        REFERRED_PATIENTS.push({
            name: 'Sarah Connor',
            email: 's.connor@sky.net',
            diagnosisId: 'HYPT',
            regimenName: 'Cardio Vascular Health',
            matrixId: c1.matrixId,
            gymCode: c1.code,
            status: 'PAID'
        });

        // Seed 3 workouts for Sarah to show 8% Adherence (3/36)
        PATIENT_RESULTS.push(
            { patientId: c1.matrixId, machine: 'Treadmill', date: Date.now() - 86400000 },
            { patientId: c1.matrixId, machine: 'Seated Leg Curl', date: Date.now() - 172800000 },
            { patientId: c1.matrixId, machine: 'Treadmill', date: Date.now() - 259200000 }
        );

        REFERRED_PATIENTS.push({ name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: 'MFRX-ST02', gymCode: '205101', status: 'PENDING' });
    }
    renderClinicianPortal();
}

// --- 3. CLINICIAN DASHBOARD ---
function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const resultsCount = PATIENT_RESULTS.filter(r => r.patientId === p.matrixId).length;
        const progress = Math.min((resultsCount / 36) * 100, 100); 
        
        return `
            <div class="card" style="border-left: 5px solid ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}; background:white; padding:15px; border-radius:12px; margin-bottom:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between;">
                    <strong class="text-gray-800">${p.name}</strong>
                    <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">${p.status}</span>
                </div>
                <p style="font-size:11px; color:#64748b; margin:4px 0;">${p.email}</p>
                <div class="progress-bg"><div class="progress-fill" style="width:${progress}%;"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; font-family:monospace;">
                    <span>ID: ${p.matrixId}</span>
                    <span>ADHERENCE: ${Math.round(progress)}%</span>
                </div>
            </div>`;
    }).join('');
}

// --- 4. PATIENT PORTAL ---
function handleLogin(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('matrix-input');
    const p = REFERRED_PATIENTS.find(x => x.matrixId === idInput.value.toUpperCase());
    
    if (p) {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('patient-dash').style.display = 'block';
        renderPatientDashboard(p);
    } else { alert("Invitation Code not found."); }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-dashboard-content');
    const protocols = MACHINE_PROTOCOLS[p.regimenName] || [];

    if (p.status === 'PENDING') {
        container.innerHTML = `
            <div class="card bg-white p-6 rounded-3xl shadow-lg border-t-4 border-blue-600">
                <h3 class="font-bold text-xl mb-2 text-gray-800">Prescription Ready</h3>
                <p class="text-gray-500 mb-6">${p.regimenName}</p>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-2xl font-bold mb-4">View LMN Document</button>
                <button onclick="showPaymentSim('${p.matrixId}')" class="w-full bg-green-600 text-white p-4 rounded-2xl font-bold shadow-lg">Authorize HSA/FSA (Binkey)</button>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="card bg-white p-6 rounded-3xl shadow-lg border-t-4 border-green-600 text-center">
                <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Matrix Access Code</h3>
                <p class="text-4xl font-mono font-black text-gray-800 mb-6">${p.gymCode}</p>
                <div class="text-left border-t pt-6">
                    <p class="font-bold text-sm uppercase text-blue-600 mb-4 tracking-wider">Assigned Protocols:</p>
                    ${protocols.map(step => `
                        <div class="bg-gray-50 p-4 rounded-2xl mb-4 border-l-4 border-blue-600">
                            <p class="font-bold text-gray-800">${step.machine}</p>
                            <p class="text-xs text-gray-500 mb-3">${step.activity}</p>
                            <button onclick="pushRWE('${p.matrixId}', '${step.machine}')" class="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">LOG MATRIX SESSION</button>
                        </div>`).join('')}
                </div>
            </div>`;
    }
}

// --- 5. MODALS & PAYMENTS ---
function openLMNModal(matrixId) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const content = document.getElementById('action-content');
    
    content.innerHTML = `
        <div class="lmn-paper" style="font-family:'Times New Roman', serif; padding:30px; background:white; color:black;">
            <h2 style="text-align:center; border-bottom:2px solid black; padding-bottom:10px;">LETTER OF MEDICAL NECESSITY</h2>
            <p><strong>Date:</strong> ${CLINICIAN_DETAILS.date}</p>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>Diagnosis:</strong> ${dx.name} (ICD-10: ${dx.code})</p>
            <p><strong>Provider NPI:</strong> ${CLINICIAN_DETAILS.npi_type1}</p>
            <p style="margin-top:20px;">"I certify that MoveFitRx exercise is medically necessary for the treatment of this patient's clinical diagnosis."</p>
            <p style="margin-top:20px; text-align:right;"><strong>${CLINICIAN_DETAILS.name}</strong></p>
        </div>
        <button onclick="document.getElementById('modal-action').classList.remove('active')" class="w-full p-4 bg-blue-600 text-white font-bold rounded-b-3xl">Close Document</button>`;
    document.getElementById('modal-action').classList.add('active');
}

function showPaymentSim(matrixId) {
    const content = document.getElementById('action-content');
    content.innerHTML = `
        <div class="p-10 text-center">
            <h3 class="text-2xl font-black mb-2">Binkey Gateway</h3>
            <p class="text-gray-500 mb-6">Verifying eligibility for ICD-10: ${REFERRED_PATIENTS.find(x => x.matrixId === matrixId).diagnosisId}</p>
            <div class="bg-gray-50 p-6 rounded-3xl mb-6">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Approved HSA Amount</p>
                <p class="text-3xl font-black text-green-600">$180.00</p>
            </div>
            <button onclick="finalizePay('${matrixId}')" class="w-full bg-green-600 text-white p-5 rounded-2xl font-bold shadow-xl">Authorize HSA Transfer</button>
        </div>`;
    document.getElementById('modal-action').classList.add('active');
}

function finalizePay(id) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    p.status = 'PAID';
    document.getElementById('modal-action').classList.remove('active');
    renderPatientDashboard(p);
}

function pushRWE(id, machine) {
    PATIENT_RESULTS.unshift({ patientId: id, machine, date: Date.now() });
    alert(`RWE Synchronized: ${machine} data sent to Clinician.`);
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

// --- 6. NAVIGATION & STARTUP ---
function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
    if (t === 'doctor') renderClinicianPortal();
}

function closeWelcome() {
    document.getElementById('modal-welcome').classList.remove('active');
    switchTab('patient');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    document.getElementById('diagnosis-select').innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    document.getElementById('referral-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('ref-name').value;
        const email = document.getElementById('ref-email').value; // RESTORED EMAIL FIELD
        const cred = MOCK_CREDENTIALS[REFERRED_PATIENTS.length] || {matrixId:'MFRX-FULL', code:'999'};
        const dx = DIAGNOSES.find(d => d.id === document.getElementById('diagnosis-select').value);
        
        const p = { name, email, diagnosisId: dx.id, regimenName: dx.regimen, matrixId: cred.matrixId, gymCode: cred.code, status: 'PENDING' };
        REFERRED_PATIENTS.unshift(p);
        PENDING_PATIENT_DATA = p;
        
        renderClinicianPortal();
        document.getElementById('show-id').textContent = p.matrixId;
        document.getElementById('modal-welcome').classList.add('active');
        e.target.reset();
    });
});

window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.openLMNModal = openLMNModal;
window.showPaymentSim = showPaymentSim;
window.finalizePay = finalizePay;
window.pushRWE = pushRWE;
window.closeWelcome = closeWelcome;