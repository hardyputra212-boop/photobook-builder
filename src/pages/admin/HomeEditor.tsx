import React, { useEffect, useState } from 'react';
import {
  Save,
  Image,
  Type,
  FileText,
  CheckCircle,
  Plus,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  MessageCircle,
  Video,
  Link,
  DollarSign,
  Star,
  X,
} from 'lucide-react';
import { homeApi } from '../../services/api';

interface SliderItem {
  type?: 'image' | 'video';
  url: string;
  title: string;
  youtube_id?: string;
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface PriceItem {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaButtonText: string;
  whatsapp_number: string;
  features: Feature[];
  slider_images: SliderItem[];
  price_list: PriceItem[];
}

export const HomeEditor: React.FC = () => {
  const [content, setContent] = useState<HomeContent>({
    heroTitle: 'Buat Photobook Profesional Tanpa Ribet',
    heroSubtitle: 'Solusi mudah untuk menyusun photobook dengan template menarik. Tanpa perlu install software desain.',
    ctaText: 'Mulai Sekarang - Gratis!',
    ctaButtonText: 'Buat Photobook',
    whatsapp_number: '',
    features: [],
    slider_images: [],
    price_list: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await homeApi.get();
      setContent(data);
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
      await homeApi.update(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleSliderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const result = await homeApi.uploadImage(file);
      const imageUrl = result.url || result.imageUrl;

      const newSliderItem: SliderItem = {
        type: 'image',
        url: imageUrl,
        title: `Slider ${content.slider_images.length + 1}`,
      };

      setContent({
        ...content,
        slider_images: [...content.slider_images, newSliderItem],
      });
    } catch (error) {
      console.error('Error uploading slider image:', error);
      alert('Gagal upload gambar slider');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeSliderImage = (index: number) => {
    const newImages = content.slider_images.filter((_, i) => i !== index);
    setContent({ ...content, slider_images: newImages });
    if (currentSliderIndex >= newImages.length && currentSliderIndex > 0) {
      setCurrentSliderIndex(newImages.length - 1);
    }
  };

  const updateSliderImage = (index: number, field: 'url' | 'title' | 'type', value: string) => {
    const newImages = [...content.slider_images];
    newImages[index] = { ...newImages[index], [field]: value };
    setContent({ ...content, slider_images: newImages });
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSliderVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const token = localStorage.getItem('photobook_token');
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const newSliderItem: SliderItem = {
        type: 'video',
        url: result.url,
        title: `Video ${content.slider_images.length + 1}`,
      };

      setContent({
        ...content,
        slider_images: [...content.slider_images, newSliderItem],
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Gagal upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const addYouTubeSlide = (youtubeUrl: string, title: string) => {
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      alert('URL YouTube tidak valid');
      return;
    }

    const newSliderItem: SliderItem = {
      type: 'video',
      url: youtubeUrl,
      title: title || `YouTube Video ${content.slider_images.length + 1}`,
      youtube_id: youtubeId,
    };

    setContent({
      ...content,
      slider_images: [...content.slider_images, newSliderItem],
    });
  };

  const moveSliderImage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === content.slider_images.length - 1)
    ) {
      return;
    }

    const newImages = [...content.slider_images];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setContent({ ...content, slider_images: newImages });

    if (currentSliderIndex === index) {
      setCurrentSliderIndex(newIndex);
    } else if (
      direction === 'left' && currentSliderIndex === index - 1
    ) {
      setCurrentSliderIndex(currentSliderIndex + 1);
    } else if (
      direction === 'right' && currentSliderIndex === index + 1
    ) {
      setCurrentSliderIndex(currentSliderIndex - 1);
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

  // Price List Functions
  const addPriceItem = () => {
    const newPrice: PriceItem = {
      id: Date.now().toString(),
      name: 'Paket Baru',
      price: 'Rp 0',
      period: 'bulan',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      popular: false,
    };
    setContent({
      ...content,
      price_list: [...content.price_list, newPrice],
    });
  };

  const updatePriceItem = (id: string, field: keyof PriceItem, value: any) => {
    setContent({
      ...content,
      price_list: content.price_list.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const updatePriceFeature = (priceId: string, index: number, value: string) => {
    setContent({
      ...content,
      price_list: content.price_list.map((p) => {
        if (p.id === priceId) {
          const newFeatures = [...p.features];
          newFeatures[index] = value;
          return { ...p, features: newFeatures };
        }
        return p;
      }),
    });
  };

  const addPriceFeature = (priceId: string) => {
    setContent({
      ...content,
      price_list: content.price_list.map((p) => {
        if (p.id === priceId) {
          return { ...p, features: [...p.features, 'Feature baru'] };
        }
        return p;
      }),
    });
  };

  const removePriceFeature = (priceId: string, index: number) => {
    setContent({
      ...content,
      price_list: content.price_list.map((p) => {
        if (p.id === priceId) {
          return { ...p, features: p.features.filter((_, i) => i !== index) };
        }
        return p;
      }),
    });
  };

  const deletePriceItem = (id: string) => {
    setContent({
      ...content,
      price_list: content.price_list.filter((p) => p.id !== id),
    });
  };

  const togglePopular = (id: string) => {
    setContent({
      ...content,
      price_list: content.price_list.map((p) =>
        p.id === id ? { ...p, popular: !p.popular } : p
      ),
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
            {/* Hero Slider Preview */}
            <div className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              {content.slider_images && content.slider_images.length > 0 ? (
                <>
                  <img
                    src={content.slider_images[currentSliderIndex]?.url}
                    alt={content.slider_images[currentSliderIndex]?.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {content.slider_images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSliderIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentSliderIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-white/70 text-center">
                  <Image size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Tidak ada gambar slider</p>
                </div>
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
                {content.features && content.features.length > 0 ? (
                  content.features.map((feature) => (
                    <div key={feature.id} className="text-center p-4">
                      <div className="text-4xl mb-2">{feature.icon}</div>
                      <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="col-span-4 text-center text-gray-500">Tidak ada fitur</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slider Images Section */}
          <div className="bg-surface border border-border rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Image size={20} />
              Slider Images
            </h2>

            {/* Current Slider Preview */}
            {content.slider_images && content.slider_images.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">Preview</label>
                <div className="relative rounded-xl overflow-hidden h-48 bg-primary">
                  <img
                    src={content.slider_images[currentSliderIndex]?.url}
                    alt={content.slider_images[currentSliderIndex]?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <button
                      onClick={() => setCurrentSliderIndex(Math.max(0, currentSliderIndex - 1))}
                      disabled={currentSliderIndex === 0}
                      className="p-2 bg-black/50 rounded-full text-white disabled:opacity-30 hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSliderIndex(
                          Math.min(content.slider_images.length - 1, currentSliderIndex + 1)
                        )
                      }
                      disabled={currentSliderIndex === content.slider_images.length - 1}
                      className="p-2 bg-black/50 rounded-full text-white disabled:opacity-30 hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {content.slider_images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSliderIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentSliderIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Slider Item List */}
            <div className="space-y-3 mb-4">
              {content.slider_images && content.slider_images.length > 0 ? (
                content.slider_images.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-primary border border-border rounded-xl p-3"
                  >
                    <GripVertical size={16} className="text-text-secondary cursor-grab" />

                    {/* Thumbnail */}
                    {item.type === 'video' && item.youtube_id ? (
                      <img
                        src={`https://img.youtube.com/vi/${item.youtube_id}/default.jpg`}
                        alt={item.title}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                    ) : item.type === 'video' ? (
                      <div className="w-16 h-12 bg-surface rounded-lg flex items-center justify-center">
                        <Video size={20} className="text-text-secondary" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                    )}

                    {/* Type Badge */}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      item.type === 'video' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.type === 'video' ? 'Video' : 'Image'}
                    </span>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateSliderImage(index, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="Slider title"
                    />
                    <button
                      onClick={() => moveSliderImage(index, 'left')}
                      disabled={index === 0}
                      className="p-2 text-text-secondary hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => moveSliderImage(index, 'right')}
                      disabled={index === content.slider_images.length - 1}
                      className="p-2 text-text-secondary hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={() => removeSliderImage(index)}
                      className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Image size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada gambar slider</p>
                </div>
              )}
            </div>

            {/* Add Slider Image/Video */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Upload Image */}
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors bg-surface">
                <Image size={20} className="text-text-secondary mb-1" />
                <span className="text-xs text-text-secondary">Upload Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSliderImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent mt-1"></div>
                )}
              </label>

              {/* Upload Video */}
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors bg-surface">
                <Video size={20} className="text-text-secondary mb-1" />
                <span className="text-xs text-text-secondary">Upload Video</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleSliderVideoUpload}
                  disabled={uploadingVideo}
                />
                {uploadingVideo && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent mt-1"></div>
                )}
              </label>

              {/* YouTube URL */}
              <button
                onClick={() => {
                  const url = prompt('Masukkan URL YouTube:');
                  if (url) {
                    const title = prompt('Masukkan judul (opsional):') || '';
                    addYouTubeSlide(url, title);
                  }
                }}
                className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl hover:border-accent/50 transition-colors bg-surface"
              >
                <Link size={20} className="text-text-secondary mb-1" />
                <span className="text-xs text-text-secondary">YouTube URL</span>
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Image size={20} />
              Hero Section
            </h2>

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

          {/* WhatsApp Section */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              WhatsApp
            </h2>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Nomor WhatsApp</label>
              <input
                type="text"
                value={content.whatsapp_number}
                onChange={(e) => setContent({ ...content, whatsapp_number: e.target.value })}
                placeholder="6281234567890"
                className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-white focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-xs text-text-secondary mt-2">
                Format: kode negara + nomor (contoh: 6281234567890)
              </p>
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
              {content.features && content.features.length > 0 ? (
                content.features.map((feature) => (
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
                      className="w-full px-3 py-2 mb-2 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent transition-colors resize-none"
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
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-text-secondary">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada fitur</p>
                </div>
              )}
            </div>
          </div>

          {/* Price List Section */}
          <div className="bg-surface border border-border rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign size={20} />
                Price List
              </h2>
              <button
                onClick={addPriceItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm"
              >
                <Plus size={16} />
                Add Paket
              </button>
            </div>

            <div className="space-y-6">
              {content.price_list && content.price_list.length > 0 ? (
                content.price_list.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-4 border rounded-xl ${
                      pkg.popular ? 'border-accent bg-accent/10' : 'border-border bg-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updatePriceItem(pkg.id, 'name', e.target.value)}
                          className="px-3 py-2 bg-surface border border-border rounded-lg text-white font-medium focus:outline-none focus:border-accent"
                          placeholder="Nama Paket"
                        />
                        <input
                          type="text"
                          value={pkg.price}
                          onChange={(e) => updatePriceItem(pkg.id, 'price', e.target.value)}
                          className="px-3 py-2 bg-surface border border-border rounded-lg text-accent font-bold focus:outline-none focus:border-accent"
                          placeholder="Rp 100.000"
                        />
                        <input
                          type="text"
                          value={pkg.period}
                          onChange={(e) => updatePriceItem(pkg.id, 'period', e.target.value)}
                          className="px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                          placeholder="bulan"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePopular(pkg.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            pkg.popular
                              ? 'bg-accent text-white'
                              : 'bg-surface text-text-secondary hover:text-white'
                          }`}
                          title="Tandai sebagai Populer"
                        >
                          <Star size={16} fill={pkg.popular ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => deletePriceItem(pkg.id)}
                          className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">Features:</label>
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-400" />
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updatePriceFeature(pkg.id, idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                            placeholder={`Feature ${idx + 1}`}
                          />
                          <button
                            onClick={() => removePriceFeature(pkg.id, idx)}
                            className="p-1 text-text-secondary hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addPriceFeature(pkg.id)}
                        className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
                      >
                        <Plus size={14} />
                        Tambah Feature
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada paket harga</p>
                  <button
                    onClick={addPriceItem}
                    className="mt-3 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Tambah Paket Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
