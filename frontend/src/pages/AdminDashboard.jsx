import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../utils/adminApi'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [owners, setOwners] = useState([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
  const [creating, setCreating] = useState(false)

  const loadOwners = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.get('/admin/owners')
      setOwners(res.data.owners)
      setTotal(res.data.total)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login')
      } else {
        setError(err.response?.data?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login')
      return
    }
    loadOwners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startEdit = (owner) => {
    setEditingId(owner._id)
    setForm({ name: owner.name, email: owner.email, password: '' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ name: '', email: '', password: '' })
  }

  const saveEdit = async (id) => {
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      await adminApi.put(`/admin/owners/${id}`, payload)
      cancelEdit()
      loadOwners()
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  const toggleStatus = async (id, isActive) => {
    try {
      await adminApi.patch(`/admin/owners/${id}/status`, { isActive: !isActive })
      loadOwners()
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will also remove their shop. This cannot be undone.`)) return
    try {
      await adminApi.delete(`/admin/owners/${id}`)
      loadOwners()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await adminApi.post('/admin/owners', newUser)
      setNewUser({ name: '', email: '', password: '' })
      loadOwners()
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Registered Users</h1>
            <p className="text-gray-500 text-sm mt-1">Total registered users: <span className="font-semibold text-gray-800">{total}</span></p>
          </div>
          <button onClick={logout} className="text-sm text-red-600 font-medium cursor-pointer">Logout</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Add New User</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Name"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="sm:col-span-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="space-y-3">
            {owners.map((owner) => (
              <div key={owner._id} className="bg-white rounded-xl shadow-sm p-4">
                {editingId === owner._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Email</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">New Password (leave blank to keep unchanged)</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(owner._id)} className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">Save</button>
                      <button onClick={cancelEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 truncate">{owner.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${owner.isActive ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {owner.isActive ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{owner.email}</p>
                      <p className="text-sm text-gray-400 tracking-widest">••••••••</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => toggleStatus(owner._id, owner.isActive)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer ${owner.isActive ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}
                      >
                        {owner.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => startEdit(owner)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(owner._id, owner.name)} className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {owners.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No registered users yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
