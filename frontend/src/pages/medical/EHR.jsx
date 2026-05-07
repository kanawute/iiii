import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function EHR() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [athletes, setAthletes] = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ user_id: '', injury_id: '', diagnosis: '', treatment_plan: '', notes: '', recorded_by: user?.id })

  useEffect(() => {
    api.get('/dashboard/team-readiness').then((r) => {
      setAthletes(r.data)
    })
  }, [])

  const viewRecords = async (athleteId) => {
    setSelectedAthlete(athleteId)
    setForm({ ...form, user_id: athleteId })
    const r = await api.get(`/medical/records/${athleteId}`)
    setRecords(r.data)
  }

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/medical/records', form)
    const r = await api.get(`/medical/records/${form.user_id}`)
    setRecords(r.data)
    setForm({ ...form, diagnosis: '', treatment_plan: '', notes: '' })
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">🏥 {t('ehr')}</h2>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">👤 {t('select_athlete')}</h3>
        <div className="flex flex-wrap gap-2">
          {athletes.map((a) => (
            <button key={a.user_id} onClick={() => viewRecords(a.user_id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                selectedAthlete === a.user_id ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
              }`}>
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {selectedAthlete && (
        <>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">📋 {t('records')}</h3>
            {records.length === 0 ? <p className="text-slate-500 text-sm">{t('no_data')}</p> : (
              <div className="space-y-3">
                {records.map((r) => (
                  <div key={r.id} className="border border-slate-700/30 rounded-xl p-4 hover:border-slate-600/50 transition-all">
                    <p className="font-semibold text-sm text-slate-200">{r.diagnosis}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{r.treatment_plan}</p>
                    {r.notes && <p className="text-xs text-slate-500 mt-1.5">{r.notes}</p>}
                    <p className="text-xs text-slate-500 mt-2">โดย: {r.recorded_by_name} · {r.recorded_at}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">➕ {t('new_record')}</h3>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('diagnosis')}</label>
                <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('treatment_plan')}</label>
                <textarea value={form.treatment_plan} onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })} rows={3} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('notes')}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field" />
              </div>
              <button type="submit" className="w-full btn-primary">{t('submit')}</button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
