/**
 * MoveFitRx Build 8.17 - THE FULL RESTORATION
 * Source: Build 7 Clinical Engine
 */

// --- CLINICAL MODELS ---
const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    phone: '(555) 123-4567',
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

const WORKOUT_DETAILS = {
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

let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null;

// --- INITIALIZATION ---
function initializeApp() {
    // Seed Sarah & Jessica
    REFERRED_PATIENTS.push({
        name: 'Sarah Connor',
        email: 's.connor@sky.net',
        diagnosisId: 'HYPT',
        regimenName: 'Cardio Vascular Health',
        matrixId: 'MFRX-ST01',
        gymCode: '205100',
        status: 'PAID'
    });

    PATIENT_RESULTS.push(
        { patientId: 'MFRX-ST01', machine: 'Treadmill', date: Date.now() - 86400000 },
        { patientId: 'MFRX-ST01', machine: 'Seated Leg Curl', date: Date.now() - 172800000 },
        { patientId: 'MFRX-ST01', machine: 'Treadmill', date: Date.now() - 259200000 }
    );

    REFERRED_PATIENTS.push({
        name: 'Jessica Jones',
        email: 'j.jones@alias.com',
        diagnosisId: 'OSTE',
        regimenName: 'Bone Density & Balance',
        matrixId: 'MFRX-ST02',
        gymCode: '205101',
        status: 'PENDING'
    });

    const sel = document.getElementById('diagnosis-select');
    if (sel) sel.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    renderClinicianPortal();
}

// --- CORE FUNCTIONS ---
function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    
    const panel = document.getElementById(t + '-panel');
    if (panel) panel.classList.add('active');
    
    const tab = document.getElementById(t + '-tab');
    if (tab) tab.classList.add('active');

    if (t === 'doctor') renderClinicianPortal();
}

function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const results = PATIENT_RESULTS.filter(r => r.patientId === p.matrixId).length;
        const progress = Math.min((results / 36) * 100, 100);
        return `
            <div class="card bg-white p-5 rounded-2xl shadow-sm mb-4 border-l-4" style="border-left-color: ${p.status === 'PAID' ? '#059669' : '#f59e0b'}">
                <div class="flex justify-between items-center mb-2">
                    <strong class="text-gray-800">${p.name}</strong>
                    <span class="text-[10px] font-black uppercase" style="color:${p.status === 'PAID' ? '#059669' : '#f59e0b'}">${p.status}</span>
                </div>
                <div class="bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                    <div class="bg-blue-600 h-full transition-all duration-1000" style="width:${progress}%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>${p.matrixId}</span>
                    <span>ADHERENCE: ${Math.round(progress)}%</span>
                </div>
            </div>`;
    }).join('');
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('matrix-id-input');
    const p = REFERRED_PATIENTS.find(x => x.matrixId === idInput.value.toUpperCase());
    if (p) {
        document.getElementById('patient-search-form').style.display = 'none';
        document.getElementById('patient-data').classList.remove('hidden');
        renderPatientDashboard(p);
    } else { alert("Code not found."); }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-data');
    const steps = WORKOUT_DETAILS[p.regimenName] || [];

    if (p.status === 'PENDING') {
        container.innerHTML = `
            <div class="card bg-white p-8 rounded-3xl shadow-xl border-t-8 border-blue-600">
                <h3 class="text-xl font-bold mb-4">Prescription Ready</h3>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-xl font-bold mb-4">View LMN</button>
                <button onclick="showPaymentSim('${p.matrixId}')" class="w-full bg-green-600 text-white p-4 rounded-xl font-bold uppercase shadow-lg">Pay with HSA (Binkey)</button>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="card bg-white p-8 rounded-3xl shadow-xl border-t-8 border-green-600 text-center">
                <h3 class="text-gray-400 uppercase text-xs font-bold mb-2">Matrix Code</h3>
                <p class="text-4xl font-mono font-black mb-6">${p.gymCode}</p>
                <div class="text-left border-t pt-6">
                    ${steps.map(s => `
                        <div class="bg-gray-50 p-4 rounded-xl mb-3 border-l-4 border-blue-600">
                            <p class="font-bold text-sm">${s.machine}</p>
                            <p class="text-xs text-gray-500">${s.activity}</p>
                            <button onclick="pushRWE('${p.matrixId}', '${s.machine}')" class="mt-2 text-[10px] bg-blue-600 text-white px-3 py-1 rounded-lg">Push Matrix Data</button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }
}

