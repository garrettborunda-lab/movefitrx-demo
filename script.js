/**
 * MoveFitRx Master Build 7 - THE FINAL RESTORATION
 * Fixes: Restores Manual LMN/HSA/CC Buttons and stops "Auto-Skipping"
 */

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' }
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': { steps: [{ m: 'Recumbent Bike', a: '25 min Cardio' }, { m: 'Leg Press', a: '3x12 Reps' }] },
    'Zone 2 Cardio + Resistance': { steps: [{ m: 'Treadmill', a: '30 min Walk' }, { m: 'Chest Press', a: '3x10 Reps' }] }
};

let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 
let MOCK_CREDENTIALS = [{ matrixId: 'MFRX-AB001', gymAccessCode: '205101' }, { matrixId: 'MFRX-CD002', gymAccessCode: '205102' }];

// --- 1. CLINICIAN WORKFLOW ---
function populateDiagnosisDropdown() {
    const select = document.getElementById('diagnosis-select');
    if (select) select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const count = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min(100, (count / 4) * 100);
        return `
            <div class="card border-l-4 ${p.status === 'PAID' ? 'border-emerald-500' : 'border-yellow-400'} p-4 mb-3 bg-white shadow-sm">
                <div class="flex justify-between font-bold"><span>${p.name}</span><span class="text-[10px] uppercase">${p.status}</span></div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                    <div class="bg-emerald-500 h-full transition-all" style="width: ${progress}%"></div>
                </div>
            </div>`;
    }).join('');
}

// --- 2. PAYMENT & LMN LOGIC ---
window.openLMNModal = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    document.getElementById('lmn-content-display').innerHTML = `
        <div class="p-6 bg-white border">
            <h2 class="text-xl font-bold border-b pb-2 mb-4">Letter of Medical Necessity</h2>
            <p class="text-sm"><strong>Patient:</strong> ${p.name}</p>
            <p class="text-sm"><strong>Diagnosis:</strong> ${p.diagnosisName} (${p.diagnosisCode})</p>
            <p class="mt-4 text-sm">MoveFitRx is a prescribed medical exercise program required for the management of the above condition.</p>
            <div class="mt-8 pt-4 border-t italic text-sm">Dr. Jane Foster, MD | MoveFitRx Clinical Group</div>
        </div>`;
    document.getElementById('lmn-modal').classList.remove('hidden');
};

window.setupPaymentForm = (type, id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    const patientPanel = document.getElementById('patient-panel');
    const paymentPanel = document.getElementById('payment-panel');
    
    patientPanel.classList.add('hidden'); // Hide the buttons
    paymentPanel.classList.add('active'); // Show the form
    
    paymentPanel.innerHTML = `
        <div class="card p-8 bg-white shadow-2xl rounded-3xl border border-gray-100">
            <div class="text-center mb-6">
                <i class="fas ${type === 'hsa' ? 'fa-medkit text-blue-600' : 'fa-credit-card text-gray-800'} text-4xl mb-2"></i>
                <h3 class="font-black text-2xl">${type === 'hsa' ? 'Binkey HSA/FSA' : 'Secure Payment'}</h3>
            </div>
            <div class="space-y-4">
                <input type="text" placeholder="Card Number" class="w-full p-4 border rounded-xl bg-gray-50">
                <div class="flex gap-4"><input type="text" placeholder="MM/YY" class="w-1/2 p-4 border rounded-xl bg-gray-50"><input type="text" placeholder="CVC" class="w-1/2 p-4 border rounded-xl bg-gray-50"></div>
                <button onclick="processFinalPayment('${id}')" class="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition">COMPLETE $99 ENROLLMENT</button>
                <button onclick="cancelPayment()" class="w-full text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Go Back</button>
            </div>
        </div>`;
};

window.cancelPayment = () => {
    document.getElementById('payment-panel').classList.remove('active');
    document.getElementById('patient-panel').classList.add('active');
};

window.processFinalPayment = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    p.status = 'PAID';
    document.getElementById('payment-panel').classList.remove('active');
    document.getElementById('patient-panel').classList.add('active');
    renderPatientData(p);
    renderDoctorPatientList();
};

