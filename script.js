/**
 * MoveFitRx Master Recovery Script (Build 5)
 * Restores: Referral -> Email Modal -> Binkey Pay -> RWE Data -> Doctor Progress
 */

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' }
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': { steps: [{ machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min' }, { machine: 'Leg Press', activity: '3 Sets x 12 Reps' }] },
    'Zone 2 Cardio + Resistance': { steps: [{ machine: 'Treadmill', activity: 'Brisk Walk 30 min' }, { machine: 'Chest Press', activity: '3 Sets x 10 Reps' }] },
    'Metabolic Conditioning': { steps: [{ machine: 'Elliptical', activity: 'Interval Training 20 min' }, { machine: 'Goblet Squats', activity: '3 Sets x 15 Reps' }] }
};

let MOCK_CREDENTIALS = [
    { matrixId: 'MFRX-AB001', gymAccessCode: '205101', used: false },
    { matrixId: 'MFRX-CD002', gymAccessCode: '205102', used: false },
    { matrixId: 'MFRX-EF003', gymAccessCode: '205103', used: false }
];

let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 

// --- CLINICIAN LOGIC ---
function setupDoctorPortal() {
    const select = document.getElementById('diagnosis-select');
    if (select) {
        select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
    
    document.getElementById('referral-form').onsubmit = function(e) {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS.find(c => !c.used);
        if (!cred) return alert("Demo: No more credentials available.");
        
        cred.used = true;
        const dx = DIAGNOSES.find(d => d.id === this.diagnosis.value);
        
        const newPatient = {
            name: this.name.value,
            email: this.email.value,
            matrixId: cred.matrixId,
            gymAccessCode: cred.gymAccessCode,
            regimenName: dx.regimen,
            status: 'PENDING_PAYMENT',
            createdAt: Date.now()
        };

        REFERRED_PATIENTS.unshift(newPatient);
        renderDoctorPatientList();
        
        // TRIGGER EMAIL MODAL & SWITCH
        window.switchTab('patient');
        showEmailModal(newPatient);
        this.reset();
    };
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const completed = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min(100, (completed / 4) * 100); 
        const statusColor = p.status === 'PAID' ? 'text-green-600' : 'text-orange-500';
        
        return `
            <div class="card border-l-4 ${p.status === 'PAID' ? 'border-green-500' : 'border-orange-400'} mb-3 p-4 bg-white shadow-sm">
                <div class="flex justify-between font-bold">
                    <span>${p.name}</span>
                    <span class="text-xs ${statusColor}">${p.status}</span>
                </div>
                <div class="text-[10px] text-gray-500 mb-2">ID: ${p.matrixId} | ${p.regimenName}</div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div class="bg-green-500 h-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// --- PATIENT & SIMULATION LOGIC ---
function setupPatientPortal() {
    document.getElementById('patient-search-form').onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('matrix-id-input').value.trim().toUpperCase();
        const patient = REFERRED_PATIENTS.find(p => p.matrixId === id);
        if (patient) renderPatientDashboard(patient);
        else alert("Invitation code not found.");
    };
}

function renderPatientDashboard(patient) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');

    if (patient.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="card bg-blue-50 border-2 border-blue-200 p-6 text-center rounded-xl">
                <h3 class="font-bold text-blue-800 mb-2">Prescription Activation Required</h3>
                <p class="text-sm text-gray-600 mb-6">Complete your Binkey HSA/FSA transaction to unlock your gym access.</p>
                <button onclick="runBinkeySim('${patient.matrixId}')" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700">
                    VERIFY & PAY WITH BINKEY
                </button>
            </div>
        `;
    } else {
        const steps = WORKOUT_DETAILS[patient.regimenName].steps;
        display.innerHTML = `
            <div class="card bg-green-50 border-l-4 border-green-500 mb-6 p-4">
                <p class="text-[10px] font-bold text-green-700 uppercase">Membership ID / Access Code</p>
                <p class="text-2xl font-black text-green-800">${patient.gymAccessCode}</p>
            </div>
            <h4 class="font-bold text-gray-800 mb-3">Today's Regimen</h4>
            ${steps.map(s => `
                <div class="card bg-white border border-gray-200 mb-3 p-4 rounded-lg shadow-sm">
                    <p class="font-bold text-gray-800">${s.machine}</p>
                    <p class="text-xs text-gray-500 mb-3">${s.activity}</p>
                    <button onclick="runPushSim('${patient.matrixId}', '${s.machine}')" class="w-full bg-blue-500 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-blue-600">
                        TRIGGER WORKOUT DATA PUSH
                    </button>
                </div>
            `).join('')}
        `;
    }
}

// --- GLOBAL HELPERS (Needed for HTML onclicks) ---
window.switchTab = function(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    document.getElementById(`${tab}-panel`).classList.add('active');
    
    const shell = document.querySelector('.app-container');
    if (tab === 'doctor') shell.classList.add('doctor-view');
    else shell.classList.remove('doctor-view');
};

window.closePatientWelcomeModal = function() {
    document.getElementById('patient-welcome-modal').classList.add('hidden');
};

function showEmailModal(patient) {
    const modal = document.getElementById('patient-welcome-modal');
    const content = document.getElementById('patient-welcome-content');
    content.innerHTML = `
        <div class="p-4 bg-white rounded-lg">
            <h3 class="text-lg font-bold text-blue-800 mb-2">New Prescription Invite</h3>
            <p class="text-sm mb-4">You have a new prescription from ${CLINICIAN_DETAILS.name}.</p>
            <div class="bg-blue-50 p-4 text-center border-2 border-dashed border-blue-300 rounded-lg">
                <span class="text-xs text-blue-500 block uppercase font-bold">Invitation Code</span>
                <span class="text-2xl font-black text-blue-700">${patient.matrixId}</span>
            </div>
            <p class="text-[10px] text-gray-400 mt-4 italic">Simulated email notification sent to ${patient.email}</p>
        </div>
    `;
    modal.classList.remove('hidden');
    document.getElementById('matrix-id-input').value = patient.matrixId;
}

window.runBinkeySim = function(id) {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    p.status = 'PAID';
    alert("Binkey: Payment Successful! Gym Access Code Activated.");
    renderPatientDashboard(p);
    renderDoctorPatientList();
};

window.runPushSim = function(id, machine) {
    PATIENT_RESULTS.push({ id, machine, time: Date.now() });
    alert(`Matrix: Data for ${machine} sent to MoveFitRx.`);
    renderDoctorPatientList();
};

// --- INITIALIZE ---
window.onload = function() {
    setupDoctorPortal();
    setupPatientPortal();
    renderDoctorPatientList();
};
