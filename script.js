/**
 * MoveFitRx Master Demo Logic - Build 5 Restored
 * Restores: Email Modals, Binkey Payments, LMNs, and RWE Data Push
 */

const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    date: new Date().toLocaleDateString()
};

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' }
];

const WORKOUT_DETAILS = {
    'Hormonal Balance & Strength': {
        steps: [
            { machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min' },
            { machine: 'Leg Press', activity: '3 Sets x 12 Reps' }
        ]
    },
    'Zone 2 Cardio + Resistance': {
        steps: [
            { machine: 'Treadmill', activity: 'Brisk Walk 30 min' },
            { machine: 'Chest Press', activity: '3 Sets x 10 Reps' }
        ]
    }
};

let MOCK_CREDENTIALS = [
    { matrixId: 'MFRX-AB001', gymAccessCode: '205101', used: false },
    { matrixId: 'MFRX-CD002', gymAccessCode: '205102', used: false }
];

let REFERRED_PATIENTS = []; 
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null;

// --- MODAL UTILITIES ---
window.closePatientWelcomeModal = () => {
    document.getElementById('patient-welcome-modal').classList.add('hidden');
};

function showPatientEmail(patient) {
    const modal = document.getElementById('patient-welcome-modal');
    const content = document.getElementById('patient-welcome-content');
    content.innerHTML = `
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 class="text-xl font-bold text-blue-800 mb-2">Welcome to MoveFitRx</h3>
            <p class="text-sm mb-4">Hello ${patient.name}, your prescription is ready. Use the code below to sign up.</p>
            <div class="bg-white p-3 text-center border-2 border-blue-400 rounded-lg text-2xl font-black text-blue-600">
                ${patient.matrixId}
            </div>
            <p class="text-xs mt-4 text-gray-500 italic text-center">Simulated invitation email sent to ${patient.email}</p>
        </div>
    `;
    modal.classList.remove('hidden');
    document.getElementById('matrix-id-input').value = patient.matrixId;
}

// --- CLINICIAN WORKFLOW ---
function setupDoctorPortal() {
    const select = document.getElementById('diagnosis-select');
    if (select) {
        select.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
    document.getElementById('referral-form').onsubmit = (e) => {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS.find(c => !c.used);
        if (!cred) return alert("All demo IDs are assigned.");
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
        renderDoctorPatientList();
        
        // AUTO-FLOW: Switch to patient portal and show the "Email"
        window.switchTab('patient');
        showPatientEmail(patient);
        e.target.reset();
    };
}

function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (REFERRED_PATIENTS.length === 0) {
        list.innerHTML = '<p class="text-gray-400 italic">No active referrals.</p>';
        return;
    }
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const results = PATIENT_RESULTS.filter(r => r.id === p.matrixId).length;
        const progress = Math.min(100, (results / 4) * 100); // 4 pushes for 100% demo
        return `
            <div class="card bg-white border-l-4 ${p.status === 'PAID' ? 'border-green-500' : 'border-yellow-400'} mb-3">
                <div class="flex justify-between">
                    <span class="font-bold">${p.name}</span>
                    <span class="text-[10px] font-bold ${p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}">${p.status}</span>
                </div>
                <div class="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div class="bg-green-500 h-full transition-all" style="width: ${progress}%"></div>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">ID: ${p.matrixId} | Adherence: ${progress}%</p>
            </div>
        `;
    }).join('');
}

// --- PATIENT & RWE WORKFLOW ---
function setupPatientPortal() {
    document.getElementById('patient-search-form').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('matrix-id-input').value.toUpperCase();
        const patient = REFERRED_PATIENTS.find(p => p.matrixId === id);
        if (patient) renderPatientData(patient);
        else alert("Invitation code not found.");
    };
}

function renderPatientData(patient) {
    const display = document.getElementById('patient-data');
    display.classList.remove('hidden');

    if (patient.status === 'PENDING_PAYMENT') {
        display.innerHTML = `
            <div class="card bg-blue-50 border-2 border-blue-100 text-center p-6">
                <h3 class="font-bold text-blue-800 text-xl mb-2">HSA/FSA Eligible Prescription</h3>
                <p class="text-sm text-gray-600 mb-6">A Letter of Medical Necessity has been generated. Pay $99.00 to activate your gym access.</p>
                <button onclick="simulateBinkeyPay('${patient.matrixId}')" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg">
                    VERIFY & PAY WITH BINKEY
                </button>
            </div>
        `;
    } else {
        const steps = WORKOUT_DETAILS[patient.regimenName].steps;
        display.innerHTML = `
            <div class="card bg-green-50 border-l-4 border-green-500 mb-6">
                <p class="text-xs font-bold text-green-700 uppercase">Facility Access Code</p>
                <p class="text-3xl font-black text-green-800">${patient.gymAccessCode}</p>
            </div>
            <h4 class="font-bold text-gray-800 mb-3">Your Prescribed Regimen</h4>
            ${steps.map(s => `
                <div class="card bg-white border border-gray-200 mb-3">
                    <p class="font-bold">${s.machine}</p>
                    <p class="text-xs text-gray-500">${s.activity}</p>
                    <button onclick="pushRWE('${patient.matrixId}', '${s.machine}')" class="mt-3 w-full bg-blue-500 text-white text-[10px] font-bold py-2 rounded uppercase tracking-widest">
                        Trigger Workout Data Push
                    </button>
                </div>
            `).join('')}
        `;
    }
}

window.simulateBinkeyPay = (id) => {
    const p = REFERRED_PATIENTS.find(p => p.matrixId === id);
    p.status = 'PAID';
    alert("Binkey: HSA/FSA Eligibility Confirmed. Payment Successful!");
    renderPatientData(p);
    renderDoctorPatientList();
};

window.pushRWE = (id, machine) => {
    PATIENT_RESULTS.push({ id, machine, time: Date.now() });
    alert(`Success: ${machine} data pushed to Clinician Dashboard!`);
    renderDoctorPatientList();
};

// --- NAVIGATION & INIT ---
window.switchTab = (tab) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    document.getElementById(`${tab}-panel`).classList.add('active');
    
    const container = document.querySelector('.app-container');
    if (tab === 'doctor') container.classList.add('doctor-view');
    else container.classList.remove('doctor-view');
};

window.onload = () => { setupDoctorPortal(); setupPatientPortal(); };
