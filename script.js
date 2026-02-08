/**
 * MoveFitRx Build 8.9 - THE "ELITE MERGE"
 * RESTORED: NPIs, Machine Protocols, RWE Biometrics, Binkey UX, & 12-Week Progress.
 */

// --- 1. CORE CLINICAL & NPI DATA (RESTORED FROM BUILD 5/6) ---
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

// Machine-Specific Protocols
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

// --- 2. GLOBAL STATE & SEEDING (RESTORED RWE ENGINE) ---
let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, code: `20510${i}` }));
let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = []; // Real-World Evidence (RWE) results
let PENDING_PATIENT_DATA = null;

function initializeApp() {
    if (REFERRED_PATIENTS.length === 0) {
        // Sarah Connor - Restored 3-session history for RWE demo
        const c1 = MOCK_CREDENTIALS[0];
        REFERRED_PATIENTS.push({
            name: 'Sarah Connor',
            diagnosisId: 'HYPT',
            regimenName: 'Cardio Vascular Health',
            matrixId: c1.matrixId,
            gymCode: c1.code,
            status: 'PAID'
        });

        // Seed Sarah's Biometric RWE (RESTORED FROM BUILD 6)
        PATIENT_RESULTS.push(
            { patientId: c1.matrixId, machine: 'Treadmill', activity: 'Aerobic Walk 40 min', metrics: 'Distance: 1.5 mi, Avg HR: 132 BPM', date: Date.now() - 86400000 },
            { patientId: c1.matrixId, machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps', metrics: 'Weight: 45 lbs, Vol: 1350 lbs', date: Date.now() - 172800000 }
        );

        REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: 'MFRX-ST02', gymCode: '205101', status: 'PENDING' });
    }
    renderClinicianPortal();
    populateDiagnosisDropdown();
}

// --- 3. THE CLINICAL LMN GENERATOR (DYNAMIC NPI & ICD-10) ---
function openLMNModal(matrixId) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === matrixId);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    
    content.innerHTML = `
        <div style="font-family:'Times New Roman', serif; padding:40px; border:1px solid #000; background:#fff; text-align:left; color:#000;">
            <h2 style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">LETTER OF MEDICAL NECESSITY</h2>
            <p><strong>Date:</strong> ${CLINICIAN_DETAILS.date}</p>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>Clinical Diagnosis:</strong> ${dx.name} (ICD-10: ${dx.code})</p>
            <p><strong>Referring Provider NPI:</strong> ${CLINICIAN_DETAILS.npi_type1}</p>
            <p><strong>Prescribing Org NPI:</strong> ${CLINICIAN_DETAILS.npi_type2}</p>
            <p style="margin-top:20px; line-height:1.6;">"I prescribe the MoveFitRx corrective exercise regimen as medically necessary for the treatment of this patient's clinical diagnosis. This program includes RWE tracking for clinical oversight."</p>
            <p style="margin-top:30px; border-top:1px solid #000; padding-top:10px;"><strong>Signature:</strong> ${CLINICIAN_DETAILS.name}</p>
        </div>
        <button onclick="document.getElementById('payment-modal').classList.add('hidden')" style="width:100%; padding:15px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight:bold; margin-top:15px;">Close Document</button>`;
    modal.classList.remove('hidden');
}

// --- 4. RWE PROGRESS CALCULATION (RESTORED FROM BUILD 7) ---
function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const results = PATIENT_RESULTS.filter(r => r.patientId === p.matrixId).length;
        const progress = Math.min((results / 36) * 100, 100); // 36 sessions = 12 weeks
        
        return `
            <div class="card" style="border-left: 5px solid ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}; background:white; padding:20px; border-radius:15px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${p.name}</strong>
                    <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">${p.status}</span>
                </div>
                <div style="background:#f1f5f9; height:12px; border-radius:6px; margin:12px 0;"><div style="background:#2563eb; width:${progress}%; height:100%; border-radius:6px; transition:width 1s;"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; font-family:monospace;">
                    <span>ID: ${p.matrixId}</span>
                    <span>ADHERENCE: ${Math.round(progress)}%</span>
                </div>
            </div>`;
    }).join('');
}

// --- 5. PATIENT PORTAL & RWE PUSH ENGINE ---
function handleLogin(e) {
    e.preventDefault();
    const p = REFERRED_PATIENTS.find(x => x.matrixId === e.target.matrixId.value);
    if (p) {
        document.getElementById('patient-login-section').style.display = 'none';
        document.getElementById('patient-dashboard').style.display = 'block';
        renderPatientDashboard(p);
    } else { alert("Invitation Code not found."); }
}

