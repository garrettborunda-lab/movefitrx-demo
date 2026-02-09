/**
 * MoveFitRx Build 8.19 - THE LMN RESTORATION
 * SOURCE: Build 7 Base + Full Fidelity LMN & RWE Engine
 * STABILITY: Safety-checked initialization to prevent "Null" errors.
 */

// --- 1. CORE DATA MODELS ---
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

let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null;

// --- 2. THE LMN GENERATOR (RESTORED) ---
function generateLMNHTML(patient, dx) {
    return `
        <div class="lmn-paper" style="font-family:'Times New Roman', serif; padding:40px; border:1px solid #000; background:#fff; text-align:left; color:#000; line-height:1.5;">
            <div style="text-align:center; border-bottom:2px solid #000; margin-bottom:20px; padding-bottom:10px;">
                <h2 style="margin:0; font-weight:900;">LETTER OF MEDICAL NECESSITY</h2>
                <p style="margin:0; font-size:12px;">MoveFitRx Clinical Oversight Program</p>
            </div>
            <p><strong>Date:</strong> ${CLINICIAN_DETAILS.date}</p>
            <p><strong>Patient Name:</strong> ${patient.name}</p>
            <p><strong>Clinical Diagnosis:</strong> ${dx.name} (ICD-10: ${dx.code})</p>
            <p><strong>Referring Provider NPI:</strong> ${CLINICIAN_DETAILS.npi_type1}</p>
            <p><strong>Prescribing Organization NPI:</strong> ${CLINICIAN_DETAILS.npi_type2}</p>
            
            <div style="margin-top:25px;">
                <p>To Whom It May Concern,</p>
                <p>I am writing to prescribe the MoveFitRx corrective exercise regimen for the patient listed above. This program is medically necessary for the treatment and management of their diagnosed condition.</p>
                <p>The prescribed protocol requires 3 sessions per week for 12 weeks (36 total sessions) utilizing Matrix equipment with integrated biometric tracking for clinical oversight.</p>
            </div>

            <div style="margin-top:40px;">
                <p><strong>Electronically Signed:</strong></p>
                <p style="border-bottom:1px solid #000; display:inline-block; min-width:200px; font-style:italic; font-size:20px;">${CLINICIAN_DETAILS.name}</p>
                <p style="margin-top:5px; font-size:12px;">${CLINICIAN_DETAILS.clinic}</p>
            </div>
        </div>
        <button onclick="closeLMNModal()" class="w-full bg-blue-600 text-white p-4 font-black uppercase rounded-b-2xl">Close Document</button>`;
}

// --- 3. SYSTEM INITIALIZATION ---
function initializeApp() {
    if (REFERRED_PATIENTS.length === 0) {
        REFERRED_PATIENTS.push(
            { name: 'Sarah Connor', email: 's.connor@sky.net', diagnosisId: 'HYPT', regimenName: 'Cardio Vascular Health', matrixId: 'MFRX-ST01', gymCode: '205100', status: 'PAID' },
            { name: 'Jessica Jones', email: 'j.jones@alias.com', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: 'MFRX-ST02', gymCode: '205101', status: 'PENDING' }
        );
        // Seed 3 workouts for Sarah (8% Adherence)
        PATIENT_RESULTS.push({ id: 'MFRX-ST01' }, { id: 'MFRX-ST01' }, { id: 'MFRX-ST01' });
    }

    const sel = document.getElementById('diagnosis-select');
    if (sel) sel.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    renderClinicianPortal();
}

