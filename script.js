/**
 * MoveFitRx Build 8.4 - Verified Stable
 * Restores: LMN View, 3-Way Payment, Progress Tracking, & Clinician Oversight
 */

const CLINICIAN_DETAILS = { 
    name: 'Dr. Jane Foster, MD', 
    clinic: 'MoveFitRx Clinical Group', 
    date: new Date().toLocaleDateString() 
};

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0', steps: 4 },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00', steps: 3 },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8', steps: 3 },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0', steps: 3 },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2', steps: 3 },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10', steps: 5 }
];

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ 
    matrixId: `MFRX-ST0${i+1}`, 
    gymAccessCode: `20510${i}`, 
    used: false 
}));

let REFERRED_PATIENTS = [];
let PATIENT_WORKOUTS = []; 
let PENDING_PATIENT_DATA = null;

function initializeState() {
    if (REFERRED_PATIENTS.length === 0) {
        const c1 = MOCK_CREDENTIALS[0]; c1.used = true;
        const c2 = MOCK_CREDENTIALS[1]; c2.used = true;
        REFERRED_PATIENTS.push({ name: 'Sarah Connor', diagnosisId: 'HYPT', regimenName: 'Cardio Vascular Health', matrixId: c1.matrixId, gymAccessCode: c1.gymAccessCode, status: 'PAID' });
        REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: c2.matrixId, gymAccessCode: c2.gymAccessCode, status: 'PENDING_PAYMENT' });
        
        // Seed initial progress for Sarah
        PATIENT_WORKOUTS.push({ id: c1.matrixId }, { id: c1.matrixId });
    }
}

function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-panel`).classList.add('active');
    const btn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (btn) btn.classList.add('active');
    if (tab === 'doctor') renderDoctorPatientList();
}

// --- CLINICIAN PORTAL ---
function renderDoctorPatientList() {
    const list = document.getElementById('patients-list');
    if (!list) return;
    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const completed = PATIENT_WORKOUTS.filter(w => w.id === p.matrixId).length;
        const progress = Math.min((completed / dx.steps) * 100, 100);
        const color = p.status === 'PAID' ? 'border-green-500' : 'border-yellow-500';
        
        return `
            <div class="card bg-white border-l-4 ${color} p-4 mb-3 shadow-sm rounded-r-lg">
                <div class="flex justify-between items-start mb-2">
                    <div><p class="font-bold text-gray-800">${p.name}</p><p class="text-xs text-gray-500">${dx.name}</p></div>
                    <span class="text-[10px] font-black px-2 py-1 rounded bg-gray-100 ${p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}">${p.status}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>${p.matrixId}</span>
                    <span>${completed} / ${dx.steps} SESSIONS</span>
                </div>
            </div>`;
    }).join('');
}

// --- PATIENT PORTAL ---
function handlePatientLogin(e) {
    e.preventDefault();
    const id = e.target.matrixId.value;
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    if (p) {
        document.getElementById('patient-login-section').classList.add('hidden');
        document.getElementById('patient-dashboard').classList.remove('hidden');
        renderPatientDashboard(p);
    } else { alert("Access Code Not Found"); }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-dashboard-content');
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
    
    if (p.status === 'PENDING_PAYMENT') {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
                <h3 class="font-bold text-xl mb-4 text-gray-800">Complete Your Enrollment</h3>
                <div class="space-y-4">
                    <button onclick="showPaymentModal('${p.matrixId}', 'HSA')" class="w-full flex items-center justify-between border-2 border-green-600 p-4 rounded-xl hover:bg-green-50 group">
                        <span class="font-bold text-green-700">HSA / FSA (via Binkey)</span>
                        <i class="fas fa-chevron-right text-green-600"></i>
                    </button>
                    <button onclick="showPaymentModal('${p.matrixId}', 'LMN')" class="w-full flex items-center justify-between border-2 border-blue-600 p-4 rounded-xl hover:bg-blue-50">
                        <span class="font-bold text-blue-700">View Medical Necessity (LMN)</span>
                        <i class="fas fa-file-medical text-blue-600"></i>
                    </button>
                    <button onclick="showPaymentModal('${p.matrixId}', 'CC')" class="w-full flex items-center justify-between border-2 border-gray-200 p-4 rounded-xl hover:bg-gray-50">
                        <span class="font-bold text-gray-600">Standard Credit Card</span>
                        <i class="fas fa-credit-card text-gray-400"></i>
                    </button>
                </div>
            </div>`;
    } else {
        const completed = PATIENT_WORKOUTS.filter(w => w.id === p.matrixId).length;
        container.innerHTML = `
            <div class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-2xl text-gray-800">Your Program</h3>
                    <div class="text-right">
                        <p class="text-[10px] text-gray-400 font-bold uppercase">Gym Code</p>
                        <p class="text-xl font-mono font-black text-green-600">${p.gymAccessCode}</p>
                    </div>
                </div>
                <div class="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                    <p class="font-bold text-blue-900 text-lg">${p.regimenName}</p>
                    <p class="text-sm text-blue-700 mb-4">Focus: ${dx.name} Protocols</p>
                    <button onclick="logWorkout('${p.matrixId}')" class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
                        Log Completed Session (${completed}/${dx.steps})
                    </button>
                </div>
            </div>`;
    }
}

