/**
 * MoveFitRx Build 8.16 - FULL CLINICAL RESTORATION
 * RESTORES: NPIs, 36-Session Adherence, Matrix Machine Protocols, and Binkey Pay.
 * NO TRUNCATION. NO EXTERNAL DEPENDENCIES.
 */

// --- 1. CORE CLINICAL DATA ---
const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    phone: '(555) 123-4567',
    npi_type1: '9876543210', // Individual NPI
    npi_type2: '1234567890', // Organization NPI
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

const WORKOUT_PROTOCOLS = {
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

// --- 2. INITIALIZATION & DATA SEEDING ---
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

        // Seed Sarah's Biometric RWE (3/36 sessions = ~8% Adherence)
        PATIENT_RESULTS.push(
            { patientId: c1.matrixId, machine: 'Treadmill', activity: 'Aerobic Walk 40 min', metrics: 'Distance: 1.5 mi, Avg HR: 132 BPM', date: Date.now() - 86400000 },
            { patientId: c1.matrixId, machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps', metrics: 'Weight: 45 lbs, Vol: 1350 lbs', date: Date.now() - 172800000 },
            { patientId: c1.matrixId, machine: 'Treadmill', activity: 'Aerobic Walk 40 min', metrics: 'Distance: 1.3 mi, Avg HR: 129 BPM', date: Date.now() - 259200000 }
        );

        REFERRED_PATIENTS.push({ name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: 'MFRX-ST02', gymCode: '205101', status: 'PENDING' });
    }
    renderClinicianPortal();
}

// --- 3. CORE NAVIGATION ---
function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    const targetPanel = document.getElementById(t + '-panel');
    const targetBtn = document.getElementById('btn-' + t);
    
    if (targetPanel) targetPanel.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');
    
    if (t === 'doctor') renderClinicianPortal();
}

// --- 4. CLINICIAN LOGIC ---
function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const results = PATIENT_RESULTS.filter(r => r.patientId === p.matrixId).length;
        const progress = Math.min((results / 36) * 100, 100); 
        
        return `
            <div class="card bg-white border-l-4" style="border-left-color: ${p.status === 'PAID' ? '#059669' : '#f59e0b'}; padding:20px; border-radius:15px; margin-bottom:15px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:18px; color:#1f2937;">${p.name}</strong>
                    <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#059669' : '#f59e0b'}; text-transform:uppercase;">${p.status}</span>
                </div>
                <div style="background:#e5e7eb; height:12px; border-radius:6px; margin:12px 0; overflow:hidden;">
                    <div style="background:#2563eb; width:${progress}%; height:100%; border-radius:6px; transition:width 1s;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; font-family:monospace;">
                    <span>CODE: ${p.matrixId}</span>
                    <span>ADHERENCE: ${Math.round(progress)}%</span>
                </div>
            </div>`;
    }).join('');
}

// --- 5. PATIENT LOGIC & BINKEY ---
function handleLogin(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('matrix-id-input');
    const p = REFERRED_PATIENTS.find(x => x.matrixId === idInput.value.toUpperCase());
    
    if (p) {
        document.getElementById('patient-search-form').style.display = 'none';
        document.getElementById('patient-data').classList.remove('hidden');
        renderPatientDashboard(p);
    } else { alert("Invitation Code not found."); }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-data');
    const protocols = WORKOUT_PROTOCOLS[p.regimenName] || [];

    if (p.status === 'PENDING') {
        container.innerHTML = `
            <div class="card bg-white p-8 rounded-3xl shadow-xl border-t-8 border-blue-600">
                <h3 class="text-2xl font-black mb-2">Prescription Ready</h3>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-2xl font-bold mb-4">View LMN Document</button>
                <button onclick="showPaymentSim('${p.matrixId}')" class="w-full bg-green-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg">Authorize HSA/FSA (Binkey)</button>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="card bg-white p-8 rounded-3xl shadow-xl border-t-8 border-green-600 text-center">
                <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Matrix Access Code</h3>
                <p class="text-5xl font-mono font-black text-gray-800 mb-8 tracking-tighter">${p.gymCode}</p>
                <div class="text-left border-t pt-8">
                    ${protocols.map(step => `
                        <div style="background:#f8fafc; padding:20px; border-radius:15px; margin-bottom:15px; border-left:5px solid #2563eb;">
                            <p style="margin:0; font-weight:bold;">${step.machine}</p>
                            <p style="margin:0; font-size:13px; color:#64748b;">${step.activity}</p>
                            <button onclick="pushRWE('${p.matrixId}', '${step.machine}')" style="margin-top:10px; font-size:10px; background:#2563eb; color:white; border:none; padding:8px 12px; border-radius:8px; font-weight:bold;">LOG MATRIX DATA</button>
                        </div>`).join('')}
                </div>
            </div>`;
    }
}

