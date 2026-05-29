import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Pause, Play, X, Eye, ArrowRight } from 'lucide-react'
import api from '../api/axios'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import toast from 'react-hot-toast'

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pauseModal, setPauseModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [pauseDate, setPauseDate] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchSubs = () => {
    // Backend route is GET /subscriptions (not /my) — returns current user's subs
    api.get('/subscriptions')
      .then(r => setSubscriptions(r.data?.data || r.data || []))
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSubs() }, [])

  const handlePause = async () => {
    if (!pauseDate) { toast.error('Please select a date'); return }
    setActionLoading(true)
    try {
      // Use sub.id (the actual UUID primary key), fallback to subscription_id alias
      await api.put(`/subscriptions/${pauseModal.id || pauseModal.subscription_id}/pause`, { paused_until: pauseDate })
      toast.success('Subscription paused')
      setPauseModal(null)
      fetchSubs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pause')
    } finally { setActionLoading(false) }
  }

  const handleResume = async (subId) => {
    try {
      await api.put(`/subscriptions/${subId}/resume`)  // subId passed as sub.id
      toast.success('Subscription resumed! ✅')
      fetchSubs()
    } catch { toast.error('Failed to resume') }
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      // Backend uses PUT /cancel, not DELETE (no DELETE route defined)
      await api.put(`/subscriptions/${cancelModal.id || cancelModal.subscription_id}/cancel`)
      toast.success('Subscription cancelled')
      setCancelModal(null)
      fetchSubs()
    } catch { toast.error('Failed to cancel') } finally { setActionLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">My Subscriptions</h1>
          <p className="text-gray-muted">Manage your active meal plan subscriptions</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 bg-bg-card rounded-2xl shimmer" />)}</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">No subscriptions yet</h3>
            <p className="text-gray-muted mb-6">Start your meal journey with a subscription plan</p>
            <Link to="/meal-plans" className="btn-primary inline-flex items-center gap-2">Browse Plans <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub, i) => (
              <motion.div
                key={sub.subscription_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg-card border border-gray-800 rounded-2xl p-6 hover:border-accent/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-lg">{sub.plan_name || 'Meal Plan'}</h3>
                      <Badge variant={sub.status || 'active'} />
                    </div>
                    <p className="text-gray-muted text-sm">{sub.restaurant_name || 'Restaurant'}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-muted">
                      <span className="flex items-center gap-1"><Calendar size={12} />
                        {sub.start_date ? new Date(sub.start_date).toLocaleDateString('en-IN') : '—'} →
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-IN') : '—'}
                      </span>
                      <span>₹{sub.price || '—'}</span>
                      <span>{sub.meals_per_day || 2} meals/day</span>
                    </div>
                    {sub.paused_until && (
                      <p className="text-yellow-400 text-xs mt-1">Paused until: {new Date(sub.paused_until).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link to={`/weekly-menu?sub=${sub.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-secondary text-gray-soft hover:text-white border border-gray-700 hover:border-accent/40 text-xs transition-all">
                      <Eye size={14} /> Weekly Menu
                    </Link>

                    {sub.status === 'active' && (
                      <>
                        <button onClick={() => { setPauseModal(sub); setPauseDate('') }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 text-xs transition-all">
                          <Pause size={14} /> Pause
                        </button>
                        <button onClick={() => setCancelModal(sub)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-xs transition-all">
                          <X size={14} /> Cancel
                        </button>
                      </>
                    )}

                    {sub.status === 'paused' && (
                      <button onClick={() => handleResume(sub.id || sub.subscription_id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs transition-all">
                        <Play size={14} /> Resume
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pause Modal */}
      <Modal isOpen={!!pauseModal} onClose={() => setPauseModal(null)} title="Pause Subscription" size="sm">
        <div className="space-y-4">
          <p className="text-gray-muted text-sm">Pause your subscription until a selected date. Deliveries will resume automatically after that date.</p>
          <div>
            <label className="text-sm text-gray-soft block mb-1.5">Pause Until</label>
            <input type="date" value={pauseDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => setPauseDate(e.target.value)} className="input-field" />
          </div>
          <button onClick={handlePause} disabled={actionLoading} className="btn-primary w-full py-3">
            {actionLoading ? 'Pausing...' : 'Confirm Pause'}
          </button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Subscription" size="sm">
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 font-semibold text-sm">⚠️ This action cannot be undone</p>
            <p className="text-gray-muted text-xs mt-1">Your subscription to <strong className="text-white">{cancelModal?.plan_name}</strong> will be permanently cancelled.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCancelModal(null)} className="flex-1 btn-ghost py-3">Keep Subscription</button>
            <button onClick={handleCancel} disabled={actionLoading} className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-semibold transition-all">
              {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
