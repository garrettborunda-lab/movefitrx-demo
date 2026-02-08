const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0', steps: 4 },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10', steps: 5 },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0', steps: 3 }
];

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, code: `20510${i}` }));
let REFERRED_PATIENTS = [];
let WORKOUTS = [];
let PENDING = null;

function initialize() {
    if (REFERRED_PATIENTS.length === 0) {
        REFERRED_PATIENTS.push({ name: 'Sarah Connor', diagnosisId: 'HYPT', regimen: 'Cardiovascular', matrixId: 'MFRX-ST01', status: 'PAID' });
        REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', regimen: 'Bone Density', matrixId: 'MFRX-ST02', status: 'PENDING' });
        WORKOUTS.push({id: 'MFRX-ST01'}, {id: 'MFRX-ST01'}); // Sarah progress
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
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId) || DIAGNOSES[0];
        const done = WORKOUTS.filter(w => w.id === p.matrixId).length;
        const prog = (done / dx.steps) * 100;
        return `<div class="card" style="border-left-color: ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">
            <div style="display:flex; justify-content:space-between">
                <strong>${p.name}</strong>
                <small>${p.status}</small>
            </div>
            <div class="progress-bg"><div class="progress-fill" style="width:${prog}%"></div></div>
            <small style="color:#999">${p.matrixId} | ICD-10: ${dx.code}</small>
        </div>`;
    }).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const id = `MFRX-ST0${REFERRED_PATIENTS.length + 1}`;
    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const p = { name: e.target.name.value, diagnosisId: dx.id, regimen: dx.regimen, matrixId: id, status: 'PENDING' };
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
    } else { alert("ID Not Found"); }
}

function renderDash(p) {
    const c = document.getElementById('dashboard-content');
    if (p.status === 'PENDING') {
        c.innerHTML = `<div class="card"><h3>Prescription Ready</h3><p>${p.regimen}</p>
            <button onclick="pay('${p.matrixId}')" class="primary">Pay with HSA/FSA (Binkey)</button></div>`;
    } else {
        c.innerHTML = `<div class="card" style="text-align:center"><h3>Gym Access: 20510</h3>
            <button onclick="log('${p.matrixId}')" class="primary">Log Workout</button></div>`;
    }
}

function pay(id) {
    alert("Binkey Verification: ICD-10 Approved.");
    REFERRED_PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    renderDash(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function log(id) {
    WORKOUTS.push({id: id});
    renderDash(REFERRED_PATIENTS.find(x => x.matrixId === id));
}

function closeSuccess() {
    document.getElementById('modal-success').classList.remove('active');
    switchTab('patient');
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
window.pay = pay;
window.log = log;
window.closeSuccess = closeSuccess;
window.closeWelcome = closeWelcome;