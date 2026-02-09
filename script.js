/**
 * MoveFitRx Build 8.15 - FULL FIDELITY RESTORATION
 * RESTORES: NPIs, 36-Session Adherence, Matrix Machine Protocols, and Binkey Pay.
 * NO TRUNCATION. NO EXTERNAL DEPENDENCIES.
 */

// --- 1. CORE CLINICAL & NPI DATA (RESTORED FROM BUILD 7) ---
const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    phone: '(555) 123-4567',
    npi_type1: '9876543210', // Referring Provider NPI
    npi_type2: '1234567890', // Prescribing Service NPI
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

// Detailed Matrix Machine Protocols
const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': {
        steps: [
            { machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min' },
            { machine: 'Leg Press', activity: '3 Sets x 12 Reps' },
            { machine: 'Diverging Seated Row', activity: '3 Sets x 10 Reps' }
        ]
    },
    'Bone Density & Balance': {
        steps: [
            { machine: 'Treadmill', activity: 'Brisk Walk 30 min' },
            { machine: 'Calf Extension', activity: '3 Sets x 15 Reps' },
            { machine: 'Hip Adductor', activity: '3 Sets x 12 Reps' }
        ]
    },
    'Cardio Vascular Health': {
        steps: [
            { machine: 'Treadmill', activity: 'Aerobic Walk 40 min' },
            { machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps' }
        ]
    }
};

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, code: `20510${i}` }));
let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = []; // Real-World Evidence (RWE) results array
let PENDING_PATIENT_DATA = null;