function pushRWE(id, machine) {
    PATIENT_RESULTS.unshift({ patientId: id, machine, date: Date.now() });
    alert("Biometric data pushed to clinician.");
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function openLMNModal(id) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const content = document.getElementById('lmn-content-display');
    content.innerHTML = `
        <div style="font-family:serif; padding:30px; border:1px solid #000; background:#fff; text-align:left;">
            <h2 style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">MEDICAL NECESSITY</h2>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>ICD-10:</strong> ${dx.code}</p>
            <p><strong>NPI (Referring):</strong> ${CLINICIAN_DETAILS.npi_type1}</p>
            <p style="margin-top:20px; font-style:italic;">"MoveFitRx exercise is medically necessary for this patient's diagnosis."</p>
            <p style="text-align:right; margin-top:20px;"><strong>${CLINICIAN_DETAILS.name}</strong></p>
        </div>`;
    document.getElementById('lmn-modal').classList.remove('hidden');
}

function showPaymentSim(id) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    const content = document.getElementById('payment-success-content');
    content.innerHTML = `
        <div class="p-6 text-center">
            <h3 class="text-xl font-bold mb-2 text-blue-600">Binkey HSA Pay</h3>
            <p class="text-sm text-gray-500 mb-6">Eligible HSA funds found for ICD-10 ${p.diagnosisId}</p>
            <div class="bg-green-50 p-4 rounded-xl mb-6">
                <span class="text-2xl font-bold text-green-600">$180.00</span>
            </div>
            <button onclick="finalizePay('${id}')" class="w-full bg-green-600 text-white p-4 rounded-xl font-bold">Process HSA</button>
        </div>`;
    document.getElementById('payment-success-modal').classList.remove('hidden');
}

function finalizePay(id) {
    REFERRED_PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    document.getElementById('payment-success-modal').classList.add('hidden');
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

// --- BINDING ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    document.getElementById('referral-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = `MFRX-ST0${REFERRED_PATIENTS.length + 1}`;
        const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
        const p = { 
            name: e.target.name.value, 
            email: e.target.email.value, 
            diagnosisId: dx.id, 
            regimenName: dx.regimen, 
            matrixId: id, 
            gymCode: '20510' + REFERRED_PATIENTS.length, 
            status: 'PENDING' 
        };
        REFERRED_PATIENTS.unshift(p);
        PENDING_PATIENT_DATA = p;
        renderClinicianPortal();
        
        document.getElementById('clinician-notification-content').innerHTML = `<p class="p-6 text-center">Prescription for <b>${p.name}</b> generated.</p>`;
        document.getElementById('clinician-notification-modal').classList.remove('hidden');
        e.target.reset();
    });

    document.getElementById('patient-search-form').addEventListener('submit', handleLogin);
    
    document.getElementById('close-clinician-notification-btn').onclick = () => {
        document.getElementById('clinician-notification-modal').classList.add('hidden');
        switchTab('patient');
        document.getElementById('patient-welcome-content').innerHTML = `
            <div class="p-6 text-center">
                <h2 class="text-2xl font-bold mb-4">Code: ${PENDING_PATIENT_DATA.matrixId}</h2>
                <p>Hello ${PENDING_PATIENT_DATA.name}, your medical regimen is ready.</p>
            </div>`;
        document.getElementById('patient-welcome-modal').classList.remove('hidden');
    };
});

// --- GLOBAL EXPOSURE (FIXES THE REFERENCE ERROR) ---
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.openLMNModal = openLMNModal;
window.showPaymentSim = showPaymentSim;
window.finalizePay = finalizePay;
window.pushRWE = pushRWE;
window.closeLMNModal = () => document.getElementById('lmn-modal').classList.add('hidden');
window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');