/**
 * MoveFitRx Master Build 7 - Full Workflow Restoration
 * Includes: LMN Preview, Binkey HSA Form, Credit Card Form, and RWE Push
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
function setupDoctorPortal() {
    const select = document.getElementById('diagnosis-select');
    if (select) select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    document.getElementById('referral-form').onsubmit = (e) => {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS.find(c => !REFERRED_PATIENTS.some(p => p.matrixId === c.matrixId));
        if (!cred) return alert("Demo: No more IDs available");

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
    };
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const hits = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min(100, (hits / 4) * 100); 
        return `
            <div class="card border-l-4 ${p.status === 'PAID' ? 'border-emerald-500' : 'border-yellow-400'} p-4 mb-3 bg-white shadow-sm">
                <div class="flex justify-between font-bold"><span>${p.name}</span><span class="text-[10px]">${p.status}</span></div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                    <div class="bg-emerald-500 h-full" style="width: ${progress}%"></div>
                </div>
            </div>`;
    }).join('');
}

// --- 2. PAYMENT & LMN WORKFLOW ---
window.openLMNModal = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    document.getElementById('lmn-content-display').innerHTML = `
        <div class="p-4 border border-gray-200">
            <h2 class="font-bold border-b mb-2">LETTER OF MEDICAL NECESSITY</h2>
            <p class="text-xs"><strong>Patient:</strong> ${p.name}</p>
            <p class="text-xs"><strong>Diagnosis:</strong> ${p.diagnosisName} (${p.diagnosisCode})</p>
            <p class="text-xs mt-4">I prescribe MoveFitRx supervised exercise for 12 weeks to manage the above condition.</p>
            <p class="text-xs mt-4 font-bold">Dr. Jane Foster, MD</p>
        </div>`;
    document.getElementById('lmn-modal').classList.remove('hidden');
};

window.setupPaymentForm = (type, id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    const panel = document.getElementById('payment-panel');
    panel.classList.add('active');
    document.getElementById('patient-panel').classList.remove('active');

    panel.innerHTML = `
        <div class="card p-6 bg-white shadow-xl rounded-2xl">
            <h3 class="font-black text-xl mb-4">${type === 'hsa' ? 'Binkey HSA/FSA Payment' : 'Credit Card Payment'}</h3>
            <div class="space-y-4">
                <input type="text" placeholder="${type === 'hsa' ? 'HSA Card Number' : 'Credit Card Number'}" class="w-full p-3 border rounded-lg">
                <div class="flex gap-4"><input type="text" placeholder="MM/YY" class="w-1/2 p-3 border rounded-lg"><input type="text" placeholder="CVC" class="w-1/2 p-3 border rounded-lg"></div>
                <button onclick="processFinalPayment('${id}')" class="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl">SUBMIT $99.00 PAYMENT</button>
                <button onclick="window.switchTab('patient')" class="w-full text-gray-400 text-xs">Cancel</button>
            </div>
        </div>`;
};

window.processFinalPayment = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    p.status = 'PAID';
    document.getElementById('payment-panel').classList.remove('active');
    document.getElementById('patient-panel').classList.add('active');
    renderPatientDashboard(p);
    renderDoctorPatientList();
};

// --- 3. PATIENT & RWE WORKFLOW ---
function renderPatientDashboard(p) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');
    if (p.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="card bg-blue-50 border-2 border-blue-100 p-6 text-center rounded-xl mb-4">
                <h3 class="font-bold text-blue-800 mb-4">Select Payment Method</h3>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full bg-white border border-blue-300 text-blue-600 py-2 rounded-lg mb-4 text-xs font-bold">VIEW LETTER OF MEDICAL NECESSITY</button>
                <button onclick="setupPaymentForm('hsa', '${p.matrixId}')" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mb-4">HSA / FSA (BINKEY)</button>
                <button onclick="setupPaymentForm('cc', '${p.matrixId}')" class="w-full bg-gray-800 text-white font-bold py-4 rounded-xl">CREDIT CARD</button>
            </div>`;
    } else {
        const steps = WORKOUT_DETAILS[p.regimenName].steps;
        display.innerHTML = `
            <div class="bg-emerald-50 p-6 rounded-2xl border-l-8 border-emerald-500 mb-6">
                <p class="text-[10px] font-black text-emerald-700 uppercase">Access Code</p>
                <p class="text-3xl font-black text-emerald-800">${p.gymAccessCode}</p>
            </div>
            ${steps.map(s => `
                <div class="card bg-white border border-gray-100 mb-3 p-4">
                    <p class="font-bold text-sm">${s.m}</p>
                    <button onclick="runPushSim('${p.matrixId}', '${s.m}')" class="w-full bg-blue-500 text-white text-[10px] py-2 rounded mt-2">PUSH DATA</button>
                </div>`).join('')}`;
    }
}

// --- NAVIGATION & INIT ---
window.switchTab = (t) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${t}-tab`).classList.add('active');
    document.getElementById(`${t}-panel`).classList.add('active');
};

function showEmailModal(p) {
    const modal = document.getElementById('patient-welcome-modal');
    document.getElementById('patient-welcome-content').innerHTML = `
        <div class="p-6 text-center">
            <h3 class="text-xl font-bold mb-4">Invitation Code: ${p.matrixId}</h3>
            <p class="text-xs text-gray-400">Sent to ${p.email}</p>
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
    setupDoctorPortal();
    document.getElementById('patient-search-form').onsubmit = (e) => {
        e.preventDefault();
        const p = REFERRED_PATIENTS.find(p => p.matrixId === document.getElementById('matrix-id-input').value.toUpperCase());
        if (p) renderPatientData(p);
    };
});
