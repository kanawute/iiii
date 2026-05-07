import { useState, useEffect } from 'react'
import api from '../../api/client'

export default function InjuryReport() {
  const [athletes, setAthletes] = useState([])
  const [saved, setSaved] = useState(false)
  const [recentInjuries, setRecentInjuries] = useState([])
  const [form, setForm] = useState({
    user_id: '', body_part: '', severity: 3, status: 'open',
    mechanism: '', pain_type: '', swelling: 0, mobility: 3,
    affects_training: false, notes: ''
  })

  useEffect(() => {
    api.get('/auth/athletes').then((r) => setAthletes(r.data))
    loadRecent()
  }, [])

  const loadRecent = async () => {
    const r = await api.get('/injury/all')
    setRecentInjuries(r.data.slice(0, 20))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.user_id || !form.body_part) {
      alert('กรุณาเลือกนักกีฬาและตำแหน่งที่เจ็บ')
      return
    }
    await api.post('/injury/', {
      user_id: parseInt(form.user_id),
      body_part: form.body_part,
      severity: parseInt(form.severity),
      status: form.status,
      mechanism: form.mechanism,
      pain_type: form.pain_type,
      swelling: parseInt(form.swelling),
      mobility: parseInt(form.mobility),
      affects_training: form.affects_training
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setForm({ user_id: '', body_part: '', severity: 3, status: 'open', mechanism: '', pain_type: '', swelling: 0, mobility: 3, affects_training: false, notes: '' })
    loadRecent()
  }

  const bodyParts = [
    { id: 'head', label: 'ศีรษะ' }, { id: 'neck', label: 'คอ' },
    { id: 'left_shoulder', label: 'ไหล่ซ้าย' }, { id: 'right_shoulder', label: 'ไหล่ขวา' },
    { id: 'left_arm', label: 'แขนซ้าย' }, { id: 'right_arm', label: 'แขนขวา' },
    { id: 'left_hand', label: 'มือซ้าย' }, { id: 'right_hand', label: 'มือขวา' },
    { id: 'chest', label: 'หน้าอก' }, { id: 'abdomen', label: 'หน้าท้อง' },
    { id: 'left_hip', label: 'สะโพกซ้าย' }, { id: 'right_hip', label: 'สะโพกขวา' },
    { id: 'left_thigh', label: 'ต้นขาซ้าย' }, { id: 'right_thigh', label: 'ต้นขาขวา' },
    { id: 'left_knee', label: 'เข่าซ้าย' }, { id: 'right_knee', label: 'เข่าขวา' },
    { id: 'left_shin', label: 'หน้าแข้งซ้าย' }, { id: 'right_shin', label: 'หน้าแข้งขวา' },
    { id: 'left_ankle', label: 'ข้อเท้าซ้าย' }, { id: 'right_ankle', label: 'ข้อเท้าขวา' },
    { id: 'left_foot', label: 'เท้าซ้าย' }, { id: 'right_foot', label: 'เท้าขวา' },
    { id: 'lower_back', label: 'หลังส่วนล่าง' }, { id: 'upper_back', label: 'หลังส่วนบน' },
    { id: 'left_glute', label: 'กล้ามเนื้อสะโพกซ้าย' }, { id: 'right_glute', label: 'กล้ามเนื้อสะโพกขวา' },
    { id: 'left_calf', label: 'น่องซ้าย' }, { id: 'right_calf', label: 'น่องขวา' },
  ]

  const mechanisms = [
    { key: 'impact', label: 'กระแทก' }, { key: 'twist', label: 'บิดหมุน' },
    { key: 'overuse', label: 'ใช้งานซ้ำ/หนักเกินไป' }, { key: 'fall', label: 'หกล้ม' },
    { key: 'sprain', label: 'ข้อพลิกแพลง' }, { key: 'strain', label: 'กล้ามเนื้อตึง/ฉีก' },
    { key: 'sudden', label: 'เกิดขึ้นทันที' }, { key: 'gradual', label: 'ค่อยๆ เป็น' },
  ]

  const painTypes = [
    { key: 'sharp', label: 'ปวดแหลมคม' }, { key: 'dull', label: 'ปวดตุบๆ' },
    { key: 'burning', label: 'ปวดแสบร้อน' }, { key: 'throbbing', label: 'ปวดตุบๆ เป็นจังหวะ' },
    { key: 'aching', label: 'ปวดเมื่อย' }, { key: 'tingling', label: 'ชาเป็นเหน็บ' },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">🏥 บันทึกอาการบาดเจ็บ (Staff)</h2>

      {saved && (
        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>✅</span> บันทึกอาการบาดเจ็บสำเร็จ!
        </div>
      )}

      <form onSubmit={submit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📋 ข้อมูลอาการบาดเจ็บ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">นักกีฬา *</label>
            <select name="user_id" value={form.user_id} onChange={handleChange} className="input-field" required>
              <option value="">-- เลือกนักกีฬา --</option>
              {athletes.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ตำแหน่งที่เจ็บ *</label>
            <select name="body_part" value={form.body_part} onChange={handleChange} className="input-field" required>
              <option value="">-- เลือกตำแหน่ง --</option>
              {bodyParts.map((bp) => <option key={bp.id} value={bp.id}>{bp.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">สถานะ</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="open">เจ็บ</option>
              <option value="recovering">กำลังฟื้นตัว</option>
              <option value="resolved">หายแล้ว</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ระดับความรุนแรง (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((v) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, severity: v })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    form.severity === v ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50'
                  }`}>{v}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ลักษณะการบาดเจ็บ</label>
            <select name="mechanism" value={form.mechanism} onChange={handleChange} className="input-field">
              <option value="">-- เลือก --</option>
              {mechanisms.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ประเภทความเจ็บปวด</label>
            <select name="pain_type" value={form.pain_type} onChange={handleChange} className="input-field">
              <option value="">-- เลือก --</option>
              {painTypes.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">อาการบวม</label>
            <select name="swelling" value={form.swelling} onChange={handleChange} className="input-field">
              <option value="0">ไม่มี</option>
              <option value="1">เล็กน้อย</option>
              <option value="2">ปานกลาง</option>
              <option value="3">มาก</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">การเคลื่อนไหว (1=แย่, 5=ปกติ)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((v) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, mobility: v })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    form.mobility === v ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50'
                  }`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="affects_training" checked={form.affects_training} onChange={handleChange} className="w-5 h-5 rounded accent-teal-400" />
              <span className="text-sm font-medium text-slate-300">⚠️ ส่งผลต่อการฝึกซ้อม</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn-danger">บันทึกอาการบาดเจ็บ</button>
        </div>
      </form>

      {/* รายการล่าสุด */}
      <div className="table-container">
        <h3 className="font-semibold text-slate-200 p-6 pb-3 flex items-center gap-2">📊 รายการล่าสุด</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-700/60 border-b border-slate-600/50">
            <tr>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ชื่อ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ตำแหน่ง</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ความรุนแรง</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">ลักษณะ</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">บวม</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">การเคลื่อนไหว</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-300">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {recentInjuries.map((inj) => (
              <tr key={inj.id} className="border-b border-slate-700/30 hover:bg-teal-500/5">
                <td className="px-5 py-3.5 font-medium text-slate-200">{inj.name}</td>
                <td className="px-5 py-3.5 text-slate-300">{inj.body_part?.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${inj.severity >= 4 ? 'bg-rose-500/15 text-rose-300' : inj.severity >= 3 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                    {inj.severity}/5
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-300">{inj.mechanism || '-'}</td>
                <td className="px-5 py-3.5 text-slate-300">{['ไม่มี','เล็กน้อย','ปานกลาง','มาก'][inj.swelling ?? 0]}</td>
                <td className="px-5 py-3.5 text-slate-300">{inj.mobility ?? '-'}/5</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    inj.status === 'open' ? 'bg-rose-500/15 text-rose-300' : inj.status === 'recovering' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>{inj.status === 'open' ? 'เจ็บ' : inj.status === 'recovering' ? 'กำลังฟื้นตัว' : 'หายแล้ว'}</span>
                </td>
              </tr>
            ))}
            {recentInjuries.length === 0 && (
              <tr><td colSpan="7" className="text-center text-slate-500 py-10">ยังไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
