'use client'

import { useEffect, useState } from 'react'
import { MissionService } from '@/services/missionService'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export default function ModerationQueuePage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    setLoading(true)
    const pending = await MissionService.getPendingSubmissions()
    setSubmissions(pending)
    setLoading(false)
  }

  async function handleApprove(id: string) {
    setLoading(true)
    await MissionService.approveSubmission(id, user?.id)
    await loadPending()
    setLoading(false)
  }

  async function handleReject(id: string) {
    setLoading(true)
    await MissionService.rejectSubmission(id, 'Rejected by moderator')
    await loadPending()
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BrailleQuest — Moderation queue</h1>
          <p className="text-sm text-gray-500">Review pending mission submissions and approve or reject them.</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading && <div className="text-sm text-gray-500">Loading…</div>}

        {!loading && submissions.length === 0 && (
          <div className="text-sm text-gray-500">No pending submissions.</div>
        )}

        <div className="space-y-4 mt-4">
          {submissions.map(s => (
            <div key={s.id} className="flex gap-4 items-start border p-3 rounded">
              <img src={s.imageUrl} alt="submission" className="w-28 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">Mission: {s.missionId}</div>
                <div className="text-xs text-gray-500">Submitted: {new Date(s.createdAt).toLocaleString()}</div>
                <div className="mt-2 text-sm text-slate-700">AI preview: {(s.aiVerification && s.aiVerification.assessment) || '—'}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleApprove(s.id)} className="bg-green-500 hover:bg-green-600">Approve</Button>
                <Button onClick={() => handleReject(s.id)} className="bg-red-50 text-red-700">Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
