export default function StatusBadge({ status, size = 'md' }) {
  const sizes = { sm: 'w-2.5 h-2.5', md: 'w-3.5 h-3.5', lg: 'w-5 h-5' }
  const colors = {
    green: 'bg-emerald-400 shadow-emerald-400/30',
    yellow: 'bg-amber-400 shadow-amber-400/30',
    red: 'bg-rose-400 shadow-rose-400/30',
  }
  return <span className={`inline-block rounded-full ${sizes[size]} ${colors[status]} ${size === 'lg' ? 'shadow-lg' : 'shadow-md'}`} />
}
