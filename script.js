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
let WORKOUTS = [];
let PENDING = null;

function initialize() {
    if (REFERRED_PATIENTS.length === 0) {
        REFERRED_PATIENTS.push({ name: 'Sarah Connor', diagnosisId: 'HYPT', regimen: 'Cardio Vascular Health', matrixId: 'MFRX-ST01', status: 'PAID', code: '205100' });
        REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', regimen: 'Bone Density & Balance', matrixId: 'MFRX-ST02', status: 'PENDING', code: '205101' });
        WORKOUTS.push({id: 'MFRX-ST01'}, {id: 'MFRX-ST01'}); 
    }
}

function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
    if (t === 'doctor') renderDoctor();
}

function renderDoctor() {
    const list = document.getElementById('patients-list');
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const done = WORKOUTS.filter(w => w.id === p.matrixId).length;
        const prog = (done / dx.steps) * 100;
        return `<div class="card" style="border-left-color: ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <strong>${p.name}</strong>
                <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">${p.status}</span>
            </div>
            <div class="progress-bg"><div class="progress-fill" style="width:${prog}%"></div></div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; font-family:monospace;">
                <span>ID: ${p.matrixId}</span>
                <span>ICD-10: ${dx.code}</span>
            </div>
        </div>`;
    }).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS[REFERRED_PATIENTS.length] || {matrixId:'MFRX-ERR', code:'000'};
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const p = { name: e.target.name.value, diagnosisId: dx.id, regimen: dx.regimen, matrixId: cred.matrixId, status: 'PENDING', code: cred.code };
    REFERRED_PATIENTS.unshift(p);
    PENDING = p;
    renderDoctor();
    document.getElementById('modal-success').classList.add('active');
    e.target.reset();
}

function handleLogin(e) {
    e.preventDefault();
    const p = REFERRED_PATIENTS.find(x => x.matrixId === e.target.matrixId.value);
    if (p) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('patient-dashboard').style.display = 'block';
        renderDash(p);
    } else { alert("Invitation Code not found."); }
}

function renderDash(p) {
    const c = document.getElementById('dashboard-content');
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    if (p.status === 'PENDING') {
        c.innerHTML = `<div class="card" style="border-top: 4px solid var(--blue)">
            <h3>Medical Plan Ready</h3>
            <p style="color:#64748b">Prescribed: <strong>${p.regimen}</strong></p>
            <button onclick="showAction('${p.matrixId}', 'LMN')" style="background:none; border:1px solid var(--blue); color:var(--blue); padding:10px; width:100%; border-radius:8px; margin-bottom:10px; font-weight:bold; cursor:pointer;">View Letter of Medical Necessity</button>
            <button onclick="showAction('${p.matrixId}', 'PAY')" class="primary">Authorize HSA/FSA (Binkey)</button>
        </div>`;
    } else {
        const done = WORKOUTS.filter(w => w.id === p.matrixId).length;
        c.innerHTML = `<div class="card" style="text-align:center; border-top: 4px solid var(--green)">
            <h3>Gym Access Enabled</h3>
            <p style="font-size:32px; font-family:monospace; font-weight:900; color:var(--green); margin:10px 0;">${p.code}</p>
            <button onclick="logWork('${p.matrixId}')" class="primary">Log Session (${done}/${dx.steps})</button>
        </div>`;
    }
}

function showAction(id, type) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    const box = document.getElementById('action-content');
    if (type === 'LMN') {
        box.innerHTML = `<div class="lmn-paper">
            <h2 style="text-align:center; border-bottom: 2px solid #000;">Letter of Medical Necessity</h2>
            <p><strong>Patient:</strong> ${p.name}</p>
            <p><strong>Diagnosis:</strong> ${dx.name} (${dx.code})</p>
            <p><strong>Prescription:</strong> MoveFitRx Corrective Exercise Regimen</p>
            <p style="margin-top:20px; font-style:italic;">"I certify that the prescribed exercise is medically necessary for the treatment of this patient's clinical diagnosis."</p>
            <p><strong>- Dr. Jane Foster, MD</strong></p>
        </div>
        <button onclick="document.getElementById('modal-action').classList.remove('active')" class="primary" style="margin-top:20px">Close</button>`;
    } else {
        box.innerHTML = `<div style="text-align:center">
            <h3>Binkey Payment Gateway</h3>
            <p>Eligible HSA/FSA Amount: $180.00</p>
            <input type="text" placeholder="HSA Card Number" style="margin-bottom:20px">
            <button onclick="finalizePay('${p.matrixId}')" class="primary">Process Payment</button>
        </div>`;
    }
    document.getElementById('modal-action').classList.add('active');
}

function finalizePay(id) {
    alert("Authenticating with Binkey Eligibility Server...");
    REFERRED_PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    document.getElementById('modal-action').classList.remove('active');
    renderDash(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function logWork(id) {
    WORKOUTS.push({id: id});
    renderDash(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function closeSuccess() {
    document.getElementById('modal-success').classList.remove('active');
    switchTab('patient');
    document.getElementById('welcome-name').textContent = PENDING.name;
    document.getElementById('show-id').textContent = PENDING.matrixId;
    document.getElementById('modal-welcome').classList.add('active');
}

function closeWelcome() {
    document.getElementById('modal-welcome').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    initialize();
    document.getElementById('diagnosis-select').innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    renderDoctor();
    document.getElementById('referral-form').addEventListener('submit', handleReferral);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

window.switchTab = switchTab;
window.showAction = showAction;
window.finalizePay = finalizePay;
window.logWork = logWork;
window.closeSuccess = closeSuccess;
window.closeWelcome = closeWelcome;