function renderPatientDashboard(p) {
    const dash = document.getElementById('patient-dashboard-content');
    const protocols = WORKOUT_DETAILS[p.regimenName] || { steps: [] };

    if (p.status === 'PENDING') {
        dash.innerHTML = `
            <div class="card" style="border-top: 5px solid #2563eb; background:white; padding:20px; border-radius:15px;">
                <h3 style="margin-top:0;">Medical Prescription Ready</h3>
                <p style="color:#64748b;">${p.regimenName}</p>
                <button onclick="openLMNModal('${p.matrixId}')" style="width:100%; border:1px solid #2563eb; color:#2563eb; padding:12px; border-radius:8px; font-weight:bold; margin-bottom:12px; background:none;">View LMN Document</button>
                <button onclick="showPaymentSim('${p.matrixId}')" style="width:100%; background:#10b981; color:white; padding:15px; border-radius:8px; font-weight:bold; border:none;">Pay with Binkey (HSA/FSA)</button>
            </div>`;
    } else {
        dash.innerHTML = `
            <div class="card" style="text-align:center; border-top: 5px solid #10b981; background:white; padding:20px; border-radius:15px;">
                <h3 style="margin-top:0; color:#10b981;">Matrix Code: ${p.gymCode}</h3>
                <div style="text-align:left; margin-top:20px;">
                    <p style="font-weight:bold; margin-bottom:10px;">Assigned Matrix Equipment:</p>
                    ${protocols.steps.map(step => `
                        <div style="background:#f8fafc; padding:15px; border-radius:10px; margin-bottom:10px; border-left:4px solid #2563eb;">
                            <p style="margin:0; font-weight:bold;">${step.machine}</p>
                            <p style="margin:0; font-size:12px; color:#64748b;">${step.activity}</p>
                            <button onclick="pushRWE('${p.matrixId}', '${step.machine}', '${step.activity}')" style="margin-top:10px; font-size:10px; background:#2563eb; color:white; border:none; padding:8px 12px; border-radius:5px; font-weight:bold;">SIMULATE MATRIX DATA PUSH</button>
                        </div>`).join('')}
                </div>
            </div>`;
    }
}

function showPaymentSim(matrixId) {
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    content.innerHTML = `
        <div style="padding:40px; text-align:center;">
            <div style="color:#2563eb; font-size:40px; margin-bottom:20px;"><i class="fas fa-shield-alt"></i></div>
            <h3 style="margin-bottom:10px;">Binkey Secure Gateway</h3>
            <p style="font-size:14px; color:#64748b;">Verifying medical eligibility for Prescription ID: ${matrixId}</p>
            <div style="background:#f1f5f9; padding:20px; border-radius:15px; margin:20px 0;">
                <p style="margin:0; font-size:12px; color:#94a3b8; font-weight:bold;">APPROVED HSA AMOUNT</p>
                <p style="margin:0; font-size:32px; font-weight:bold; color:#10b981;">$180.00</p>
            </div>
            <button onclick="finalizePay('${matrixId}')" style="width:100%; background:#10b981; color:white; padding:15px; border-radius:10px; font-weight:bold; border:none;">Authorize HSA Transfer</button>
        </div>`;
    modal.classList.remove('hidden');
}

function finalizePay(id) {
    REFERRED_PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    document.getElementById('payment-modal').classList.add('hidden');
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function pushRWE(id, machine, activity) {
    const metrics = machine.includes('Cardio') || machine === 'Treadmill' || machine === 'Recumbent Bike' 
        ? "Distance: 1.8 mi, Avg HR: 135 BPM" 
        : "Weight: 75 lbs, Vol: 2700 lbs";
    PATIENT_RESULTS.unshift({ patientId: id, machine, activity, metrics, date: Date.now() });
    alert(`RWE Synchronized: ${machine} biometric data sent to Clinician Portal.`);
    renderPatientDashboard(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

// --- 6. NAVIGATION & MODAL BRIDGES ---
function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
    if (t === 'doctor') renderClinicianPortal();
}

function populateDiagnosisDropdown() {
    const dropdown = document.getElementById('diagnosis-select');
    if (dropdown) dropdown.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function closeSuccess() {
    document.getElementById('clinician-notification-modal').classList.add('hidden');
    switchTab('patient');
    document.getElementById('welcome-name').textContent = PENDING_PATIENT_DATA.name;
    document.getElementById('show-id').textContent = PENDING_PATIENT_DATA.matrixId;
    document.getElementById('modal-welcome').classList.remove('hidden');
}

// --- 7. EVENT BINDING ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    document.getElementById('referral-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS[REFERRED_PATIENTS.length] || {matrixId:'MFRX-FULL', code:'999'};
        const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
        const p = { name: e.target.name.value, diagnosisId: dx.id, regimenName: dx.regimen, matrixId: cred.matrixId, gymCode: cred.code, status: 'PENDING' };
        REFERRED_PATIENTS.unshift(p);
        PENDING_PATIENT_DATA = p;
        renderClinicianPortal();
        document.getElementById('clinician-notification-modal').classList.remove('hidden');
        e.target.reset();
    });

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    const closeNotifyBtn = document.getElementById('close-clinician-notification-btn');
    if (closeNotifyBtn) closeNotifyBtn.onclick = closeSuccess;
});

// GLOBAL EXPOSURE
window.switchTab = switchTab;
window.openLMNModal = openLMNModal;
window.showPaymentSim = showPaymentSim;
window.finalizePay = finalizePay;
window.pushRWE = pushRWE;
window.closeWelcome = () => document.getElementById('modal-welcome').classList.add('hidden');