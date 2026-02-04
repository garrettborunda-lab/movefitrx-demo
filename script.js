const DIAGNOSES = [
    { id: 'HTN', name: 'Hypertension', regimen: 'Zone 2 Cardio + Resistance', code: 'I10' },
    { id: 'PRED', name: 'Pre-Diabetes', regimen: 'Metabolic Conditioning', code: 'R73.03' },
    { id: 'DEPR', name: 'Depression', regimen: 'High-Intensity Intervals', code: 'F32.9' },
    { id: 'SMT', name: 'Symptomatic Menopause', regimen: 'Strength & Hormonal Balance', code: 'E89.0' }
];

let REFERRED_PATIENTS = [
    { name: 'Sarah Connor', matrixId: 'MFRX-01', diagnosisId: 'HTN', status: 'PAID', adherence: 92 },
    { name: 'John Doe', matrixId: 'MFRX-02', diagnosisId: 'PRED', status: 'PENDING', adherence: 0 }
];

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
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-gray-800">${p.name}</span>
                    <span class="text-xs px-2 py-1 rounded bg-gray-100 font-bold">${p.status}</span>
                </div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full" style="width: ${p.adherence}%"></div>
                </div>
                <div class="text-right text-xs mt-1 font-bold text-emerald-600">${p.adherence}% Adherence</div>
            </div>
        `).join('');
    }
}

function switchTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`${tab}-panel`).classList.remove('hidden');
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active', 'text-emerald-600', 'border-b-4', 'border-emerald-600'));
    document.getElementById(`${tab}-tab`).classList.add('active', 'text-emerald-600', 'border-b-4', 'border-emerald-600');
}

document.addEventListener('DOMContentLoaded', () => {
    populateDiagnosisDropdown();
    renderPatientList();
});
