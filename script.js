/**
 * MoveFitRx Build 8.10 - THE RECOVERY MASTER
 * RESTORED: NPIs, 36-Session Adherence, Machine Biometrics, & Secure Navigation.
 */

// --- 1. CLINICAL DATA (RESTORED FROM PREVIOUS BUILDS) ---
const CLINICIAN_DETAILS = {
    name: 'Dr. Jane Foster, MD',
    clinic: 'MoveFitRx Clinical Group',
    npi_type1: '9876543210', 
    npi_type2: '1234567890',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
};

const DIAGNOSES = [
    { id: 'SMT', name: 'Symptomatic Menopausal Transition', regimen: 'Hormonal Balance & Strength', code: 'E89.0' },
    { id: 'PHRM', name: 'Postmenopausal Health/Risk Management', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'Z00.00' },
    { id: 'OSTP', name: 'Osteopenia', regimen: 'Bone Density & Balance', code: 'M85.8' },
    { id: 'OSTE', name: 'Osteoporosis', regimen: 'Bone Density & Balance', code: 'M81.0' },
    { id: 'PCOS', name: 'PCOS', regimen: 'Cardio Endurance & Insulin Sensitivity', code: 'E28.2' },
    { id: 'HYPT', name: 'Hypertension', regimen: 'Cardio Vascular Health', code: 'I10' }
];

const MACHINE_PROTOCOLS = {
    'Hormonal Balance & Strength': [
        { machine: 'Recumbent Bike', activity: 'Low Intensity Cardio 25 min' },
        { machine: 'Leg Press', activity: '3 Sets x 12 Reps' },
        { machine: 'Diverging Seated Row', activity: '3 Sets x 10 Reps' }
    ],
    'Bone Density & Balance': [
        { machine: 'Treadmill', activity: 'Brisk Walk 30 min' },
        { machine: 'Calf Extension', activity: '3 Sets x 15 Reps' },
        { machine: 'Hip Adductor', activity: '3 Sets x 12 Reps' }
    ],
    'Cardio Vascular Health': [
        { machine: 'Treadmill', activity: 'Aerobic Walk 40 min' },
        { machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps' }
    ]
};

let MOCK_CREDENTIALS = Array.from({length: 10}, (_, i) => ({ matrixId: `MFRX-ST0${i+1}`, code: `20510${i}` }));
let REFERRED_PATIENTS = [];
let PATIENT_RESULTS = []; 
let PENDING_PATIENT_DATA = null;

// --- 2. INITIALIZATION & DATA SEEDING ---
function initializeApp() {
    if (REFERRED_PATIENTS.length === 0) {
        const c1 = MOCK_CREDENTIALS[0];
        REFERRED_PATIENTS.push({
            name: 'Sarah Connor',
            diagnosisId: 'HYPT',
            regimenName: 'Cardio Vascular Health',
            matrixId: c1.matrixId,
            gymCode: c1.code,
            status: 'PAID'
        });

        // Seed 3 workouts for Sarah to show Adherence immediately
        PATIENT_RESULTS.push(
            { patientId: c1.matrixId, machine: 'Treadmill', activity: 'Aerobic Walk 40 min', metrics: 'Distance: 1.5 mi, Avg HR: 132 BPM', date: Date.now() - 86400000 },
            { patientId: c1.matrixId, machine: 'Seated Leg Curl', activity: '2 Sets x 15 Reps', metrics: 'Weight: 45 lbs, Vol: 1350 lbs', date: Date.now() - 172800000 },
            { patientId: c1.matrixId, machine: 'Treadmill', activity: 'Aerobic Walk 40 min', metrics: 'Distance: 1.2 mi, Avg HR: 128 BPM', date: Date.now() - 259200000 }
        );

        REFERRED_PATIENTS.push({ name: 'Jessica Jones', diagnosisId: 'OSTE', regimenName: 'Bone Density & Balance', matrixId: 'MFRX-ST02', gymCode: '205101', status: 'PENDING' });
    }
    renderClinicianPortal();
}

// --- 3. CLINICIAN DASHBOARD ---
function renderClinicianPortal() {
    const list = document.getElementById('patients-list');
    if (!list) return;

    list.innerHTML = REFERRED_PATIENTS.map(p => {
        const dx = DIAGNOSES.find(d => d.id === p.diagnosisId);
        const resultsCount = PATIENT_RESULTS.filter(r => r.patientId === p.matrixId).length;
        const progress = Math.min((resultsCount / 36) * 100, 100); 
        
        return `
            <div class="card" style="border-left: 5px solid ${p.status === 'PAID' ? '#10b981' : '#f59e0b'}; background:white; padding:15px; border-radius:12px; margin-bottom:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between;">
                    <strong class="text-gray-800">${p.name}</strong>
                    <span style="font-size:10px; font-weight:900; color:${p.status === 'PAID' ? '#10b981' : '#f59e0b'}">${p.status}</span>
                </div>
                <div class="progress-bg"><div class="progress-fill" style="width:${progress}%;"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; font-family:monospace;">
                    <span>ID: ${p.matrixId}</span>
                    <span>ADHERENCE: ${Math.round(progress)}%</span>
                </div>
            </div>`;
    }).join('');
}

// --- 4. PATIENT PORTAL LOGIC ---
function handleLogin(e) {
    if (e) e.preventDefault();
    const idInput = document.querySelector('input[name="matrixId"]');
    const p = REFERRED_PATIENTS.find(x => x.matrixId === idInput.value.toUpperCase());
    
    if (p) {
        document.getElementById('patient-login-section').style.display = 'none';
        document.getElementById('patient-dashboard').classList.remove('hidden');
        document.getElementById('patient-dashboard').style.display = 'block';
        renderPatientDashboard(p);
    } else { alert("Invitation Code not found."); }
}

function renderPatientDashboard(p) {
    const container = document.getElementById('patient-dashboard-content');
    const protocols = MACHINE_PROTOCOLS[p.regimenName] || [];

    if (p.status === 'PENDING') {
        container.innerHTML = `
            <div class="card bg-white p-6 rounded-3xl shadow-lg border-t-4 border-blue-600">
                <h3 class="font-bold text-xl mb-2">Prescription Authorized</h3>
                <p class="text-gray-500 mb-6">${p.regimenName}</p>
                <button onclick="openLMNModal('${p.matrixId}')" class="w-full border-2 border-blue-600 text-blue-600 p-4 rounded-2xl font-bold mb-4">View LMN Document</button>
                <button onclick="showPaymentSim('${p.matrixId}')" class="w-full bg-green-600 text-white p-4 rounded-2xl font-bold shadow-lg">Authorize HSA/FSA (Binkey)</button>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="card bg-white p-6 rounded-3xl shadow-lg border-t-4 border-green-600 text-center">
                <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Matrix Access Unlocked</h3>
                <p class="text-4xl font-mono font-black text-gray-800 mb-6">${p.gym