// --- PAYMENT & MODALS ---
function showPaymentModal(id, type) {
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);

    if (type === 'LMN') {
        content.innerHTML = `
            <div class="p-8 font-serif text-gray-800">
                <div class="text-center border-b-2 border-gray-800 pb-4 mb-6">
                    <h2 class="text-2xl font-black uppercase italic">MoveFit<span class="text-blue-600">Rx</span></h2>
                    <p class="text-xs font-sans text-gray-500 uppercase font-bold mt-1">Letter of Medical Necessity</p>
                </div>
                <p class="text-sm mb-4 text-right">Date: ${CLINICIAN_DETAILS.date}</p>
                <div class="space-y-2 mb-6">
                    <p class="text-sm"><strong>Patient:</strong> ${p.name}</p>
                    <p class="text-sm"><strong>ICD-10 Diagnosis:</strong> ${dx.name} (${dx.code})</p>
                </div>
                <p class="text-sm leading-relaxed mb-6 italic">"I hereby prescribe the MoveFitRx corrective exercise regimen as a medically necessary treatment for the diagnosis listed above."</p>
                <div class="border-t pt-4">
                    <p class="text-sm font-bold">Dr. Jane Foster, MD</p>
                    <p class="text-xs text-gray-500">MoveFitRx Clinical Group</p>
                </div>
            </div>`;
    } else {
        content.innerHTML = `
            <div class="p-8 text-center">
                <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-shield-alt text-2xl"></i>
                </div>
                <h2 class="text-xl font-bold mb-2">${type} Secure Payment</h2>
                <p class="text-sm text-gray-500 mb-6">Processing through Binkey HSA/FSA Gateway</p>
                <input type="text" placeholder="Account Number" class="w-full p-4 border rounded-xl mb-4 bg-gray-50 font-mono">
                <button onclick="processPayment('${id}')" class="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-lg">Verify & Authorize</button>
            </div>`;
    }
    modal.classList.remove('hidden');
}

function processPayment(id) {
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    alert("Authenticating with Binkey Eligibility Server...");
    p.status = 'PAID';
    document.getElementById('payment-modal').classList.add('hidden');
    renderPatientDashboard(p);
}

function logWorkout(id) {
    PATIENT_WORKOUTS.push({ id: id, date: Date.now() });
    const p = REFERRED_PATIENTS.find(x => x.matrixId === id);
    renderPatientDashboard(p);
}

// --- INITIALIZATION ---
function initializeApp() {
    initializeState();
    const sel = document.getElementById('diagnosis-select');
    if (sel) sel.innerHTML = DIAGNOSES.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    renderDoctorPatientList();
    
    document.getElementById('referral-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const cred = MOCK_CREDENTIALS.find(c => !c.used);
        cred.used = true;
        const dx = DIAGNOSES.find(d => d.id === e.target.diagnosis.value);
        const p = { name: e.target.name.value, diagnosisId: dx.id, regimenName: dx.regimen, matrixId: cred.matrixId, gymAccessCode: cred.gymAccessCode, status: 'PENDING_PAYMENT' };
        REFERRED_PATIENTS.unshift(p);
        PENDING_PATIENT_DATA = p;
        renderDoctorPatientList();
        document.getElementById('clinician-notification-modal').classList.remove('hidden');
    });

    document.getElementById('patient-login-form').addEventListener('submit', handlePatientLogin);
    
    document.getElementById('close-clinician-notification-btn').onclick = () => {
        document.getElementById('clinician-notification-modal').classList.add('hidden');
        switchTab('patient');
        document.getElementById('welcome-patient-name').textContent = PENDING_PATIENT_DATA.name;
        document.getElementById('welcome-matrix-id').textContent = PENDING_PATIENT_DATA.matrixId;
        document.getElementById('patient-welcome-modal').classList.remove('hidden');
    };
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.switchTab = switchTab;
window.showPaymentModal = showPaymentModal;
window.processPayment = processPayment;
window.logWorkout = logWorkout;
window.closePatientWelcomeModal = () => document.getElementById('patient-welcome-modal').classList.add('hidden');