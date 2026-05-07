import { useState, useEffect } from 'react'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function AthleteProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '', age: '', height: '', weight: '',
    position: '', sport: '', phone: '',
    emergency_contact: '', medical_notes: ''
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      setForm({
        name: r.data.name || '',
        age: r.data.age || '',
        height: r.data.height || '',
        weight: r.data.weight || '',
        position: r.data.position || '',
        sport: r.data.sport || '',
        phone: r.data.phone || '',
        emergency_contact: r.data.emergency_contact || '',
        medical_notes: r.data.medical_notes || ''
      })
      setLoading(false)
    })
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.put('/auth/profile', {
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      height: form.height ? parseFloat(form.height) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      position: form.position,
      sport: form.sport,
      phone: form.phone,
      emergency_contact: form.emergency_contact,
      medical_notes: form.medical_notes
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="text-center py-12 text-slate-400">กำลังโหลด...</div>

  const bmi = form.height && form.weight ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">👤 {form.name}</h2>

      {saved && (
        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>✅</span> บันทึกข้อมูลสำเร็จ!
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <p className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">{form.age || '-'}</p>
          <p className="text-xs text-slate-400">อายุ (ปี)</p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">{form.height || '-'}</p>
          <p className="text-xs text-slate-400">ส่วนสูง (ซม.)</p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">{form.weight || '-'}</p>
          <p className="text-xs text-slate-400">น้ำหนัก (กก.)</p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{bmi || '-'}</p>
          <p className="text-xs text-slate-400">BMI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">✏️ แก้ไขข้อมูล</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ชื่อ-นามสกุล</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">อายุ</label>
            <input name="age" type="number" value={form.age} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ส่วนสูง (ซม.)</label>
            <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">น้ำหนัก (กก.)</label>
            <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ตำแหน่ง</label>
            <input name="position" value={form.position} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ชนิดกีฬา</label>
            <input name="sport" value={form.sport} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">เบอร์โทรศัพท์</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ผู้ติดต่อฉุกเฉิน</label>
            <input name="emergency_contact" value={form.emergency_contact} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">บันทึกทางการแพทย์</label>
            <textarea name="medical_notes" value={form.medical_notes} onChange={handleChange} rows={3} className="input-field" />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full btn-primary">บันทึกข้อมูล</button>
      </form>
    </div>
  )
}
