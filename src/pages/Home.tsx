import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Move,
  FileDown,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Grid2x2,
  LayoutDashboard,
  Image,
  Maximize,
  SquareStack,
  Palette,
  Play,
  Video,
} from 'lucide-react';
import { homeApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

interface Tutorial {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  youtube_id?: string;
  thumbnail?: string;
  order: number;
}

interface HomeContent {
  hero_image?: string;
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  cta_button_text: string;
  whatsapp_number: string;
  features: Feature[];
  slider_images: SliderItem[];
  price_list: PriceItem[];
  tutorials: Tutorial[];
}

const defaultContent: HomeContent = {
  hero_image: '',
  hero_title: 'Buat Photobook Profesional Tanpa Ribet',
  hero_subtitle:
    'Solusi mudah untuk menyusun photobook dengan template menarik. Tanpa perlu install software desain.',
  cta_text: 'Mulai Sekarang - Gratis!',
  cta_button_text: 'Buat Photobook',
  whatsapp_number: '',
  features: [
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
  ],
  slider_images: [],
  price_list: [],
  tutorials: [],
};

export const Home: React.FC = () => {
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { userRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await homeApi.get();
      setContent({
        ...data,
        features: data.features || defaultContent.features,
        slider_images: data.slider_images || [],
      });
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/editor');
    } else {
      navigate('/login');
    }
  };

  const handleGoToAdmin = () => {
    if (userRole === 'admin') {
      navigate('/admin');
    }
  };

  // Auto-rotate slider
  useEffect(() => {
    if (content.slider_images && content.slider_images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % content.slider_images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [content.slider_images]);

  const nextSlide = useCallback(() => {
    if (content.slider_images && content.slider_images.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % content.slider_images.length);
    }
  }, [content.slider_images]);

  const prevSlide = useCallback(() => {
    if (content.slider_images && content.slider_images.length > 0) {
      setCurrentSlide(
        (prev) => (prev - 1 + content.slider_images.length) % content.slider_images.length
      );
    }
  }, [content.slider_images]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const hasSlides = content.slider_images && content.slider_images.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PhotoBook Builder</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-text-secondary hover:text-white transition-colors">
                Fitur
              </a>
              <a href="#tutorials" className="text-text-secondary hover:text-white transition-colors">
                Tutorial
              </a>
              <a href="#pricing" className="text-text-secondary hover:text-white transition-colors">
                Harga
              </a>
              <a href="#how-it-works" className="text-text-secondary hover:text-white transition-colors">
                Cara Kerja
              </a>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {userRole === 'admin' && (
                    <button
                      onClick={handleGoToAdmin}
                      className="px-4 py-2 bg-surface hover:bg-primary border border-border text-white rounded-xl font-medium transition-colors"
                    >
                      Dashboard
                    </button>
                  )}
                  <Link
                    to="/editor"
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-colors"
                  >
                    Buka Editor
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white hover:text-accent transition-colors hidden sm:block"
                  >
                    Masuk
                  </Link>
                  <button
                    onClick={handleStart}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-colors"
                  >
                    Mulai Gratis
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Slider */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
                <Zap size={16} className="text-accent" />
                <span className="text-sm text-accent font-medium">
                  {!loading && content.cta_text}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {!loading ? (
                  <>
                    {content.hero_title.split(' ').slice(0, 3).join(' ')}{' '}
                    <span className="text-accent">
                      {content.hero_title.split(' ').slice(3).join(' ')}
                    </span>
                  </>
                ) : (
                  'Loading...'
                )}
              </h1>

              <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto lg:mx-0">
                {!loading ? content.hero_subtitle : 'Memuat...'}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  {!loading ? content.cta_button_text : 'Memuat...'}
                  <ChevronRight size={20} />
                </button>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-8 py-4 bg-surface hover:bg-primary border border-border text-white rounded-xl font-medium text-lg transition-colors text-center"
                >
                  Pelajari Lebih
                </a>
                {content.whatsapp_number && (
                  <a
                    href={`https://wa.me/${content.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Hero Slider/Carousel */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-accent/20">
                <div className="aspect-[4/3] bg-gradient-to-br from-accent/30 to-purple-500/30">
                  {hasSlides ? (
                    <>
                      {/* Check if current slide is video */}
                      {content.slider_images[currentSlide].type === 'video' || content.slider_images[currentSlide].url?.includes('youtube') || content.slider_images[currentSlide].url?.includes('.mp4') ? (
                        <>
                          {/* YouTube Video */}
                          {content.slider_images[currentSlide].youtube_id ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${content.slider_images[currentSlide].youtube_id}?autoplay=0&rel=0`}
                              title={content.slider_images[currentSlide].title}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            /* Uploaded Video */
                            <video
                              src={content.slider_images[currentSlide].url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </>
                      ) : (
                        /* Image Slide */
                        <>
                          <img
                            src={content.slider_images[currentSlide].url}
                            alt={content.slider_images[currentSlide].title || `Slide ${currentSlide + 1}`}
                            className="w-full h-full object-cover transition-opacity duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white text-xl font-semibold">
                              {content.slider_images[currentSlide].title}
                            </h3>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <Image size={80} className="mx-auto text-white/50 mb-4" />
                        <p className="text-white/70 text-lg">Preview Photobook</p>
                        <p className="text-white/50 text-sm mt-2">
                          Tambahkan gambar/video slider dari Admin Home Editor
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Arrows */}
                {hasSlides && content.slider_images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {hasSlides && content.slider_images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {content.slider_images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-accent scale-110'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Floating Elements */}
              {hasSlides && (
                <>
                  <div className="absolute -top-4 -right-4 p-4 bg-surface rounded-xl shadow-lg border border-border animate-bounce">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm text-white">Easy to Use</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 p-4 bg-surface rounded-xl shadow-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-accent/50 border-2 border-surface"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {content.slider_images.length} Slides
                        </p>
                        <p className="text-xs text-text-secondary">Photobook Gallery</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!hasSlides && (
                <>
                  <div className="absolute -top-4 -right-4 p-4 bg-surface rounded-xl shadow-lg border border-border">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm text-white">Easy to Use</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 p-4 bg-surface rounded-xl shadow-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-accent/50 border-2 border-surface"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">100+ Users</p>
                        <p className="text-xs text-text-secondary">Trust us</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk membuat photobook profesional dalam satu platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: '1', icon: Upload, title: 'Upload Foto', description: 'Upload foto dari device Anda dengan mudah dan cepat' },
              { id: '2', icon: Palette, title: 'Pilih Template', description: 'Berbagai template profesional siap digunakan' },
              { id: '3', icon: Move, title: 'Susun Layout', description: 'Drag & drop foto ke layout yang diinginkan' },
              { id: '4', icon: FileDown, title: 'Export PDF', description: 'Download hasil dalam format PDF siap print' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="p-6 bg-surface rounded-2xl border border-border hover:border-accent/50 transition-all hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                    <Icon size={28} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cara Kerja
            </h2>
            <p className="text-text-secondary text-lg">
              Hanya 3 langkah mudah untuk membuat photobook impian Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Upload size={32} className="text-accent" />
              </div>
              <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border hidden md:block -z-10" />
              <span className="text-accent text-sm font-semibold mb-2 block">Langkah 1</span>
              <h3 className="text-xl font-semibold text-white mb-2">Upload Foto</h3>
              <p className="text-text-secondary">
                Pilih foto-foto terbaik dari device Anda dan upload ke platform
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Palette size={32} className="text-accent" />
              </div>
              <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border hidden md:block -z-10" />
              <span className="text-accent text-sm font-semibold mb-2 block">Langkah 2</span>
              <h3 className="text-xl font-semibold text-white mb-2">Pilih Template</h3>
              <p className="text-text-secondary">
                Pilih dari berbagai template profesional yang telah kami sediakan
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/20 flex items-center justify-center">
                <FileDown size={32} className="text-accent" />
              </div>
              <span className="text-accent text-sm font-semibold mb-2 block">Langkah 3</span>
              <h3 className="text-xl font-semibold text-white mb-2">Export & Download</h3>
              <p className="text-text-secondary">
                Susun layout sesuai keinginan, lalu export dalam format PDF siap print
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Template Menarik
            </h2>
            <p className="text-text-secondary text-lg">
              Pilihan template layout untuk berbagai kebutuhan photobook Anda
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Grid 3x3', icon: Grid2x2 },
              { name: 'Grid 2x2', icon: SquareStack },
              { name: 'Portfolio', icon: LayoutDashboard },
              { name: 'Mosaic', icon: Image },
              { name: '2 Photos', icon: Image },
              { name: 'Panorama', icon: Maximize },
              { name: 'Scrapbook', icon: BookOpen },
              { name: 'Hero Wide', icon: Maximize },
            ].map((template) => {
              const Icon = template.icon;
              return (
              <div
                key={template.name}
                className="p-6 bg-surface rounded-xl border border-border hover:border-accent/50 transition-all"
              >
                <div className="w-full h-20 flex items-center justify-center mb-3">
                  <Icon size={48} className="text-accent" />
                </div>
                <p className="text-white text-center font-medium">{template.name}</p>
              </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              Coba Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-surface rounded-2xl border border-border text-center">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-text-secondary mb-4">
                "Sangat mudah digunakan! Tidak perlu install CorelDraw lagi."
              </p>
              <p className="text-white font-medium">- Studio Foto XYZ</p>
            </div>

            <div className="p-6 bg-surface rounded-2xl border border-border text-center">
              <Clock size={40} className="mx-auto text-accent mb-4" />
              <p className="text-3xl font-bold text-white mb-2">5 Menit</p>
              <p className="text-text-secondary">
                Waktu rata-rata untuk membuat 1 halaman photobook
              </p>
            </div>

            <div className="p-6 bg-surface rounded-2xl border border-border text-center">
              <Shield size={40} className="mx-auto text-accent mb-4" />
              <p className="text-3xl font-bold text-white mb-2">100%</p>
              <p className="text-text-secondary">
                Secure dan data Anda tersimpan dengan aman
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      {content.tutorials && content.tutorials.length > 0 && (
        <section id="tutorials" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Tutorial
              </h2>
              <p className="text-text-secondary text-lg">
                Pelajari cara menggunakan PhotoBook Builder
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.tutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all hover:scale-105 cursor-pointer group"
                  onClick={() => {
                    if (tutorial.youtube_id) {
                      // Open YouTube video in modal or new tab
                      window.open(`https://www.youtube.com/watch?v=${tutorial.youtube_id}`, '_blank');
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-accent/30 to-purple-500/30">
                    {tutorial.youtube_id ? (
                      <img
                        src={`https://img.youtube.com/vi/${tutorial.youtube_id}/maxresdefault.jpg`}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${tutorial.youtube_id}/hqdefault.jpg`;
                        }}
                      />
                    ) : tutorial.thumbnail ? (
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video size={48} className="text-white/50" />
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={28} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Price List Section */}
      {content.price_list && content.price_list.length > 0 && (
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Paket Harga
              </h2>
              <p className="text-text-secondary text-lg">
                Pilih paket yang sesuai dengan kebutuhan Anda
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.price_list.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl p-6 border transition-all hover:scale-105 ${
                    pkg.popular
                      ? 'bg-gradient-to-b from-accent/20 to-surface border-accent'
                      : 'bg-surface border-border hover:border-accent/50'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent rounded-full text-white text-sm font-medium">
                      Populer
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-accent">{pkg.price}</span>
                    <span className="text-text-secondary">/{pkg.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-text-secondary">
                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleStart}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      pkg.popular
                        ? 'bg-accent hover:bg-accent/90 text-white'
                        : 'bg-surface border border-border hover:border-accent text-white'
                    }`}
                  >
                    Pilih Paket
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Siap Membuat Photobook Pertamamu?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Bergabung dengan ratusan pengguna yang sudah membuat photobook profesional dengan mudah
          </p>
          <button
            onClick={handleStart}
            className="px-12 py-4 bg-accent hover:bg-accent/90 text-white rounded-xl font-semibold text-xl transition-all hover:scale-105"
          >
            {!loading ? content.cta_button_text : 'Memuat...'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PhotoBook Builder</span>
            </div>

            <p className="text-text-secondary text-sm">
              © {new Date().getFullYear()} PhotoBook Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
