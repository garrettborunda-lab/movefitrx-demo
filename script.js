/**
 * MoveFitRx Build 7 - FULL PITCH RESTORATION
 * Fixes: No browser alerts, Real-time Clinician Updates, Professional UI
 */

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' }
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': { steps: [{ m: 'Recumbent Bike', a: '25 min Cardio' }, { m: 'Leg Press', a: '3x12 Reps' }, { m: 'Seated Row', a: '3x10 Reps' }] },
    'Zone 2 Cardio + Resistance': { steps: [{ m: 'Treadmill', a: '30 min Walk' }, { m: 'Chest Press', a: '3x10 Reps' }] }
};

let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 
let MOCK_CREDENTIALS = [{ matrixId: 'MFRX-AB001', gymAccessCode: '205101' }, { matrixId: 'MFRX-CD002', gymAccessCode: '205102' }];

// --- UI NOTIFICATIONS (No more ugly alerts) ---
function notify(msg, color = "bg-blue-600") {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${color} text-white px-6 py-3 rounded-xl shadow-2xl z-50 font-bold animate-bounce`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- CLINICIAN WORKFLOW ---
function populateDiagnosisDropdown() {
    const select = document.getElementById('diagnosis-select');
    if (select) {
        select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const hits = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min(100, (hits / 4) * 100); 
        return `
            <div class="card border-l-4 ${p.status === 'PAID' ? 'border-emerald-500' : 'border-yellow-400'} p-5 mb-4 bg-white shadow-md rounded-2xl">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-black text-gray-900">${p.name}</span>
                    <span class="text-[10px] px-2 py-1 rounded bg-gray-100 font-black">${p.status}</span>
                </div>
                <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-1">
                    <div class="bg-emerald-500 h-full transition-all duration-1000" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between text-[10px] font-bold">
                    <span class="text-gray-400">ID: ${p.matrixId}</span>
                    <span class="text-emerald-600">${progress}% ADHERENCE</span>
                </div>
            </div>`;
    }).join('');
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !REFERRED_PATIENTS.some(p => p.matrixId === c.matrixId));
    if (!cred) return notify("Demo: No more IDs available", "bg-red-600");

    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const patient = { name: e.target.name.value, email: e.target.email.value, matrixId: cred.matrixId, gymAccessCode: cred.gymAccessCode, regimenName: dx.regimen, status: 'PENDING_PAYMENT' };
    
    REFERRED_PATIENTS.unshift(patient);
    renderDoctorPatientList();
    notify("Referral Sent!");
    
    setTimeout(() => {
        window.switchTab('patient');
        showEmailModal(patient);
    }, 1000);
}

// --- PATIENT & SIMULATION ---
function renderPatientDashboard(p) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');
    if (p.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 text-center mb-6">
                <h3 class="font-black text-blue-800 text-xl mb-2">Prescription Activation</h3>
                <p class="text-sm text-gray-500 mb-8 italic">Binkey HSA/FSA Verification Required</p>
                <button onclick="runBinkeySim('${p.matrixId}')" class="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-emerald-700">VERIFY & PAY WITH BINKEY</button>
            </div>`;
    } else {
        const steps = WORKOUT_DETAILS[p.regimenName].steps;
        display.innerHTML = `
            <div class="bg-emerald-50 p-6 rounded-2xl border-l-8 border-emerald-500 mb-8">
                <p class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Gym Access Code</p>
                <p class="text-4xl font-black text-emerald-800">${p.gymAccessCode}</p>
            </div>
            <h4 class="font-black text-gray-800 mb-4 text-lg">Prescribed Regimen</h4>
            ${steps.map(s => `
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
                    <p class="font-black text-gray-900">${s.m}</p>
                    <p class="text-xs text-gray-400 mb-4">${s.a}</p>
                    <button onclick="runPushSim('${p.matrixId}', '${s.m}')" class="w-full bg-blue-600 text-white text-[10px] font-black py-3 rounded-xl">PUSH DATA TO CLINICIAN</button>
                </div>`).join('')}`;
    }
}

window.runBinkeySim = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    p.status = 'PAID';
    notify("Payment Verified!", "bg-emerald-600");
    renderPatientDashboard(p);
    renderDoctorPatientList();
};

window.runPushSim = (id, machine) => {
    PATIENT_RESULTS.push({ id, machine, t: Date.now() });
    notify(`${machine} Data Synced!`, "bg-blue-600");
    renderDoctorPatientList(); // Force update on doctor dashboard
};

window.switchTab = (t) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${t}-tab`).classList.add('active');
    document.getElementById(`${t}-panel`).classList.add('active');
    const shell = document.querySelector('.app-container');
    if (t === 'doctor') shell.classList.add('doctor-view'); else shell.classList.remove('doctor-view');
};

function showEmailModal(p) {
    const modal = document.getElementById('patient-welcome-modal');
    document.getElementById('patient-welcome-content').innerHTML = `
        <div class="p-6 text-center">
            <h3 class="text-2xl font-black text-blue-800 mb-2">New Invitation</h3>
            <div class="my-8 bg-blue-50 p-8 rounded-3xl border-4 border-dashed border-blue-200">
                <span class="text-4xl font-black text-blue-600">${p.matrixId}</span>
            </div>
            <p class="text-xs text-gray-400">Invitation sent to: ${p.email}</p>
        </div>`;
    modal.classList.remove('hidden');
    document.getElementById('matrix-id-input').value = p.matrixId;
}

window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');

document.addEventListener('DOMContentLoaded', () => {
    populateDiagnosisDropdown();
    document.getElementById('referral-form').onsubmit = handleReferral;
    document.getElementById('patient-search-form').onsubmit = (e) => {
        e.preventDefault();
        const p = REFERRED_PATIENTS.find(p => p.matrixId === document.getElementById('matrix-id-input').value.toUpperCase());
        if (p) renderPatientDashboard(p);
    };
});
