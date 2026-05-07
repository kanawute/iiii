import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import BodyMapSVG from '../../components/BodyMapSVG'

export default function BodyMap() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [selectedPart, setSelectedPart] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    body_part: '', severity: 3, mechanism: '', pain_type: '',
    swelling: 0, mobility: 3, affects_training: false
  })
  const [saved, setSaved] = useState(false)
  const [injuries, setInjuries] = useState([])

  useEffect(() => {
    api.get(`/injury/user/${user?.id}`).then((r) => setInjuries(r.data))
  }, [user?.id])

  const bodyParts = [
    'head', 'neck', 'left_shoulder', 'right_shoulder', 'left_arm', 'right_arm',
    'left_hand', 'right_hand', 'chest', 'abdomen', 'left_hip', 'right_hip',
    'left_thigh', 'right_thigh', 'left_knee', 'right_knee', 'left_shin', 'right_shin',
    'left_ankle', 'right_ankle', 'left_foot', 'right_foot',
    'lower_back', 'upper_back', 'left_glute', 'right_glute', 'left_calf', 'right_calf',
  ]

  const handleSelect = (part) => {
    setSelectedPart(part)
    setForm({ ...form, body_part: part })
    setShowForm(true)
  }

  const submit = async () => {
    await api.post('/injury', { user_id: user?.id, ...form })
    setSaved(true)
    setShowForm(false)
    setSelectedPart('')
    setForm({ body_part: '', severity: 3, mechanism: '', pain_type: '', swelling: 0, mobility: 3, affects_training: false })
    setTimeout(() => setSaved(false), 3000)
    const r = await api.get(`/injury/user/${user?.id}`)
    setInjuries(r.data)
  }

  const painTypes = {
    'sharp': 'ปวดแหลมคม',
    'dull': 'ปวดตุบๆ',
    'burning': 'ปวดแสบร้อน',
    'throbbing': 'ปวดตุบๆ เป็นจังหวะ',
    'aching': 'ปวดเมื่อย',
    'tingling': 'ชาเป็นเหน็บ',
  }

  const mechanisms = {
    'impact': 'กระแทก',
    'twist': 'บิดหมุน',
    'overuse': 'ใช้งานซ้ำ/หนักเกินไป',
    'fall': 'หกล้ม',
    'sprain': 'ข้อพลิกแพลง',
    'strain': 'กล้ามเนื้อตึง/ฉีก',
    'sudden': 'เกิดขึ้นทันที',
    'gradual': 'ค่อยๆ เป็น',
  }

  const severityColor = (v) => {
    if (v <= 2) return 'from-teal-400 to-emerald-400'
    if (v <= 3) return 'from-amber-400 to-yellow-400'
    return 'from-rose-400 to-pink-400'
  }

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">🩺 รายงานอาการบาดเจ็บ</h2>
      {saved && (
        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>✅</span> รายงานอาการบาดเจ็บสำเร็จ!
        </div>
      )}

      {/* Body Map */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">👆 จิ้มจุดที่เจ็บบนร่างกาย</h3>
        <div className="flex justify-center mb-4">
          <BodyMapSVG onSelect={handleSelect} selectedPart={selectedPart} />
        </div>
      </div>

      {/* Injury Form */}
      {showForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 mb-6 animate-slide-up">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📋 รายละเอียดอาการบาดเจ็บ</h3>
          <p className="text-sm text-slate-400 mb-4">ตำแหน่ง: <span className="font-semibold text-teal-400">{t('body_' + form.body_part)}</span></p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">⚡ ระดับความรุนแรง (1-5)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((v) => (
                  <button key={v} type="button" onClick={() => setForm({ ...form, severity: v })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      form.severity === v ? `bg-gradient-to-r ${severityColor(v)} text-white shadow-md` : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50'
                    }`}>{v}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">💥 ลักษณะอาการเจ็บ</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(mechanisms).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setForm({ ...form, mechanism: key })}
                    className={`px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      form.mechanism === key ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 font-medium' : 'border-slate-600/50 text-slate-400 hover:bg-slate-700/30'
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">😣 ประเภทความเจ็บปวด</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(painTypes).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setForm({ ...form, pain_type: key })}
                    className={`px-3 py-2.5 rounded-xl text-sm transition-all border ${
                      form.pain_type === key ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 font-medium' : 'border-slate-600/50 text-slate-400 hover:bg-slate-700/30'
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">🫧 อาการบวม</label>
              <div className="flex gap-2">
                {[
                  { val: 0, label: 'ไม่มี' },
                  { val: 1, label: 'เล็กน้อย' },
                  { val: 2, label: 'ปานกลาง' },
                  { val: 3, label: 'มาก' },
                ].map((item) => (
                  <button key={item.val} type="button" onClick={() => setForm({ ...form, swelling: item.val })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                      form.swelling === item.val ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-md' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50'
                    }`}>{item.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">🤸 การเคลื่อนไหว (1=แย่, 5=ปกติ)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((v) => (
                  <button key={v} type="button" onClick={() => setForm({ ...form, mobility: v })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                      form.mobility === v ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-600/50'
                    }`}>{v}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.affects_training} onChange={(e) => setForm({ ...form, affects_training: e.target.checked })}
                  className="w-5 h-5 rounded accent-teal-400" />
                <span className="text-sm font-medium text-slate-300">⚠️ ส่งผลต่อการฝึกซ้อม</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={submit} className="flex-1 btn-danger">ส่งรายงานอาการบาดเจ็บ</button>
              <button onClick={() => { setShowForm(false); setSelectedPart('') }} className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold py-2.5 px-6 rounded-xl transition">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Injury History */}
      {injuries.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">📅 ประวัติอาการบาดเจ็บ</h3>
          <div className="space-y-3">
            {injuries.map((inj) => (
              <div key={inj.id} className="border border-slate-700/30 rounded-xl p-4 hover:border-slate-600/50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-200">{t('body_' + inj.body_part) || inj.body_part}</p>
                    <p className="text-xs text-slate-400">ความรุนแรง: <span className={`font-bold bg-gradient-to-r ${severityColor(inj.severity)} bg-clip-text text-transparent`}>{inj.severity}/5</span></p>
                    {inj.mechanism && <p className="text-xs text-slate-400">ลักษณะ: {mechanisms[inj.mechanism] || inj.mechanism}</p>}
                    {inj.pain_type && <p className="text-xs text-slate-400">ความเจ็บปวด: {painTypes[inj.pain_type] || inj.pain_type}</p>}
                    {inj.swelling >= 0 && <p className="text-xs text-slate-400">อาการบวม: {['ไม่มี', 'เล็กน้อย', 'ปานกลาง', 'มาก'][inj.swelling]}</p>}
                    {inj.mobility && <p className="text-xs text-slate-400">การเคลื่อนไหว: {inj.mobility}/5</p>}
                    {inj.affects_training && <p className="text-xs text-rose-400 font-medium">⚠️ ส่งผลต่อการฝึกซ้อม</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    inj.status === 'open' ? 'bg-rose-500/15 text-rose-300' : inj.status === 'recovering' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>{inj.status === 'open' ? 'เจ็บ' : inj.status === 'recovering' ? 'กำลังฟื้นตัว' : 'หายแล้ว'}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{new Date(inj.reported_at).toLocaleDateString('th-TH')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
