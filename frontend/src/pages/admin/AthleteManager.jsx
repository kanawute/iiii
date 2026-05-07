import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function AthleteManager() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [athletes, setAthletes] = useState([])
  const [teams, setTeams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'athlete',
    age: '', height: '', weight: '', position: '',
    sport: '', phone: '', emergency_contact: '', team_id: ''
  })

  useEffect(() => {
    loadAthletes()
    loadTeams()
  }, [])

  const loadAthletes = async () => {
    const res = await api.get('/auth/athletes')
    setAthletes(res.data)
  }

  const loadTeams = async () => {
    const res = await api.get('/auth/teams')
    setTeams(res.data)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/auth/profile`, {
        name: form.name, age: form.age ? parseInt(form.age) : null,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        position: form.position, sport: form.sport,
        phone: form.phone, emergency_contact: form.emergency_contact,
        team_id: form.team_id
      })
    } else {
      await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
        role: 'athlete', team_id: form.team_id
      })
    }
    setForm({ name: '', email: '', password: '', role: 'athlete', age: '', height: '', weight: '', position: '', sport: '', phone: '', emergency_contact: '', team_id: '' })
    setShowForm(false)
    setEditing(null)
    loadAthletes()
  }

  const startEdit = (a) => {
    setEditing(a.id)
    setForm({
      name: a.name, email: a.email, password: '',
      age: a.age || '', height: a.height || '', weight: a.weight || '',
      position: a.position || '', sport: a.sport || '',
      phone: a.phone || '', emergency_contact: a.emergency_contact || '',
      team_id: a.team_id || ''
    })
    setShowForm(true)
  }

  const deleteAthlete = async (id) => {
    if (confirm('ยืนยันลบนักกีฬาคนนี้?')) {
      await api.delete(`/auth/athletes/${id}`)
      loadAthletes()
    }
  }

  const teamName = (id) => teams.find(tt => tt.id === parseInt(id))?.name || '-'

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">👥 จัดการนักกีฬา</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', email: '', password: '', role: 'athlete', age: '', height: '', weight: '', position: '', sport: '', phone: '', emergency_contact: '', team_id: '' }) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <span>+</span> เพิ่มนักกีฬา
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">✏️ {editing ? 'แก้ไขข้อมูล' : 'เพิ่มนักกีฬาใหม่'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ชื่อ-นามสกุล *</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">อีเมล *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">รหัสผ่าน *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ทีม</label>
                <select name="team_id" value={form.team_id} onChange={handleChange} className="input-field">
                  <option value="">-- ไม่ได้สังกัด --</option>
                  {teams.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                </select>
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
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary">{editing ? 'บันทึก' : 'เพิ่ม'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition">{t('cancel') || 'ยกเลิก'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ชื่อ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">อายุ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ส่วนสูง</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">น้ำหนัก</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ตำแหน่ง</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ทีม</th>
              <th className="text-right px-5 py-3.5 font-semibold text-slate-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a) => (
              <tr key={a.id} className="table-row">
                <td className="px-5 py-3.5 font-medium text-slate-200">{a.name}</td>
                <td className="px-5 py-3.5 text-slate-300">{a.age || '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{a.height ? a.height + ' ซม.' : '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{a.weight ? a.weight + ' กก.' : '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{a.position || '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{teamName(a.team_id)}</td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => startEdit(a)} className="text-teal-400 hover:text-teal-300 font-medium mr-3 hover:underline">แก้ไข</button>
                  {user?.role === 'admin' && <button onClick={() => deleteAthlete(a.id)} className="text-rose-400 hover:text-rose-300 font-medium hover:underline">ลบ</button>}
                </td>
              </tr>
            ))}
            {athletes.length === 0 && (
              <tr><td colSpan="7" className="text-center text-slate-500 py-10">ยังไม่มีนักกีฬาในระบบ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
