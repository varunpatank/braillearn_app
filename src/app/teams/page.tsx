'use client'

import { useEffect, useState } from 'react'
import { TeamService } from '@/services/teamService'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { ClassDashboard } from '@/components/ClassDashboard'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    TeamService.getTeams().then(setTeams)
  }, [])

  async function handleCreate() {
    if (!name || !user) return
    setCreating(true)
    const res = await TeamService.createTeam(name, desc, user.id)
    if (res?.team) setTeams(prev => [res.team, ...prev])
    setName('')
    setDesc('')
    setCreating(false)
  }

  async function handleJoin(teamId: string) {
    if (!user) return
    await TeamService.joinTeam(teamId, user.id)
    // refresh teams list
    const list = await TeamService.getTeamsForUser(user.id)
    setTeams(list)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classrooms & Teams</h1>
          <p className="text-gray-600 mt-2 max-w-xl">Create or join school teams, view member progress, and compare team leaderboards.</p>
        </div>
        <div>
          <Button onClick={() => window.location.href = '/braillequest'}>Back to BrailleQuest</Button>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Create a team</h3>
            <div className="mt-4 grid gap-2">
              <input className="border p-2 rounded" placeholder="Team name" value={name} onChange={e => setName(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Short description" value={desc} onChange={e => setDesc(e.target.value)} />
              <div className="mt-3">
                <Button onClick={handleCreate} disabled={!name || creating}>{creating ? 'Creating…' : 'Create team'}</Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Available teams</h3>
            <div className="mt-4 grid gap-3">
              {teams.length === 0 && <div className="text-sm text-gray-500">No teams yet — create one!</div>}
              {teams.map(t => (
                <div key={t.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { setSelected(t) }}>Open</Button>
                    <Button onClick={() => handleJoin(t.id)}>Join</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold">Team leaderboard</h4>
            <p className="text-xs text-gray-500 mt-1">Top contributors across your teams.</p>
            <div className="mt-4">
              {/* simple aggregated leaderboard from mock data or selected team */}
              {selected ? (
                <div>
                  <h5 className="font-medium text-sm">{selected.name} members</h5>
                  <div className="mt-3">
                    {/* fetch and show team leaderboard */}
                    <TeamMembersList teamId={selected.id} />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Select a team to see members and leaderboard.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold">Class tools</h4>
            <p className="text-sm text-gray-600 mt-2">Teacher reports, assignments, and shared resources for teams and classrooms.</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => alert('Teacher reports — placeholder')}>Reports</Button>
              <Button onClick={() => alert('Assignments — placeholder')}>Assignments</Button>
            </div>
          </div>
        </aside>
      </section>

      {selected && (
        <div className="mt-8">
          {/** adapt team -> BrailleClass-shaped object for the dashboard component */}
          <ClassDashboard classData={{
            id: selected.id,
            creatorId: selected.owner_id || null,
            title: selected.name,
            description: selected.description || '',
            imageUrl: selected.image_url || '/braille-pattern.svg',
            meetingLink: '',
            schedule: { days: [], time: '', duration: 60 },
            level: 'beginner',
            category: 'Team',
            maxStudents: 999,
            isPublic: true,
            chapters: [],
            enrolledStudents: [],
            tags: [],
            createdAt: selected.created_at,
            updatedAt: selected.created_at
          } as any} onClose={() => setSelected(null)} currentUserId={user?.id} />
        </div>
      )}
    </div>
  )
}

function TeamMembersList({ teamId }: { teamId: string }) {
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    TeamService.getTeamLeaderboard(teamId).then(setMembers)
  }, [teamId])

  return (
    <div className="space-y-2">
      {members.slice(0, 10).map((m) => (
        <div key={m.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border">{(m.username || m.email || 'U').charAt(0)}</div>
            <div>
              <div className="font-medium text-sm">{m.username || m.email}</div>
              <div className="text-xs text-gray-500">Level {m.level || 1}</div>
            </div>
          </div>
          <div className="text-sm font-semibold text-yellow-700">{(m.total_points || 0).toLocaleString()} XP</div>
        </div>
      ))}
      {members.length === 0 && <div className="text-xs text-gray-500">No members yet.</div>}
    </div>
  )
}