// --- 2. INITIALIZATION & DATA SEEDING (FOR DEMO START) ---
function initializeApp() {
    if (REFERRED_PATIENTS.length === 0) {
        // Sarah Connor - Restored 3-session history for RWE demo
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
    populateDiagnosisDropdown();
}

// --- 3. CLINICIAN PORTAL LOGIC (36-SESSION ADHERENCE MATH) ---
function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const results = PATIENT_RESULTS.filter(r => r.patientId === p.matrixId).length;
        const progress = Math.min((results / 36) * 100, 100); // 12-week logic
        
        return `
            <div class="card bg-white border-l-4" style="border-left-color: ${p.status === 'PAID' ? '#059669' : '#f59e0b'}; padding:20px; border-radius:15px; margin-bottom:15px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:18px; color:#1f2937;">${p.name}</strong>
                    <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#059669' : '#f59e0b'}; text-transform:uppercase;">${p.status}</span>
                </div>
                <p style="font-size:12px; color:#64748b; margin:5px 0;">${p.email}</p>
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

// --- 4. PATIENT PORTAL & RWE PUSH ENGINE ---
function handleLogin(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('matrix-id-input');
    const p = REFERRED_PATIENTS.find(x => x.matrixId === idInput.value.toUpperCase());
    
    if (p) {
        document.getElementById('patient-search-form').style.display = 'none';
        document.getElementById('patient-data').classList.remove('hidden');
        renderPatientDashboard(p);
    } else { alert("Invitation Code not found in clinical registry."); }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-data');
    const protocols = WORKOUT_DETAILS[p.regimenName] || { steps: [] };

    if (p.status === 'PENDING') {
        container.innerHTML = `
            <div class="card bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-blue-600">
                <h3 class="text-2xl font-black mb-2 text-gray-800">Prescription Ready</h3>
                <p class="text-gray-500 mb-8 italic">Dr. Foster has authorized: ${p.regimenName}</p>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-2xl font-bold mb-4 hover:bg-blue-50 transition">View LMN Document</button>
                <button onclick="showPaymentSim('${p.matrixId}')" class="w-full bg-green-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-green-700 transition">Authorize HSA/FSA (Binkey)</button>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="card bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-green-600 text-center">
                <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Matrix Access Code</h3>
                <p class="text-5xl font-mono font-black text-gray-800 mb-8 tracking-tighter">${p.gymCode}</p>
                <div class="text-left border-t pt-8">
                    <p class="font-bold text-sm uppercase text-blue-600 mb-4 tracking-widest">Prescribed Protocols:</p>
                    ${protocols.steps.map(step => `
                        <div style="background:#f8fafc; padding:20px; border-radius:15px; margin-bottom:15px; border-left:5px solid #2563eb; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                            <p style="margin:0; font-weight:bold; color:#1f2937;">${step.machine}</p>
                            <p style="margin:0; font-size:13px; color:#64748b;">${step.activity}</p>
                            <button onclick="pushRWE('${p.matrixId}', '${step.machine}')" style="margin-top:12px; font-size:10px; background:#2563eb; color:white; border:none; padding:8px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">LOG MATRIX SESSION</button>
                        </div>`).join('')}
                </div>
            </div>`;
    }
}

// --- 5. MODALS: LMN & BINKEY PAY ---
function openLMNModal(matrixId) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const modal = document.getElementById('lmn-modal');
    const display = document.getElementById('lmn-content-display');
    
    display.innerHTML = `
        <div style="font-family:'Times New Roman', serif; padding:40px; border:1px solid #000; background:#fff; color:#000; line-height:1.6;">
            <h2 style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px; font-weight:900; font-size:24px;">LETTER OF MEDICAL NECESSITY</h2>
            <p><strong>Date:</strong> ${CLINICIAN_DETAILS.date}</p>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>Diagnosis:</strong> ${dx.name} (ICD-10: ${dx.code})</p>
            <p><strong>Referring Provider NPI:</strong> ${CLINICIAN_DETAILS.npi_type1}</p>
            <p><strong>Prescribing Org NPI:</strong> ${CLINICIAN_DETAILS.npi_type2}</p>
            <p style="margin-top:25px; font-style:italic;">"I certify that the MoveFitRx corrective exercise program is medically necessary for the treatment of this patient's clinical diagnosis. This prescription includes RWE tracking for clinical oversight."</p>
            <p style="margin-top:40px; border-top:1px solid #000; padding-top:10px;"><strong>Signature:</strong> ${CLINICIAN_DETAILS.name}</p>
        </div>`;
    modal.classList.remove('hidden');
}

function showPaymentSim(matrixId) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === matrixId);
    const modal = document.getElementById('payment-success-modal'); // Re-using for simplicity, content replaced
    const content = document.getElementById('payment-success-content');
    
    content.innerHTML = `
        <div class="p-4 text-center">
            <div style="color:#2563eb; font-size:48px; margin-bottom:20px;"><i class="fas fa-shield-alt"></i></div>
            <h3 class="text-2xl font-black mb-4">Binkey Gateway</h3>
            <p class="text-gray-500 mb-8">Verifying eligibility for Prescription ID: ${matrixId}</p>
            <div style="background:#f1f5f9; padding:20px; border-radius:15px; margin-bottom:25px;">
                <p class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Approved HSA/FSA Amount</p>
                <p class="text-4xl font-black text-green-600">$180.00</p>
            </div>
            <button onclick="finalizePay('${matrixId}')" class="w-full bg-green-600 text-white p-5 rounded-2xl font-black shadow-xl hover:bg-green-700 transition">Authorize Transfer</button>
        </div>`;
    modal.classList.remove('hidden');
}

function finalizePay(id) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    p.status = 'PAID';
    document.getElementById('payment-success-modal').classList.add('hidden');
    renderPatientDashboard(p);
}

function pushRWE(id, machine) {
    PATIENT_RESULTS.unshift({ patientId: id, machine, date: Date.now() });
    alert(`RWE Synchronized: ${machine} biometric data sent to Clinician Portal.`);
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

// --- 6. NAVIGATION & BRIDGES ---
function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    document.getElementById(t + '-tab').classList.add('active');
    if (t === 'doctor') renderClinicianPortal();
}

function populateDiagnosisDropdown() {
    const dropdown = document.getElementById('diagnosis-select');
    if (dropdown) dropdown.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function closeSuccessHandOff() {
    document.getElementById('clinician-notification-modal').classList.add('hidden');
    switchTab('patient');
    document.getElementById('patient-welcome-content').innerHTML = `
        <div class="welcome-email-card p-8 rounded-[2rem] border-t-8 border-blue-600 shadow-xl text-center">
            <h2 class="text-3xl font-black mb-4">Invitation Received</h2>
            <p class="text-gray-600 mb-8 leadning-relaxed">Hello <strong>${PENDING_PATIENT_DATA.name}</strong>, Dr. Foster has authorized your medical fitness prescription. Use this code to access your plan:</p>
            <div class="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-2xl mb-8">
                <span style="font-size:32px; font-family:monospace; font-weight:900; color:#2563eb;">${PENDING_PATIENT_DATA.matrixId}</span>
            </div>
        </div>`;
    document.getElementById('patient-welcome-modal').classList.remove('hidden');
}

// --- 7. EVENT BINDING ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    document.getElementById('referral-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS[REFERRED_PATIENTS.length] || {matrixId:'MFRX-FULL', code:'999'};
        const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
        const p = { 
            name: e.target.name.value, 
            email: e.target.email.value, 
            diagnosisId: dx.id, 
            regimenName: dx.regimen, 
            matrixId: cred.matrixId, 
            gymCode: cred.code, 
            status: 'PENDING',
            createdAt: Date.now()
        };
        REFERRED_PATIENTS.unshift(p);
        PENDING_PATIENT_DATA = p;
        renderClinicianPortal();
        
        // Show success modal
        const contentEl = document.getElementById('clinician-notification-content');
        contentEl.innerHTML = `<div class="p-8 text-center"><i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i><h3 class="text-2xl font-black">Referral Generated</h3><p class="text-gray-500">Prescription for ${p.name} sent to registry.</p></div>`;
        document.getElementById('clinician-notification-modal').classList.remove('hidden');
        e.target.reset();
    });

    document.getElementById('patient-search-form').addEventListener('submit', handleLogin);
    document.getElementById('close-clinician-notification-btn').onclick = closeSuccessHandOff;
});

// GLOBAL EXPOSURES
window.switchTab = switchTab;
window.openLMNModal = openLMNModal;
window.showPaymentSim = showPaymentSim;
window.finalizePay = finalizePay;
window.pushRWE = pushRWE;
window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');
window.closeLMNModal = () => document.getElementById('lmn-modal').classList.add('hidden');