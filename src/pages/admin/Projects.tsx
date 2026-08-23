import React, { useEffect, useState } from 'react';
import {
  Search,
  FileImage,
  User,
  Calendar,
  Download,
  Eye,
  MoreVertical,
} from 'lucide-react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Project {
  id: string;
  name: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  status: 'draft' | 'completed';
  createdAt: any;
  updatedAt: any;
  pagesCount?: number;
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const projectsData: Project[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Get user info
        let userEmail = 'Unknown';
        let userName = 'Unknown';
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            userEmail = userDoc.data().email || 'Unknown';
            userName = userDoc.data().name || 'Unknown';
          }
        } catch (e) {
          // User might be deleted
        }

        projectsData.push({
          id: docSnap.id,
          name: data.name || 'Untitled',
          userId: data.userId || '',
          userEmail,
          userName,
          status: data.status || 'draft',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }

      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'draft':
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-text-secondary mt-1">Lihat semua project photobook</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          placeholder="Search by project name or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-2xl p-5 animate-pulse"
            >
              <div className="h-32 bg-primary rounded-xl mb-4"></div>
              <div className="h-4 bg-primary rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-primary rounded w-1/2"></div>
            </div>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full bg-surface border border-border rounded-2xl p-12 text-center">
            <FileImage size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No projects found</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-colors"
            >
              {/* Preview Area */}
              <div className="relative h-32 bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                <FileImage size={48} className="text-accent/50" />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status || 'draft'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-medium truncate mb-2">
                  {project.name || 'Untitled Project'}
                </h3>

                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                  <User size={14} />
                  <span className="truncate">{project.userName || project.userEmail}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Calendar size={14} />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowMenuId(showMenuId === project.id ? null : project.id)
                      }
                      className="p-2 rounded-lg hover:bg-primary transition-colors"
                    >
                      <MoreVertical size={18} className="text-text-secondary" />
                    </button>

                    {showMenuId === project.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white hover:bg-primary transition-colors"
                            onClick={() => setShowMenuId(null)}
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white hover:bg-primary transition-colors"
                            onClick={() => setShowMenuId(null)}
                          >
                            <Download size={14} />
                            Download PDF
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary rounded-xl">
            <p className="text-2xl font-bold text-white">{projects.length}</p>
            <p className="text-sm text-text-secondary">Total Projects</p>
          </div>
          <div className="text-center p-4 bg-primary rounded-xl">
            <p className="text-2xl font-bold text-yellow-400">
              {projects.filter((p) => p.status === 'draft' || !p.status).length}
            </p>
            <p className="text-sm text-text-secondary">Draft</p>
          </div>
          <div className="text-center p-4 bg-primary rounded-xl">
            <p className="text-2xl font-bold text-green-400">
              {projects.filter((p) => p.status === 'completed').length}
            </p>
            <p className="text-sm text-text-secondary">Completed</p>
          </div>
          <div className="text-center p-4 bg-primary rounded-xl">
            <p className="text-2xl font-bold text-accent">
              {new Set(projects.map((p) => p.userId)).size}
            </p>
            <p className="text-sm text-text-secondary">Active Users</p>
          </div>
        </div>
      </div>
    </div>
  );
};
