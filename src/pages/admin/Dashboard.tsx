import React, { useEffect, useState } from 'react';
import { Users, FileImage, TrendingUp } from 'lucide-react';
import { statsApi, usersApi, projectsApi } from '../../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalProjects: 0,
    completedProjects: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, usersData, projectsData] = await Promise.all([
        statsApi.get(),
        usersApi.getAll(),
        projectsApi.getAll(),
      ]);

      setStats(statsData);
      setRecentUsers(usersData.slice(0, 5));
      setRecentProjects(projectsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const avgProjectsPerUser = stats.totalUsers > 0
    ? (stats.totalProjects / stats.totalUsers).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-text-secondary mt-1">Selamat datang di panel admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Users size={24} className="text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>+12%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : stats.totalUsers}
            </p>
            <p className="text-text-secondary text-sm">Total Users</p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Users size={24} className="text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : stats.totalCustomers}
            </p>
            <p className="text-text-secondary text-sm">Customers</p>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-green-500/20">
              <FileImage size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : stats.totalProjects}
            </p>
            <p className="text-text-secondary text-sm">Total Projects</p>
          </div>
        </div>

        {/* Avg Projects */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <TrendingUp size={24} className="text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : avgProjectsPerUser}
            </p>
            <p className="text-text-secondary text-sm">Avg Projects/User</p>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-white">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/50">
                <tr>
                  <th className="text-left px-5 py-3 text-sm text-text-secondary font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-sm text-text-secondary font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-sm text-text-secondary font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-text-secondary">
                      Loading...
                    </td>
                  </tr>
                ) : recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-text-secondary">
                      No users yet
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id} className="border-t border-border hover:bg-primary/30">
                      <td className="px-5 py-3 text-sm text-white">{user.email || '-'}</td>
                      <td className="px-5 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/50">
                <tr>
                  <th className="text-left px-5 py-3 text-sm text-text-secondary font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-sm text-text-secondary font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-sm text-text-secondary font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-text-secondary">
                      Loading...
                    </td>
                  </tr>
                ) : recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-text-secondary">
                      No projects yet
                    </td>
                  </tr>
                ) : (
                  recentProjects.map((project) => (
                    <tr key={project.id} className="border-t border-border hover:bg-primary/30">
                      <td className="px-5 py-3 text-sm text-white">{project.name || 'Untitled'}</td>
                      <td className="px-5 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {project.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {formatDate(project.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
