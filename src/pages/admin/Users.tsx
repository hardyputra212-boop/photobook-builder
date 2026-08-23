import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  User,
  Shield,
  Mail,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { usersApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface UserData {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  expires_at: string | null;
  last_active: string | null;
  created_at: string;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showMenuId, setShowMenuId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer' as 'admin' | 'customer',
    is_active: true,
    expires_at: '' as string | '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active,
          expires_at: formData.expires_at || null,
        });
      } else {
        const result = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('photobook_token')}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: formData.role,
            is_active: formData.is_active,
            expires_at: formData.expires_at || null,
          }),
        });
        if (!result.ok) {
          const data = await result.json();
          throw new Error(data.error || 'Failed to create user');
        }
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (userId: number) => {
    if (userId === currentUser?.id) {
      alert('Tidak dapat menghapus akun sendiri');
      return;
    }

    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      await usersApi.delete(userId);
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      is_active: user.is_active ?? true,
      expires_at: user.expires_at ? user.expires_at.split('T')[0] : '',
    });
    setShowModal(true);
    setShowMenuId(null);
    setError('');
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'customer',
      is_active: true,
      expires_at: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
    setError('');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (expires_at: string | null) => {
    if (!expires_at) return false;
    return new Date(expires_at) < new Date();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-text-secondary mt-1">Kelola akun users dan customers</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors"
        >
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/50">
              <tr>
                <th className="text-left px-5 py-4 text-sm text-text-secondary font-medium">User</th>
                <th className="text-left px-5 py-4 text-sm text-text-secondary font-medium">Status</th>
                <th className="text-left px-5 py-4 text-sm text-text-secondary font-medium">Expires</th>
                <th className="text-left px-5 py-4 text-sm text-text-secondary font-medium">Joined</th>
                <th className="text-right px-5 py-4 text-sm text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-text-secondary">
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-text-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-primary/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <User size={18} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name || 'No name'}</p>
                          <p className="text-text-secondary text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2">
                        {user.is_active && !isExpired(user.expires_at) ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                            <ToggleRight size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1">
                            <ToggleLeft size={14} />
                            {isExpired(user.expires_at) ? 'Expired' : 'Inactive'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role === 'admin' ? (
                            <span className="flex items-center gap-1">
                              <Shield size={10} />
                              Admin
                            </span>
                          ) : (
                            'Customer'
                          )}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.expires_at ? (
                        <span className={`text-sm ${isExpired(user.expires_at) ? 'text-red-400' : 'text-text-secondary'}`}>
                          {formatDate(user.expires_at)}
                        </span>
                      ) : (
                        <span className="text-sm text-green-400">Never expires</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowMenuId(showMenuId === user.id ? null : user.id)}
                          className="p-2 rounded-lg hover:bg-primary transition-colors"
                        >
                          <MoreVertical size={18} className="text-text-secondary" />
                        </button>
                        {showMenuId === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                              <button
                                onClick={() => openEditModal(user)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white hover:bg-primary transition-colors"
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-primary transition-colors">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    required
                    disabled={!!editingUser}
                    className="w-full pl-10 pr-4 py-3 bg-primary border border-border rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-text-secondary mb-2">Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama lengkap"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-primary border border-border rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Status Akun</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: true })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                      formData.is_active
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-primary border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    <ToggleRight size={18} />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: false })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                      !formData.is_active
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-primary border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    <ToggleLeft size={18} />
                    Inactive
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    Masa Aktif (Tanggal Kadaluarsa)
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Kosongkan jika tidak ada batasan masa aktif
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Role</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                      formData.role === 'customer'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-primary border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    <User size={18} />
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                      formData.role === 'admin'
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-primary border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    <Shield size={18} />
                    Admin
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-primary border border-border rounded-xl text-white hover:bg-primary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
