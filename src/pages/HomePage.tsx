import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, ArrowRight, Star, Phone, Mail, Globe, Clock,
  Shield, Award, Users, Zap, FileText, MessageSquare, ChevronRight,
  MapPin, Send, AlertCircle, Upload, Search, TrendingUp
} from 'lucide-react';
import { supabase, Review, SERVICE_INFO, ServiceType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps { onNavigate: (page: string, svc?: string) => void; }

const WA = 'https://wa.me/916360248020';

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= n ? 'fill-gold text-gold' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ target, suffix, gradient = 'from-gov-main to-gov-dark' }: { target: number; suffix: string; gradient?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref} className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      {count}{suffix}
    </span>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { language } = useAuth();
  const kn = language === 'kn';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enquiry, setEnquiry] = useState({ full_name: '', phone: '', email: '', service_type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const serviceKeys = Object.keys(SERVICE_INFO) as ServiceType[];

  const svcColor: Record<ServiceType, string> = {
    gram_thana: 'from-gov-main to-gov-dark',
    asti_11b: 'from-gov-mid to-gov-main',
    asti_94c: 'from-gov-light to-gov-mid',
    na_property: 'from-gov-main to-gov-dark',
    rehabilitation: 'from-gov-dark to-gov-main',
    ec_only: 'from-gold to-gold-dark',
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErr('');
    const { error } = await supabase.from('enquiries').insert([enquiry]);
    setSubmitting(false);
    if (error) {
      setFormErr(kn ? 'ಸಲ್ಲಿಕೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Submission failed. Please try again.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEnquiry({ full_name: '', phone: '', email: '', service_type: '', message: '' });
    }, 6000);
  };

  const processSteps = [
    { num: '01', en: 'Fill Online Application Form', kn: 'ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ', icon: FileText },
    { num: '02', en: 'Upload Required Documents', kn: 'ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', icon: Upload },
    { num: '03', en: 'Document Verification by SK Digital Seva', kn: 'SK Digital Seva ನಿಂದ ದಾಖಲೆ ಪರಿಶೀಲನೆ', icon: Shield },
    { num: '04', en: 'Processing & WhatsApp Updates', kn: 'ಪ್ರಕ್ರಿಯೆ ಮತ್ತು WhatsApp ಮಾಹಿತಿ', icon: MessageSquare },
  ];

  const whyUs = [
    { en: '170+ Successful Applications', kn: '170+ ಯಶಸ್ವಿ ಅರ್ಜಿಗಳು', icon: Award },
    { en: 'Fast Service', kn: 'ತ್ವರಿತ ಸೇವೆ', icon: Zap },
    { en: 'Secure Document Handling', kn: 'ಸುರಕ್ಷಿತ ದಾಖಲೆ ನಿರ್ವಹಣೆ', icon: Shield },
    { en: 'Professional Support', kn: 'ವೃತ್ತಿಪರ ಸಹಾಯ', icon: Users },
    { en: 'WhatsApp Updates', kn: 'WhatsApp ಮಾಹಿತಿ', icon: MessageSquare },
    { en: 'Customer Friendly Process', kn: 'ಗ್ರಾಹಕ ಸ್ನೇಹಿ ಪ್ರಕ್ರಿಯೆ', icon: CheckCircle },
  ];

  return (
    <div>
      {/* ===== PREMIUM HERO ===== */}
      <section className="relative min-h-[90vh] md:min-h-[85vh] overflow-hidden">
        {/* Background Image - Karnataka Village Property */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Karnataka Village"
            className="w-full h-full object-cover"
          />
          {/* Multi-layer overlay for premium look */}
          <div className="absolute inset-0 bg-gradient-to-r from-gov-dark via-gov-dark/95 to-gov-dark/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-gov-dark/90 via-transparent to-gov-dark/40" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-gold-light to-gold" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gov-main/20 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 animate-fade-in">
              {/* Official badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-gold/40 rounded-full px-5 py-2.5 mb-8 shadow-lg">
                <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white tracking-wide">
                  e-Swathu 2.0 Authorized Assistance Center
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                <span className={kn ? 'font-kn' : ''}>
                  {kn ? 'ಇ-ಸ್ವತ್ತು 2.0' : 'e-Swathu 2.0'}
                </span>
                <br />
                <span className={`text-gold ${kn ? 'font-kn' : ''}`}>
                  {kn ? 'ಅರ್ಜಿ ಸಹಾಯ ಸೇವೆಗಳು' : 'Application Services'}
                </span>
              </h1>

              <p className={`text-lg md:text-xl text-white/85 leading-relaxed mb-8 max-w-xl ${kn ? 'font-kn' : ''}`}>
                {kn
                  ? 'ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯ ಆಸ್ತಿ ದಾಖಲೆಗಳಿಗೆ ಸಂಪೂರ್ಣ ಸಹಾಯ. ನಮ್ಮ ತಜ್ಞರು ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸುತ್ತಾರೆ.'
                  : 'Complete assistance for Karnataka Gram Panchayat property records. Our experts ensure your application succeeds.'}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { val: '170+', label: kn ? 'ಯಶಸ್ವಿ ಅರ್ಜಿಗಳು' : 'Applications' },
                  { val: '99%', label: kn ? 'ಯಶಸ್ಸಿನ ದರ' : 'Success Rate' },
                  { val: '7', label: kn ? 'ದಿನಗಳಲ್ಲಿ' : 'Days Avg' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3">
                    <div className="text-2xl font-bold text-gold">{s.val}</div>
                    <div className={`text-xs text-white/70 ${kn ? 'font-kn' : ''}`}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => onNavigate('apply')} className="btn-gold text-sm px-7 py-3.5 shadow-lg hover:shadow-xl">
                  <FileText className="w-4 h-4" />
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'ಇಂದೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply Now'}</span>
                </button>
                <a href={`${WA}?text=${encodeURIComponent('Hello SK Digital Seva, I need help with e-Swathu application.')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-whatsapp text-sm px-6 py-3.5 shadow-lg hover:shadow-xl">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'WhatsApp ಮಾಡಿ' : 'WhatsApp Us'}</span>
                </a>
                <button onClick={() => onNavigate('track')} className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white px-5 py-3.5 border border-white/30 hover:border-white/50 rounded-lg transition-all backdrop-blur-sm">
                  <Search className="w-4 h-4" />
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'ಅರ್ಜಿ ಟ್ರ್ಯಾಕ್' : 'Track Application'}</span>
                </button>
              </div>
            </div>

            {/* Right - Premium Visual */}
            <div className="lg:col-span-6 hidden lg:block">
              <div className="relative">
                {/* Main laptop/image container */}
                <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                  {/* Laptop showing portal */}
                  <div className="relative rounded-xl overflow-hidden shadow-xl">
                    <img
                      src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="e-Swathu Portal on Laptop"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gov-main/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-white/90 font-medium">e-Swathu Portal Live</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                        <p className="text-xs text-white font-mono">egovswathu.karnataka.gov.in</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  {/* Document Card */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 w-48 transform rotate-[-3deg] hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-gov-main" />
                      <span className="text-xs font-bold text-slate-700">{kn ? 'ದಾಖಲೆ' : 'Document'}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-gov-pale rounded w-full" />
                      <div className="h-2 bg-gov-pale rounded w-3/4" />
                      <div className="h-2 bg-gold-pale rounded w-1/2" />
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] text-slate-500">{kn ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Verified'}</span>
                    </div>
                  </div>

                  {/* Property Image Card */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 w-40 transform rotate-[5deg] hover:rotate-0 transition-transform">
                    <img
                      src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=300"
                      alt="Property"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-slate-700">{kn ? 'ಆಸ್ತಿ ಫೋಟೋ' : 'Property Photo'}</p>
                      <p className="text-[8px] text-slate-400">Gram Panchayat</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 -left-2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" />
                    {kn ? 'ಸೇವೆ ಸಕ್ರಿಯ' : 'Service Active'}
                  </div>
                </div>

                {/* Background decorative shapes */}
                <div className="absolute -z-10 -bottom-8 -right-8 w-40 h-40 bg-gold/20 rounded-full blur-2xl" />
                <div className="absolute -z-10 top-0 left-8 w-24 h-24 bg-gov-main/30 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ===== TRUST STATISTICS ===== */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gov-pale/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gov-pale text-gov-main font-semibold px-4 py-2 rounded-full text-sm mb-6 border border-gov-main/20">
              <Award className="w-4 h-4" />
              {kn ? 'ನಮ್ಮ ಸಾಧನೆಗಳು' : 'Our Achievements'}
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold text-slate-900 mb-4 ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಗ್ರಾಹಕರು ನಮ್ಮನ್ನು ನಂಬುತ್ತಾರೆ' : 'Trusted by Many Customers'}
            </h2>
            <p className={`text-slate-500 text-lg max-w-2xl mx-auto ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಕರ್ನಾಟಕಾದ್ಯಂತ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಸ್ತಿ ಸೇವೆಗಳಲ್ಲಿ ನಮ್ಮ ದಾಖಲೆ ಮಾತಾಡುತ್ತದೆ' : 'Our track record in Gram Panchayat property services speaks for itself'}
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: FileText,
                value: 170,
                suffix: '+',
                label: kn ? 'ಅರ್ಜಿಗಳು ಸಂಸ್ಕರಿಸಲಾಗಿದೆ' : 'Applications Processed',
                color: 'from-gov-main to-gov-dark',
                bgLight: 'bg-gov-pale',
                textColor: 'text-gov-main',
                delay: 0,
              },
              {
                icon: Zap,
                value: 7,
                suffix: kn ? ' ದಿನ' : ' Days',
                label: kn ? 'ಸರಾಸರಿ ಸಮಯ' : 'Average Processing',
                color: 'from-yellow-500 to-amber-600',
                bgLight: 'bg-yellow-50',
                textColor: 'text-yellow-600',
                delay: 100,
              },
              {
                icon: Shield,
                value: 100,
                suffix: '%',
                label: kn ? 'ಸುರಕ್ಷಿತ ದಾಖಲೆ' : 'Secure Documentation',
                color: 'from-blue-500 to-blue-600',
                bgLight: 'bg-blue-50',
                textColor: 'text-blue-600',
                delay: 200,
              },
              {
                icon: MessageSquare,
                value: 24,
                suffix: '/7',
                label: kn ? 'WhatsApp ಬೆಂಬಲ' : 'WhatsApp Support',
                color: 'from-green-500 to-green-600',
                bgLight: 'bg-green-50',
                textColor: 'text-green-600',
                delay: 300,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="group relative"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
                  {/* Icon */}
                  <div className={`w-14 h-14 ${stat.bgLight} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>

                  {/* Counter */}
                  <div className="flex items-baseline gap-0.5 mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} gradient={stat.color} />
                  </div>

                  {/* Label */}
                  <p className={`text-sm text-slate-500 font-medium ${kn ? 'font-kn' : ''}`}>
                    {stat.label}
                  </p>

                  {/* Decorative corner */}
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-5 rounded-tr-2xl rounded-bl-full`} />
                </div>
              </div>
            ))}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: CheckCircle, text: kn ? '99% ಯಶಸ್ಸಿನ ದರ' : '99% Success Rate', color: 'bg-green-50 text-green-700 border-green-200' },
              { icon: Users, text: kn ? 'ಗ್ರಾಹಕ ಸಂತೃಪ್ತಿ' : 'Customer Satisfaction', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { icon: Award, text: kn ? 'ಪರಿಣತ ತಂಡ' : 'Expert Team', color: 'bg-gold-pale text-gold-dark border-gold/30' },
              { icon: Zap, text: kn ? 'ತ್ವರಿತ ಸೇವೆ' : 'Fast Service', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            ].map((pill, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border ${pill.color} hover:scale-105 transition-transform duration-200`}
              >
                <pill.icon className="w-4 h-4" />
                <span className={kn ? 'font-kn' : ''}>{pill.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="section-tag">
              <FileText className="w-4 h-4" />
              {kn ? 'ಎಲ್ಲಾ ಸೇವೆಗಳು' : 'All Services'}
            </div>
            <h2 className={`section-heading ${kn ? 'font-kn' : ''}`}>{kn ? 'ನಮ್ಮ ಸೇವೆಗಳು' : 'Our Services'}</h2>
            <p className={`section-sub ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಇ-ಸ್ವತ್ತು 2.0 ಅಡಿ ಎಲ್ಲಾ ಆಸ್ತಿ ಸೇವೆಗಳಿಗೆ ಸಂಪೂರ್ಣ ಸಹಾಯ' : 'Complete assistance for all property services under e-Swathu 2.0'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceKeys.map(key => {
              const s = SERVICE_INFO[key];
              return (
                <div key={key} className="card-service group" onClick={() => onNavigate('apply', key)}>
                  {/* Header */}
                  <div className={`bg-gradient-to-br ${svcColor[key]} p-5 rounded-t-xl`}>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="text-2xl font-bold text-white">{s.feeLabel}</span>
                    </div>
                    <h3 className={`text-white font-bold text-lg mt-3 leading-tight ${kn ? 'font-kn' : ''}`}>
                      {kn ? s.labelKn : s.labelEn}
                    </h3>
                    <div className="text-white/70 text-xs mt-1">{kn ? 'ಸೇವಾ ಶುಲ್ಕ' : 'Service Charge'}</div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h4 className={`text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ${kn ? 'font-kn' : ''}`}>
                      {kn ? 'ಅಗತ್ಯ ದಾಖಲೆಗಳು' : 'Required Documents'}
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {(kn ? s.docsKn : s.docsEn).map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-gov-main shrink-0 mt-0.5" />
                          <span className={kn ? 'font-kn' : ''}>{d}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Notes */}
                    <div className="bg-gold-pale border border-gold/30 rounded-lg p-3">
                      <p className={`text-xs font-semibold text-gold-dark mb-1.5 ${kn ? 'font-kn' : ''}`}>
                        {kn ? 'ಮಹತ್ವದ ಮಾಹಿತಿ' : 'Important'}
                      </p>
                      <ul className="space-y-1">
                        {(kn ? s.notesKn : [
                          'Building? Electricity Bill Compulsory',
                          'Vacant Site? Electricity Bill Not Required',
                          'GPS Property Photo Compulsory',
                        ]).slice(0, key === 'ec_only' ? 1 : 3).map((n, i) => (
                          <li key={i} className={`text-xs text-gold-dark ${kn ? 'font-kn' : ''}`}>- {n}</li>
                        ))}
                      </ul>
                    </div>

                    <button className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gov-pale text-gov-main font-semibold text-sm rounded-lg hover:bg-gov-main hover:text-white transition-all group-hover:bg-gov-main group-hover:text-white ${kn ? 'font-kn' : ''}`}>
                      {kn ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply Now'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== APPLICATION PROCESS ===== */}
      <section id="process" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="section-tag">
              <TrendingUp className="w-4 h-4" />
              {kn ? 'ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ' : 'Application Process'}
            </div>
            <h2 className={`section-heading ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ' : 'How It Works'}
            </h2>
            <p className={`section-sub ${kn ? 'font-kn' : ''}`}>
              {kn ? '4 ಸರಳ ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಇ-ಸ್ವತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Submit your e-Swathu application in 4 simple steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {processSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {i < 3 && <div className="hidden md:block absolute top-9 left-1/2 w-full h-0.5 bg-gradient-to-r from-gov-main/40 to-gov-main/10 z-0" />}
                <div className="relative z-10 mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-gov-main to-gov-dark rounded-xl flex items-center justify-center shadow-lg mx-auto">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>
                <div className={`font-bold text-slate-800 mb-2 ${kn ? 'font-kn' : ''}`}>{kn ? step.kn : step.en}</div>
                <div className="text-xs text-slate-500 font-mono">STEP {step.num}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button onClick={() => onNavigate('apply')} className="btn-gold px-8 py-3.5 text-base">
              <FileText className="w-5 h-5" />
              <span className={kn ? 'font-kn' : ''}>{kn ? 'ಇಂದೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply Today'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-tag">
                <Award className="w-4 h-4" />
                {kn ? 'ನಮ್ಮನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು' : 'Why Choose Us'}
              </div>
              <h2 className={`section-heading ${kn ? 'font-kn' : ''}`}>
                {kn ? 'SK Digital Seva ವಿಶ್ವಾಸಾರ್ಹ ಏಕೆ?' : 'Why SK Digital Seva?'}
              </h2>
              <p className={`text-slate-500 leading-relaxed mb-8 ${kn ? 'font-kn' : ''}`}>
                {kn
                  ? 'ನಾವು ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಸ್ತಿ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ಪರಿಣತ ತಂಡ. ಪ್ರತಿ ಅರ್ಜಿಯೂ ಯಶಸ್ವಿ ಆಗಲಿ ಎಂದು ನಾವು ಬದ್ಧರಾಗಿದ್ದೇವೆ.'
                  : "We are an expert team for Karnataka Gram Panchayat property documents. We are committed to making every application successful."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyUs.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gov-pale rounded-lg p-4 border border-gov-main/10">
                    <div className="w-10 h-10 bg-gov-main rounded-lg flex items-center justify-center shrink-0">
                      <w.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`font-semibold text-slate-800 text-sm ${kn ? 'font-kn' : ''}`}>{kn ? w.kn : w.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Big stat card */}
            <div className="bg-gradient-to-br from-gov-main to-gov-dark rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="text-6xl font-bold text-white mb-2">170<span className="text-gold">+</span></div>
                <div className={`text-xl font-bold text-white/90 mb-4 ${kn ? 'font-kn' : ''}`}>
                  {kn ? 'ಯಶಸ್ವಿ ಅರ್ಜಿಗಳು' : 'Successful Applications'}
                </div>
                <p className={`text-white/80 text-sm leading-relaxed mb-6 ${kn ? 'font-kn' : ''}`}>
                  {kn
                    ? 'ಕರ್ನಾಟಕಾದ್ಯಂತ ನಮ್ಮ ಗ್ರಾಹಕರ ಇ-ಸ್ವತ್ತು ಅರ್ಜಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಿ ಮಂಜೂರ್ ಮಾಡಿಸಿದ್ದೇವೆ.'
                    : "We have successfully processed e-Swathu applications for our customers across Karnataka."}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: '99%', l: kn ? 'ಯಶಸ್ಸಿನ ದರ' : 'Success Rate' },
                    { v: '6', l: kn ? 'ಸೇವೆ ವಿಧಗಳು' : 'Service Types' },
                    { v: '7', l: kn ? 'ದಿನಗಳಲ್ಲಿ' : 'Days Avg' },
                    { v: '24/7', l: 'WhatsApp' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
                      <div className="text-2xl font-bold text-white">{s.v}</div>
                      <div className={`text-white/70 text-xs mt-0.5 ${kn ? 'font-kn' : ''}`}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <a href={`${WA}?text=${encodeURIComponent('Hello SK Digital Seva, I need help.')}`} target="_blank" rel="noopener noreferrer"
                  className="mt-5 btn-whatsapp w-full justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span className={kn ? 'font-kn' : ''}>{kn ? 'WhatsApp ಮಾಡಿ' : 'Chat on WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section id="reviews" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="section-tag">
              <Star className="w-4 h-4" />
              {kn ? 'ಗ್ರಾಹಕ ಅಭಿಪ್ರಾಯ' : 'Testimonials'}
            </div>
            <h2 className={`section-heading ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ನಮ್ಮ ಗ್ರಾಹಕರು ಏನು ಹೇಳುತ್ತಾರೆ' : "What Our Customers Say"}
            </h2>
            <p className={`section-sub ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಕರ್ನಾಟಕದ ವಿವಿಧ ಜಿಲ್ಲೆಗಳ ಸಂತುಷ್ಟ ಗ್ರಾಹಕರು' : 'Happy customers from various districts of Karnataka'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(r => (
              <div key={r.id} className="card p-6">
                <StarRow n={r.rating} />
                <p className={`text-slate-600 text-sm leading-relaxed my-4 ${r.review_text.match(/[\u0C00-\u0C7F]/) ? 'font-kn' : ''}`}>
                  "{r.review_text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gov-main to-gov-dark rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {r.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{r.full_name}</div>
                    {r.location && <div className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="section-tag">
              <MessageSquare className="w-4 h-4" />
              {kn ? 'ಸಂಪರ್ಕ' : 'Contact'}
            </div>
            <h2 className={`section-heading ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಸಂಪರ್ಕಿಸಿ' : 'Get In Touch'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Info */}
            <div className="space-y-5">
              <h3 className={`text-xl font-bold text-slate-900 ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ಸಂಪರ್ಕ ವಿವರ' : 'Contact Details'}
              </h3>
              {[
                { icon: Phone, label: kn ? 'ಫೋನ್' : 'Phone', val: '6360248020', href: 'tel:6360248020' },
                { icon: Mail, label: kn ? 'ಇಮೇಲ್' : 'Email', val: 'info@skdigitalseva.in', href: 'mailto:info@skdigitalseva.in' },
                { icon: Globe, label: 'Website', val: 'www.skdigitalseva.in', href: '#' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gov-pale rounded-lg flex items-center justify-center shrink-0 border border-gov-main/10">
                    <c.icon className="w-5 h-5 text-gov-main" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-0.5">{c.label}</div>
                    <a href={c.href} className="font-semibold text-slate-800 hover:text-gov-main transition-colors">{c.val}</a>
                  </div>
                </div>
              ))}

              {/* Working hours */}
              <div className="bg-gov-pale rounded-lg p-5 border border-gov-main/10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gov-main" />
                  <span className={`font-bold text-gov-dark ${kn ? 'font-kn' : ''}`}>{kn ? 'ಕಾರ್ಯ ಸಮಯ' : 'Working Hours'}</span>
                </div>
                <div className={`text-sm text-slate-700 space-y-1 ${kn ? 'font-kn' : ''}`}>
                  <div className="flex justify-between"><span>{kn ? 'ಸೋಮ - ಶನಿ' : 'Monday - Saturday'}</span><span className="font-semibold text-gov-main">9:00 AM - 6:00 PM</span></div>
                  <div className="flex justify-between"><span>{kn ? 'ಭಾನು' : 'Sunday'}</span><span className="font-semibold text-red-500">{kn ? 'ರಜೆ' : 'Closed'}</span></div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a href={`${WA}?text=${encodeURIComponent('Hello SK Digital Seva, I need assistance.')}`} target="_blank" rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center text-base py-4">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                <span className={kn ? 'font-kn' : ''}>{kn ? 'WhatsApp ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ' : 'Chat on WhatsApp'}</span>
              </a>
            </div>

            {/* Enquiry form */}
            <div className="card p-7">
              <h3 className={`text-xl font-bold text-slate-900 mb-5 ${kn ? 'font-kn' : ''}`}>
                {kn ? 'ತ್ವರಿತ ವಿಚಾರಣೆ' : 'Quick Enquiry'}
              </h3>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle className="w-14 h-14 text-gov-main mb-4" />
                  <p className={`text-gov-dark font-bold text-lg ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'ನಿಮ್ಮ ವಿಚಾರಣೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ನಾವು ಶೀಘ್ರದಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.' : 'Enquiry received! We will contact you shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`label ${kn ? 'font-kn' : ''}`}>{kn ? 'ಪೂರ್ಣ ಹೆಸರು' : 'Full Name'} *</label>
                      <input type="text" required className="input-field" value={enquiry.full_name} onChange={e => setEnquiry({ ...enquiry, full_name: e.target.value })} />
                    </div>
                    <div>
                      <label className={`label ${kn ? 'font-kn' : ''}`}>{kn ? 'ಮೊಬೈಲ್' : 'Mobile'} *</label>
                      <input type="tel" required className="input-field" value={enquiry.phone} onChange={e => setEnquiry({ ...enquiry, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className={`label ${kn ? 'font-kn' : ''}`}>{kn ? 'ಇಮೇಲ್' : 'Email'}</label>
                    <input type="email" className="input-field" value={enquiry.email} onChange={e => setEnquiry({ ...enquiry, email: e.target.value })} />
                  </div>
                  <div>
                    <label className={`label ${kn ? 'font-kn' : ''}`}>{kn ? 'ಸೇವೆ ಆಯ್ಕೆ' : 'Service Type'}</label>
                    <select className="select-field" value={enquiry.service_type} onChange={e => setEnquiry({ ...enquiry, service_type: e.target.value })}>
                      <option value="">{kn ? 'ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ' : 'Select Service'}</option>
                      {serviceKeys.map(k => <option key={k} value={k}>{SERVICE_INFO[k][kn ? 'labelKn' : 'labelEn']}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`label ${kn ? 'font-kn' : ''}`}>{kn ? 'ಸಂದೇಶ' : 'Message'} *</label>
                    <textarea rows={3} required className="input-field resize-none" value={enquiry.message} onChange={e => setEnquiry({ ...enquiry, message: e.target.value })} />
                  </div>
                  {formErr && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />{formErr}
                    </div>
                  )}
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    <Send className="w-4 h-4" />
                    <span className={kn ? 'font-kn' : ''}>{submitting ? (kn ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Sending...') : (kn ? 'ಸಲ್ಲಿಸಿ' : 'Submit')}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
