const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', reg: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HYPT', name: 'Hypertension', reg: 'Cardio Vascular Health', code: 'I10' },
    { id: 'OSTE', name: 'Osteoporosis', reg: 'Bone Density & Balance', code: 'M81.0' }
];

let PATIENTS = [
    { name: 'Sarah Connor', dxId: 'HYPT', matrixId: 'MFRX-ST01', status: 'PAID', workouts: 3 },
    { name: 'Jessica Jones', dxId: 'OSTE', matrixId: 'MFRX-ST02', status: 'PENDING', workouts: 0 }
];

function switchTab(t) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-panel').classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
    if(t === 'doctor') renderDoctor();
}

function renderDoctor() {
    const list = document.getElementById('patients-list');
    list.innerHTML = PATIENTS.map(p => {
        const prog = (p.workouts / 36) * 100;
        return `<div class="card" style="border-left-color: ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">
            <strong>${p.name}</strong>
            <div class="progress-bg"><div class="progress-fill" style="width:${prog}%"></div></div>
            <small>${p.matrixId} | Adherence: ${Math.round(prog)}%</small>
        </div>`;
    }).join('');
}

function handleLogin() {
    const id = document.getElementById('matrix-input').value.toUpperCase();
    const p = PATIENTS.find(x => x.matrixId === id);
    if(p) {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('patient-dash').style.display = 'block';
        renderDash(p);
    } else { alert("Not found"); }
}

function renderDash(p) {
    const dash = document.getElementById('patient-dash');
    if(p.status === 'PENDING') {
        dash.innerHTML = `<div class="card"><h3>Prescription Ready</h3><button onclick="pay('${p.matrixId}')" class="primary-btn">Pay with HSA (Binkey)</button></div>`;
    } else {
        dash.innerHTML = `<div class="card" style="text-align:center"><h3>Gym Access: 20510</h3><button onclick="log('${p.matrixId}')" class="primary-btn">Log Session (${p.workouts}/36)</button></div>`;
    }
}

function pay(id) {
    alert("Binkey: ICD-10 Verified. HSA Approved.");
    PATIENTS.find(x => x.matrixId === id).status = 'PAID';
    renderDash(PATIENTS.find(x => x.matrixId === id));
}

function log(id) {
    PATIENTS.find(x => x.matrixId === id).workouts++;
    renderDash(PATIENTS.find(x => x.matrixId === id));
}

function closeWelcome() { document.getElementById('modal-welcome').classList.remove('active'); }

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('diagnosis-select').innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    renderDoctor();
    document.getElementById('referral-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('ref-name').value;
        const id = `MFRX-ST0${PATIENTS.length + 1}`;
        const p = { name, dxId: document.getElementById('diagnosis-select').value, matrixId: id, status: 'PENDING', workouts: 0 };
        PATIENTS.unshift(p);
        renderDoctor();
        document.getElementById('show-id').textContent = id;
        document.getElementById('modal-welcome').classList.add('active');
    };
});