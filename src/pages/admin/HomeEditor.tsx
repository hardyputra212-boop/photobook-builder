import React, { useEffect, useState } from 'react';
import {
  Save,
  Image,
  Type,
  FileText,
  CheckCircle,
  Upload,
  X,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface HomeContent {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaButtonText: string;
  features: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    id: '1',
    icon: '📸',
    title: 'Upload Foto',
    description: 'Upload foto dari device Anda dengan mudah dan cepat',
  },
  {
    id: '2',
    icon: '🎨',
    title: 'Pilih Template',
    description: 'Berbagai template profesional siap digunakan',
  },
  {
    id: '3',
    icon: '📐',
    title: 'Susun Layout',
    description: 'Drag & drop foto ke layout yang diinginkan',
  },
  {
    id: '4',
    icon: '📄',
    title: 'Export PDF',
    description: 'Download hasil dalam format PDF siap print',
  },
];

export const HomeEditor: React.FC = () => {
  const [content, setContent] = useState<HomeContent>({
    heroImage: '',
    heroTitle: 'Buat Photobook Profesional Tanpa Ribet',
    heroSubtitle:
      'Solusi mudah untuk menyusun photobook dengan template menarik. Tanpa perlu install software desain.',
    ctaText: 'Mulai Sekarang - Gratis!',
    ctaButtonText: 'Buat Photobook',
    features: defaultFeatures,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const docRef = doc(db, 'homeContent', 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setContent(docSnap.data() as HomeContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await updateDoc(doc(db, 'homeContent', 'main'), {
        ...content,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const storageRef = ref(storage, `home/${field}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setContent({ ...content, [field]: downloadURL });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal upload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateFeature = (id: string, field: keyof Feature, value: string) => {
    setContent({
      ...content,
      features: content.features.map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      ),
    });
  };

  const deleteFeature = (id: string) => {
    if (content.features.length <= 1) {
      alert('Minimal harus ada 1 feature');
      return;
    }
    setContent({
      ...content,
      features: content.features.filter((f) => f.id !== id),
    });
  };

  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      icon: '✨',
      title: 'Feature Baru',
      description: 'Deskripsi feature baru',
    };
    setContent({
      ...content,
      features: [...content.features, newFeature],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Home Editor</h1>
          <p className="text-text-secondary mt-1">Edit konten halaman utama website</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-white hover:bg-primary transition-colors"
          >
            <Eye size={18} />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : saved ? (
              <CheckCircle size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </div>

      {previewMode ? (
        // Preview Mode - Simple preview of the home page
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Preview Halaman Utama</h2>
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Hero */}
            <div className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              {content.heroImage && (
                <img
                  src={content.heroImage}
                  alt="Hero"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="relative text-center px-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {content.heroTitle}
                </h1>
                <p className="text-white/80 text-sm md:text-base mb-4">
                  {content.heroSubtitle}
                </p>
                <button className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold">
                  {content.ctaButtonText}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="p-8 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Fitur Kami</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.features.map((feature) => (
                  <div key={feature.id} className="text-center p-4">
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hero Section */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Image size={20} />
              Hero Section
            </h2>

            {/* Hero Image */}
            <div className="mb-4">
              <label className="block text-sm text-text-secondary mb-2">Hero Image</label>
              <div className="relative">
                {content.heroImage ? (
                  <div className="relative">
                    <img
                      src={content.heroImage}
                      alt="Hero"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setContent({ ...content, heroImage: '' })}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
                    <Upload size={24} className="text-text-secondary mb-2" />
                    <span className="text-sm text-text-secondary">Click to upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'heroImage')}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Hero Title */}
            <div className="mb-4">
              <label className="block text-sm text-text-secondary mb-2">Hero Title</label>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Hero Subtitle */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">Hero Subtitle</label>
              <textarea
                value={content.heroSubtitle}
                onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Type size={20} />
              Call to Action
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">CTA Text</label>
                <input
                  type="text"
                  value={content.ctaText}
                  onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Button Text</label>
                <input
                  type="text"
                  value={content.ctaButtonText}
                  onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-surface border border-border rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={20} />
                Features Section
              </h2>
              <button
                onClick={addFeature}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm"
              >
                <Plus size={16} />
                Add Feature
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-primary border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 mb-2 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Title"
                  />

                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Description"
                  />

                  <div className="mt-2">
                    <label className="block text-xs text-text-secondary mb-1">Icon (emoji)</label>
                    <input
                      type="text"
                      value={feature.icon}
                      onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors text-center"
                      placeholder="📸"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
