// --- MASTER END-TO-END DEMO LOGIC ---
const CLINICIAN_DETAILS = { name: 'Dr. Jane Foster, MD', clinic: 'MoveFitRx Clinical Group' };
const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' }
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': { steps: [{ machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min' }, { machine: 'Leg Press', activity: '3 Sets x 12 Reps' }] },
    'Zone 2 Cardio + Resistance': { steps: [{ machine: 'Treadmill', activity: 'Brisk Walk 30 min' }, { machine: 'Chest Press', activity: '3 Sets x 10 Reps' }] }
};

let MOCK_CREDENTIALS = [{ matrixId: 'MFRX-AB001', gymAccessCode: '205101', used: false }];
let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null;

// --- UTILITIES ---
function getPatientByMatrixId(id) { return REFERRED_PATIENTS.find(p => p.matrixId === id); }

// --- WORKFLOW: CLINICIAN ---
function setupDoctorPortal() {
    const select = document.getElementById('diagnosis-select');
    if (select) select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    document.getElementById('referral-form').addEventListener('submit', handleReferral);
}

function handleReferral(e) {
    e.preventDefault();
    const cred = MOCK_CREDENTIALS.find(c => !c.used);
    if (!cred) return alert("Out of Demo Codes");
    cred.used = true;

    const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
    const patient = {
        name: e.target.name.value,
        email: e.target.email.value,
        matrixId: cred.matrixId,
        gymAccessCode: cred.gymAccessCode,
        regimenName: dx.regimen,
        status: 'PENDING_PAYMENT',
        createdAt: Date.now()
    };
    REFERRED_PATIENTS.unshift(patient);
    PENDING_PATIENT_DATA = patient;
    
    renderDoctorPatientList();
    switchTab('patient'); // Auto-switch to simulate the email link click
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const completed = PATIENT_RESULTS.filter(r => r.patientMatrixId === p.matrixId).length;
        const progress = Math.min(100, (completed / 6) * 100); // Demo assumes 6 total for 100%
        return `
            <div class="card border-l-4 ${p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500'}">
                <p class="font-bold">${p.name} <span class="text-xs text-gray-400">(${p.matrixId})</span></p>
                <p class="text-xs font-bold text-emerald-600">${p.status === 'PAID' ? 'ACTIVE REGIMEN' : 'AWAITING PAYMENT'}</p>
                <div class="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// --- WORKFLOW: PATIENT & PAYMENT ---
function setupPatientPortal() {
    document.getElementById('patient-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const patient = getPatientByMatrixId(document.getElementById('matrix-id-input').value.toUpperCase());
        if (patient) renderPatientData(patient);
    });
}

function renderPatientData(patient) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');

    if (patient.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="card bg-blue-50 p-6 text-center">
                <h3 class="font-bold text-blue-800">Prescription Ready</h3>
                <p class="text-sm mb-4">Complete your Binkey HSA/FSA payment to unlock.</p>
                <button onclick="simulatePayment('${patient.matrixId}')" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold">PAY WITH HSA/FSA</button>
            </div>
        `;
    } else {
        const steps = WORKOUT_DETAILS[patient.regimenName].steps;
        display.innerHTML = `
            <div class="card bg-green-50 mb-4">
                <p class="font-bold">Access Code: ${patient.gymAccessCode}</p>
            </div>
            <h4 class="font-bold mb-2">Prescribed Routine:</h4>
            ${steps.map(s => `
                <div class="card bg-white border-l-4 border-blue-500 mb-2">
                    <p class="font-bold text-sm">${s.machine}</p>
                    <p class="text-xs">${s.activity}</p>
                    <button onclick="simulatePush('${patient.matrixId}', '${s.machine}', '${s.activity}')" class="mt-2 text-[10px] bg-blue-500 text-white px-2 py-1 rounded">PUSH RWE DATA</button>
                </div>
            `).join('')}
        `;
    }
}

function simulatePayment(id) {
    const p = getPatientByMatrixId(id);
    p.status = 'PAID';
    alert("Binkey Payment Successful!");
    renderPatientData(p);
}

function simulatePush(id, machine, activity) {
    PATIENT_RESULTS.push({ patientMatrixId: id, machine, exercise: activity, completedAt: Date.now() });
    alert("RWE Data Pushed to Clinician!");
    renderDoctorPatientList();
}

// --- APP CORE ---
window.switchTab = function(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`${tab}-panel`).classList.remove('hidden');
    if (tab === 'patient' && PENDING_PATIENT_DATA) {
        document.getElementById('patient-welcome-modal').classList.remove('hidden');
        document.getElementById('patient-welcome-content').innerHTML = `<p class="font-bold">Invitation Code: ${PENDING_PATIENT_DATA.matrixId}</p>`;
        document.getElementById('matrix-id-input').value = PENDING_PATIENT_DATA.matrixId;
        PENDING_PATIENT_DATA = null;
    }
}

window.onload = () => { setupDoctorPortal(); setupPatientPortal(); };
