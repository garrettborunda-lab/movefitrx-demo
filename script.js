/**
 * MoveFitRx Build 8.7 - FULL ENGINE RESTORATION
 */

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0', steps: 4 },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00', steps: 3 },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8', steps: 3 },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0', steps: 3 },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2', steps: 3 },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10', steps: 5 }
];

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, code: `20510${i}` }));
let REFERRED_PATIENTS = [];
let WORKOUT_LOGS = []; 
let PENDING_PATIENT = null;

function initializeState() {
    if (REFERRED_PATIENTS.length === 0) {
        REFERRED_PATIENTS.push({ name: 'Sarah Connor', diagnosisId: 'HYPT', regimen: 'Cardio Vascular Health', matrixId: 'MFRX-ST01', status: 'PAID', gymCode: '205100' });
        REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', regimen: 'Bone Density & Balance', matrixId: 'MFRX-ST02', status: 'PENDING', gymCode: '205101' });
        WORKOUT_LOGS.push({id: 'MFRX-ST01'}, {id: 'MFRX-ST01'}); // Sarah 40%
    }
}

function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
    if (t === 'doctor') renderClinicianDashboard();
}

function renderClinicianDashboard() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const done = WORKOUT_LOGS.filter(w => w.id === p.matrixId).length;
        const prog = (done / dx.steps) * 100;
        return `
            <div class="card" style="border-left-color: ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${p.name}</strong>
                    <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">${p.status}</span>
                </div>
                <div class="progress-bg"><div class="progress-fill" style="width:${prog}%"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; font-family:monospace;">
                    <span>ID: ${p.matrixId}</span>
                    <span>ICD-10: ${dx.code}</span>
                </div>
            </div>`;
    }).join('');
}

function handleReferralSubmission(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS[REFERRED_PATIENTS.length] || {matrixId:'MFRX-ERR', code:'000'};
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const p = { name: e.target.name.value, diagnosisId: dx.id, regimen: dx.regimen, matrixId: cred.matrixId, status: 'PENDING', gymCode: cred.code };
    REFERRED_PATIENTS.unshift(p);
    PENDING_PATIENT = p;
    renderClinicianDashboard();
    document.getElementById('modal-success').classList.add('active');
    e.target.reset();
}

function handlePatientLogin(e) {
    e.preventDefault();
    const p = REFERRED_PATIENTS.find(x => x.matrixId === e.target.matrixId.value);
    if (p) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('patient-dashboard').style.display = 'block';
        renderPatientDashboard(p);
    } else { alert("Code not found."); }
}

function renderPatientDashboard(p) {
    const dash = document.getElementById('dashboard-content');
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    if (p.status === 'PENDING') {
        dash.innerHTML = `<div class="card" style="border-top: 5px solid #2563eb;">
            <h3 style="margin-top:0;">Prescription Action Required</h3>
            <p style="font-size:14px;">Program: <strong>${p.regimen}</strong></p>
            <button onclick="triggerAction('${p.matrixId}', 'LMN')" style="background:none; border:1px solid #2563eb; color:#2563eb; padding:12px; width:100%; border-radius:10px; margin-bottom:12px; font-weight:bold; cursor:pointer;">Letter of Medical Necessity</button>
            <button onclick="triggerAction('${p.matrixId}', 'PAY')" class="primary">Authorize HSA/FSA Payment</button>
        </div>`;
    } else {
        const done = WORKOUT_LOGS.filter(w => w.id === p.matrixId).length;
        dash.innerHTML = `<div class="card" style="text-align:center; border-top: 5px solid #10b981;">
            <h3 style="margin-top:0; color:#10b981;">Gym Access Activated</h3>
            <p style="font-size:36px; font-family:monospace; font-weight:900; margin:10px 0;">${p.gymCode}</p>
            <button onclick="submitWorkoutSession('${p.matrixId}')" class="primary">Log Session (${done}/${dx.steps})</button>
        </div>`;
    }
}

function triggerAction(id, type) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const box = document.getElementById('action-content');
    if (type === 'LMN') {
        box.innerHTML = `<div class="lmn-paper">
            <h2 style="text-align:center; border-bottom: 2px solid #000;">Letter of Medical Necessity</h2>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>ICD-10 Code:</strong> ${dx.code}</p>
            <p style="margin-top:20px;">"I certify that MoveFitRx exercise is medically necessary for this patient's treatment."</p>
            <p><strong>- Dr. Jane Foster, MD</strong></p>
        </div><button onclick="document.getElementById('modal-action').classList.remove('active')" class="primary" style="margin-top:20px;">Close</button>`;
    } else {
        box.innerHTML = `<div style="text-align:center;">
            <h3>Binkey HSA Gateway</h3>
            <p>Approved Amount: $180.00</p>
            <button onclick="finalizeHSAProcess('${p.matrixId}')" class="primary">Process HSA Funds</button>
        </div>`;
    }
    document.getElementById('modal-action').classList.add('active');
}

function finalizeHSAProcess(id) {
    REFERRED_PATIENTS.find(p => p.matrixId === id).status = 'PAID';
    document.getElementById('modal-action').classList.remove('active');
    renderPatientDashboard(REFERRED_PATIENTS.find(p => p.matrixId === id));
}

function submitWorkoutSession(id) {
    WORKOUT_LOGS.push({id: id});
    renderPatientDashboard(REFERRED_PATIENTS.find(p => p.matrixId === id));
}

function closeSuccessAndSwitch() {
    document.getElementById('modal-success').classList.remove('active');
    switchTab('patient');
    document.getElementById('welcome-name').textContent = PENDING_PATIENT.name;
    document.getElementById('show-id').textContent = PENDING_PATIENT.matrixId;
    document.getElementById('modal-welcome').classList.add('active');
}

function closeWelcome() {
    document.getElementById('modal-welcome').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    initializeState();
    const dropdown = document.getElementById('diagnosis-select');
    if (dropdown) dropdown.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    renderClinicianDashboard();
    document.getElementById('referral-form').addEventListener('submit', handleReferralSubmission);
    document.getElementById('login-form').addEventListener('submit', handlePatientLogin);
});

window.switchTab = switchTab;
window.triggerAction = triggerAction;
window.finalizeHSAProcess = finalizeHSAProcess;
window.submitWorkoutSession = submitWorkoutSession;
window.closeSuccessAndSwitch = closeSuccessAndSwitch;
window.closeWelcome = closeWelcome;