// --- 6. MODAL HANDLERS ---
function openLMNModal(matrixId) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const modal = document.getElementById('payment-modal');
    const display = document.getElementById('payment-modal-content');
    
    display.innerHTML = `
        <div style="font-family:'Times New Roman', serif; padding:40px; border:1px solid #000; background:#fff; text-align:left; color:#000;">
            <h2 style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">LETTER OF MEDICAL NECESSITY</h2>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>Clinical Diagnosis:</strong> ${dx.name} (${dx.code})</p>
            <p><strong>Provider NPI:</strong> ${CLINICIAN_DETAILS.npi_type1}</p>
            <p style="margin-top:20px;">"I certify that MoveFitRx exercise is medically necessary for the treatment of this patient's clinical diagnosis."</p>
            <p style="margin-top:30px; text-align:right;"><strong>${CLINICIAN_DETAILS.name}</strong></p>
        </div>
        <button onclick="document.getElementById('payment-modal').classList.add('hidden')" style="width:100%; padding:15px; background:#2563eb; color:white; border:none; border-radius:0 0 15px 15px; font-weight:bold;">Close</button>`;
    modal.classList.remove('hidden');
}

function showPaymentSim(matrixId) {
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    content.innerHTML = `
        <div style="padding:40px; text-align:center;">
            <h3 class="text-2xl font-black mb-4">Binkey HSA Gateway</h3>
            <p class="text-gray-500 mb-8">Verifying eligibility for Code: ${matrixId}</p>
            <div style="background:#f1f5f9; padding:20px; border-radius:15px; margin-bottom:25px;">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Approved HSA Amount</p>
                <p class="text-3xl font-black text-green-600">$180.00</p>
            </div>
            <button onclick="finalizePay('${matrixId}')" style="width:100%; background:#10b981; color:white; padding:15px; border-radius:10px; font-weight:bold; border:none;">Authorize Transfer</button>
        </div>`;
    modal.classList.remove('hidden');
}

function finalizePay(id) {
    REFERRED_PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    document.getElementById('payment-modal').classList.add('hidden');
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function pushRWE(id, machine) {
    PATIENT_RESULTS.unshift({ patientId: id, machine, date: Date.now() });
    alert(`RWE Synchronized: ${machine} data sent to Clinician.`);
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

// --- 7. BINDING & DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    const diagSelect = document.getElementById('diagnosis-select');
    if (diagSelect) diagSelect.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    document.getElementById('referral-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS[REFERRED_PATIENTS.length] || {matrixId:'MFRX-FULL', code:'999'};
        const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
        const p = { name: e.target.name.value, email: e.target.email.value, diagnosisId: dx.id, regimenName: dx.regimen, matrixId: cred.matrixId, gymCode: cred.code, status: 'PENDING' };
        REFERRED_PATIENTS.unshift(p);
        PENDING_PATIENT_DATA = p;
        renderClinicianPortal();
        document.getElementById('clinician-notification-modal').classList.remove('hidden');
        e.target.reset();
    });

    document.getElementById('patient-search-form').addEventListener('submit', handleLogin);
});

// EXPOSE TO GLOBAL WINDOW
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.openLMNModal = openLMNModal;
window.showPaymentSim = showPaymentSim;
window.finalizePay = finalizePay;
window.pushRWE = pushRWE;
window.closeWelcome = () => document.getElementById('patient-welcome-modal').classList.add('hidden');
window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');
window.closeLMNModal = () => document.getElementById('payment-modal').classList.add('hidden');
window.closeClinicianNotificationModal = () => {
    document.getElementById('clinician-notification-modal').classList.add('hidden');
    switchTab('patient');
    document.getElementById('patient-welcome-modal').classList.remove('hidden');
};