// --- 3. PATIENT WORKFLOW ---
function renderPatientData(p) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');

    if (p.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="card bg-blue-50 border-2 border-blue-100 p-6 text-center rounded-2xl mb-4">
                <h3 class="font-black text-blue-800 text-lg mb-4 text-center">Activation Required</h3>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full bg-white border-2 border-blue-200 text-blue-600 font-bold py-3 rounded-xl mb-4 text-xs">
                    <i class="fas fa-file-medical mr-2"></i> VIEW LMN PREVIEW
                </button>
                <div class="grid grid-cols-1 gap-4">
                    <button onclick="setupPaymentForm('hsa', '${p.matrixId}')" class="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-blue-700">
                        PAY WITH HSA/FSA (BINKEY)
                    </button>
                    <button onclick="setupPaymentForm('cc', '${p.matrixId}')" class="w-full bg-gray-800 text-white font-black py-5 rounded-2xl shadow-lg">
                        PAY WITH CREDIT CARD
                    </button>
                </div>
            </div>`;
    } else {
        const steps = WORKOUT_DETAILS[p.regimenName].steps;
        display.innerHTML = `
            <div class="bg-emerald-50 p-6 rounded-2xl border-l-8 border-emerald-500 mb-6 shadow-inner">
                <p class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Gym Access Code</p>
                <p class="text-4xl font-black text-emerald-800">${p.gymAccessCode}</p>
            </div>
            <h4 class="font-black text-gray-800 mb-4 ml-1">Today's Medical Exercise</h4>
            ${steps.map(s => `
                <div class="card bg-white border border-gray-100 mb-4 p-5 shadow-sm rounded-2xl">
                    <p class="font-black text-gray-900">${s.m}</p>
                    <p class="text-xs text-gray-400 mb-4">${s.a}</p>
                    <button onclick="runPushSim('${p.matrixId}', '${s.m}')" class="w-full bg-blue-600 text-white text-[10px] font-black py-3 rounded-xl shadow-md">
                        PUSH RWE DATA TO CLINICIAN
                    </button>
                </div>`).join('')}`;
    }
}

// --- NAVIGATION & INIT ---
window.switchTab = (t) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active', 'hidden'));
    document.querySelectorAll('.panel').forEach(p => { if (p.id !== `${t}-panel`) p.classList.add('hidden'); });
    document.getElementById(`${t}-tab`).classList.add('active');
    document.getElementById(`${t}-panel`).classList.add('active');
    const shell = document.querySelector('.app-container');
    if (t === 'doctor') shell.classList.add('doctor-view'); else shell.classList.remove('doctor-view');
};

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !REFERRED_PATIENTS.some(p => p.matrixId === c.matrixId));
    if (!cred) return alert("All demo IDs assigned.");

    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const patient = { 
        name: e.target.name.value, 
        email: e.target.email.value, 
        matrixId: cred.matrixId, 
        gymAccessCode: cred.gymAccessCode, 
        regimenName: dx.regimen, 
        status: 'PENDING_PAYMENT',
        diagnosisCode: dx.code,
        diagnosisName: dx.name
    };
    
    REFERRED_PATIENTS.unshift(patient);
    renderDoctorPatientList();
    window.switchTab('patient');
    showEmailModal(patient);
    e.target.reset();
}

function showEmailModal(p) {
    const modal = document.getElementById('patient-welcome-modal');
    document.getElementById('patient-welcome-content').innerHTML = `
        <div class="p-8 text-center bg-white rounded-3xl">
            <h3 class="text-2xl font-black text-blue-800 mb-4 italic">You're Invited!</h3>
            <p class="text-sm text-gray-500 mb-8 font-medium">Dr. Jane Foster sent you an exercise prescription.</p>
            <div class="my-6 bg-blue-50 p-8 rounded-3xl border-4 border-dashed border-blue-200">
                <span class="text-xs text-blue-400 block font-black uppercase tracking-widest mb-2">Invitation Code</span>
                <span class="text-4xl font-black text-blue-600 tracking-tighter">${p.matrixId}</span>
            </div>
        </div>`;
    modal.classList.remove('hidden');
    document.getElementById('matrix-id-input').value = p.matrixId;
}

window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');
window.runPushSim = (id, machine) => {
    PATIENT_RESULTS.push({ id, machine });
    renderDoctorPatientList();
};

document.addEventListener('DOMContentLoaded', () => {
    populateDiagnosisDropdown();
    document.getElementById('referral-form').onsubmit = handleReferral;
    document.getElementById('patient-search-form').onsubmit = (e) => {
        e.preventDefault();
        const p = REFERRED_PATIENTS.find(p => p.matrixId === document.getElementById('matrix-id-input').value.trim().toUpperCase());
        if (p) renderPatientData(p);
    };
});
