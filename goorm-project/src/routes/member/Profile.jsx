import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [role, setRole] = useState('Frontend')
  const [emoji, setEmoji] = useState('👩‍💻')

  useEffect(() => {
    fetch('/users.json')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('데이터 로드 실패:', err))
  }, [])

  return (
    // <div className="min-h-screen bg-gray-100 p-6">
    //   <h1 className="text-2xl font-bold mb-6 text-center">👨‍💻 우리 팀 프로필</h1>
    //   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    //     {users.map((user, idx) => (
    //       <ProfileCard key={idx} {...user} />
    //     ))}
    //   </div>
    // </div>

    <div className="grid gap-6 md:grid-cols-2">
      {/* 왼쪽: 폼 */}
      <div className="space-y-4 rounded-xl border p-4 bg-white">
        <label className="block text-sm font-medium">이름</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="block text-sm font-medium mt-4">직무</label>
        <select
          className="w-full rounded-md border px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Frontend</option>
          <option>Backend</option>
          <option>Designer</option>
        </select>
        <label className="block text-sm font-medium mt-4">이모지</label>
        <div className="flex gap-2">
          {['👩‍💻', '🧑‍🔧', '🎨', '🧠', '🚀'].map((e) => (
            <button
              key={e}
              className={`border rounded-md px-3 py-2 ${emoji === e ? 'bg-gray-100' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* 오른쪽: 미리보기 */}
      <div className="rounded-xl border p-6 bg-white flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div>
          <div className="text-xl font-semibold">{name || '이름'}</div>
          <div className="text-gray-500">{role || '직무'}</div>
        </div>
      </div>
    </div>
  )
}
