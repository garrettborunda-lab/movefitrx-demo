const DIAGNOSES = [
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' },
    { id: 'DEPR', name: 'Depression', regimen: 'High-Intensity Intervals', code: 'F32.9' },
    { id: 'SMT', name: 'Symptomatic Menopause', regimen: 'Strength & Hormonal Balance', code: 'E89.0' }
];

let REFERRED_PATIENTS = [
    { name: 'Sarah Connor', email: 's.connor@sky.net', matrixId: 'MFRX-01', diagnosisId: 'HTN', status: 'PAID', adherence: 92 },
    { name: 'John Doe', email: 'j.doe@example.com', matrixId: 'MFRX-02', diagnosisId: 'PRED', status: 'PENDING', adherence: 0 }
];

function switchTab(tab) {
    const shell = document.getElementById('app-shell');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    
    document.getElementById(`${tab}-panel`).classList.remove('hidden');
    document.getElementById(`${tab}-panel`).classList.add('active');

    // Toggle Desktop Width
    if (tab === 'doctor') {
        shell.classList.add('doctor-view');
    } else {
        shell.classList.remove('doctor-view');
    }

    // Update Tab UI
    document.querySelectorAll('.tab-button').forEach(b => b.className = 'tab-button flex-1 py-4 text-center font-bold text-gray-500');
    const activeTab = document.getElementById(`${tab}-tab`);
    activeTab.className = 'tab-button active flex-1 py-4 text-center font-bold border-b-4 border-emerald-600 text-emerald-600';
}

function populateDiagnosisDropdown() {
    const select = document.getElementById('diagnosis-select');
    if (select) {
        const options = DIAGNOSES.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('');
        select.innerHTML = `<option value="">Select a Diagnosis...</option>` + options;
    }
}

function renderPatientList() {
    const list = document.getElementById('patients-list');
    if (list) {
        list.innerHTML = REFERRED_PATIENTS.map(p => `
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                <div class="flex justify-between items-center mb-3">
                    <div>
                        <span class="font-black text-gray-900 block">${p.name}</span>
                        <span class="text-xs text-gray-400 font-mono">${p.matrixId} | ${p.email}</span>
                    </div>
                    <span class="text-[10px] px-2 py-1 rounded-full font-black tracking-tighter ${p.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${p.status}</span>
                </div>
                <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-100">
                    <div class="bg-emerald-500 h-full transition-all duration-1000" style="width: ${p.adherence}%"></div>
                </div>
                <div class="flex justify-between mt-2">
                    <span class="text-[10px] font-bold text-gray-400 uppercase">Patient Adherence</span>
                    <span class="text-xs font-black text-emerald-600">${p.adherence}%</span>
                </div>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateDiagnosisDropdown();
    renderPatientList();
});