// --- 4. CORE PORTAL LOGIC ---
function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const results = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min((results / 36) * 100, 100);
        return `
            <div class="card bg-white p-5 rounded-2xl shadow-sm mb-4 border-l-4" style="border-left-color: ${p.status === 'PAID' ? '#059669' : '#f59e0b'}">
                <div class="flex justify-between items-center">
                    <strong>${p.name}</strong>
                    <span class="text-[10px] font-black" style="color:${p.status === 'PAID' ? '#059669' : '#f59e0b'}">${p.status}</span>
                </div>
                <div class="bg-gray-100 h-2 rounded-full overflow-hidden my-3">
                    <div class="bg-blue-600 h-full" style="width:${progress}%"></div>
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
    const id = document.getElementById('matrix-id-input').value.toUpperCase();
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    if (p) {
        document.getElementById('patient-search-form').style.display = 'none';
        document.getElementById('patient-data').classList.remove('hidden');
        renderPatientDash(p);
    } else { alert("Code not found."); }
}

function renderPatientDash(p) {
    const container = document.getElementById('patient-data');
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    if (p.status === 'PENDING') {
        container.innerHTML = `
            <div class="card bg-white p-6 rounded-3xl border-t-8 border-blue-600 shadow-xl">
                <h3 class="text-xl font-bold mb-2">Prescription Ready</h3>
                <p class="text-gray-500 mb-6">${dx.regimen}</p>
                <button onclick="openLMN('${p.matrixId}')" class="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-xl font-bold mb-4">View LMN</button>
                <button onclick="showBinkey('${p.matrixId}')" class="w-full bg-green-600 text-white p-4 rounded-xl font-bold uppercase shadow-lg">Authorize Binkey HSA</button>
            </div>`;
    } else {
        const protocols = MACHINE_PROTOCOLS[p.regimenName] || [];
        container.innerHTML = `
            <div class="card bg-white p-6 rounded-3xl border-t-8 border-green-600 shadow-xl text-center">
                <h3 class="text-gray-400 uppercase text-xs font-bold mb-2">Matrix Code</h3>
                <p class="text-5xl font-black mb-6">${p.gymCode}</p>
                <div class="text-left border-t pt-6">
                    ${protocols.map(s => `
                        <div class="bg-gray-50 p-4 rounded-xl mb-3 border-l-4 border-blue-600">
                            <p class="font-bold text-sm">${s.machine}</p>
                            <p class="text-xs text-gray-500">${s.activity}</p>
                            <button onclick="pushRWE('${p.matrixId}', '${s.machine}')" class="mt-2 text-[10px] bg-blue-600 text-white px-3 py-1 rounded-lg">Log Matrix Data</button>
                        </div>`).join('')}
                </div>
            </div>`;
    }
}

// --- 5. MODAL LOGIC ---
function openLMN(id) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const display = document.getElementById('payment-modal-content') || document.getElementById('lmn-content-display');
    if (display) {
        display.innerHTML = generateLMNHTML(p, dx);
        document.getElementById('payment-modal').classList.remove('hidden');
    }
}

function showBinkey(id) {
    const display = document.getElementById('payment-modal-content');
    display.innerHTML = `
        <div class="p-10 text-center">
            <h3 class="text-2xl font-black mb-4">Binkey Gateway</h3>
            <div class="bg-gray-100 p-6 rounded-3xl mb-6">
                <p class="text-xs text-gray-400 font-bold uppercase">Approved HSA Amount</p>
                <p class="text-3xl font-black text-green-600">$180.00</p>
            </div>
            <button onclick="finalizePay('${id}')" class="w-full bg-green-600 text-white p-5 rounded-2xl font-bold shadow-xl">Authorize Transfer</button>
        </div>`;
    document.getElementById('payment-modal').classList.remove('hidden');
}

function finalizePay(id) {
    REFERRED_PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    document.getElementById('payment-modal').classList.add('hidden');
    renderPatientDash(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function pushRWE(id, machine) {
    PATIENT_RESULTS.push({ id });
    alert(`RWE Synchronized: ${machine} data sent to Clinician.`);
    renderPatientDash(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

// --- 6. EVENT BRIDGES ---
window.onload = initializeApp;
window.switchTab = (t) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    if (t === 'doctor') renderClinicianPortal();
};
window.handleLogin = handleLogin;
window.openLMN = openLMN;
window.showBinkey = showBinkey;
window.finalizePay = finalizePay;
window.pushRWE = pushRWE;
window.closeLMNModal = () => document.getElementById('payment-modal').classList.add('hidden');
