/**
 * MoveFitRx Master Build 7 - Restored Logic Engine
 * End-to-End Simulation: Referral -> Email -> Binkey -> RWE -> Doctor Progress
 */

// --- CORE DATA ---
const CLINICIAN_DETAILS = { name: 'Dr. Jane Foster, MD', clinic: 'MoveFitRx Clinical Group' };
const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' }
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': { steps: [{ m: 'Recumbent Bike', a: '25 min Cardio' }, { m: 'Leg Press', a: '3x12 Reps' }] },
    'Zone 2 Cardio + Resistance': { steps: [{ m: 'Treadmill', a: '30 min Walk' }, { m: 'Chest Press', a: '3x10 Reps' }] },
    'Metabolic Conditioning': { steps: [{ m: 'Elliptical', a: '20 min Intervals' }, { m: 'Squats', a: '3x15 Reps' }] }
};

let MOCK_CREDENTIALS = [{ matrixId: 'MFRX-AB001', gymAccessCode: '205101', used: false }, { matrixId: 'MFRX-CD002', gymAccessCode: '205102', used: false }];
let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 

// --- CLINICIAN WORKFLOW ---
function setupDoctorPortal() {
    const select = document.getElementById('diagnosis-select');
    if (select) {
        select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
    document.getElementById('referral-form').onsubmit = function(e) {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS.find(c => !c.used);
        if (!cred) return alert("Demo Limit Reached");
        cred.used = true;
        const dx = DIAGNOSES.find(d => d.id === this.diagnosis.value);
        const patient = { name: this.name.value, email: this.email.value, matrixId: cred.matrixId, gymAccessCode: cred.gymAccessCode, regimenName: dx.regimen, status: 'PENDING_PAYMENT', createdAt: Date.now() };
        REFERRED_PATIENTS.unshift(patient);
        renderDoctorPatientList();
        window.switchTab('patient');
        showEmailModal(patient);
        this.reset();
    };
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const count = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min(100, (count / 4) * 100);
        return `
            <div class="card border-l-4 ${p.status === 'PAID' ? 'border-emerald-500' : 'border-yellow-400'} p-4 mb-3 bg-white shadow-sm">
                <div class="flex justify-between font-bold"><span>${p.name}</span><span class="text-[10px] uppercase">${p.status}</span></div>
                <div class="text-[10px] text-gray-400 mb-2">ID: ${p.matrixId} | Adherence: ${progress}%</div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full transition-all duration-700" style="width: ${progress}%"></div>
                </div>
            </div>`;
    }).join('');
}

// --- PATIENT WORKFLOW ---
function setupPatientPortal() {
    document.getElementById('patient-search-form').onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('matrix-id-input').value.trim().toUpperCase();
        const patient = REFERRED_PATIENTS.find(p => p.matrixId === id);
        if (patient) renderPatientDashboard(patient);
        else alert("Code Not Found");
    };
}

function renderPatientDashboard(patient) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');
    if (patient.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="card bg-blue-50 border-2 border-blue-100 p-6 text-center rounded-xl">
                <h3 class="font-bold text-blue-800 text-lg mb-2">HSA/FSA Payment Required</h3>
                <p class="text-xs text-gray-500 mb-6 italic">Letter of Medical Necessity Generated</p>
                <button onclick="runBinkeySim('${patient.matrixId}')" class="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg">VERIFY & PAY WITH BINKEY</button>
            </div>`;
    } else {
        const steps = WORKOUT_DETAILS[patient.regimenName].steps;
        display.innerHTML = `
            <div class="card bg-emerald-50 border-l-4 border-emerald-500 mb-6 p-4">
                <p class="text-[10px] font-bold text-emerald-700 uppercase">Gym Access Code</p>
                <p class="text-3xl font-black text-emerald-800">${patient.gymAccessCode}</p>
            </div>
            ${steps.map(s => `
                <div class="card bg-white border border-gray-100 mb-2 p-4 rounded-lg shadow-sm">
                    <p class="font-bold text-sm text-gray-800">${s.m}</p>
                    <p class="text-[10px] text-gray-400 mb-3">${s.a}</p>
                    <button onclick="runPushSim('${patient.matrixId}', '${s.m}')" class="w-full bg-blue-500 text-white text-[10px] font-bold py-2 rounded">PUSH WORKOUT DATA</button>
                </div>`).join('')}`;
    }
}

// --- SIMULATION HELPERS ---
window.switchTab = (t) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${t}-tab`).classList.add('active');
    document.getElementById(`${t}-panel`).classList.add('active');
    const shell = document.querySelector('.app-container');
    if (t === 'doctor') shell.classList.add('doctor-view'); else shell.classList.remove('doctor-view');
};

window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');

function showEmailModal(p) {
    const modal = document.getElementById('patient-welcome-modal');
    const content = document.getElementById('patient-welcome-content');
    content.innerHTML = `<div class="p-4 text-center"><h3 class="text-xl font-bold text-blue-800">New Prescription Invite</h3><div class="my-4 bg-blue-50 p-6 rounded-lg border-2 border-blue-200"><span class="text-3xl font-black text-blue-600">${p.matrixId}</span></div><p class="text-xs text-gray-400 italic">Sent to ${p.email}</p></div>`;
    modal.classList.remove('hidden');
    document.getElementById('matrix-id-input').value = p.matrixId;
}

window.runBinkeySim = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    p.status = 'PAID';
    alert("Binkey: HSA/FSA Eligibility Confirmed!");
    renderPatientDashboard(p);
    renderDoctorPatientList();
};

window.runPushSim = (id, machine) => {
    PATIENT_RESULTS.push({ id, machine, time: Date.now() });
    alert(`Data from ${machine} pushed to MoveFitRx Cloud.`);
    renderDoctorPatientList();
};

window.onload = () => { setupDoctorPortal(); setupPatientPortal(); };
