import React from 'react';
import { Star, ShieldCheck, ThumbsUp, HeartHandshake, PhoneCall } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Sunita Mehra',
      location: 'Indiranagar, Bengaluru',
      role: 'Homeowner',
      service: 'AC Jet Cleaning',
      rating: 5,
      comment:
        'Found Mohammad Imran through NearMe Services within 5 minutes. He was at our house in 30 minutes with high pressure jet equipment. Fair rate, no hidden charges!',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Vikramaditya Roy',
      location: 'Connaught Place, New Delhi',
      role: 'Architect',
      service: 'Emergency Electrician',
      rating: 5,
      comment:
        'Late evening power short circuit had tripped our entire studio. Ramesh answered the phone immediately and fixed the scorched wire cleanly. Life saver!',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Dr. Neha Kulkarni',
      location: 'Kothrud, Pune',
      role: 'Clinic Director',
      service: 'Deep Cleaning & Sanitization',
      rating: 5,
      comment:
        'The ability to view distance, real-time availability, and verified mobile numbers makes this platform 100x better than old directories. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-900 text-white rounded-3xl my-10 px-6 sm:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Trust Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10 text-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h4 className="font-black text-lg text-white">100% Verified</h4>
          <p className="text-xs text-slate-400 mt-0.5">Government ID & Police Verified</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3">
            <PhoneCall className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h4 className="font-black text-lg text-white">Direct Phone Contact</h4>
          <p className="text-xs text-slate-400 mt-0.5">No Middlemen or Hidden Commissions</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
            <ThumbsUp className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h4 className="font-black text-lg text-white">Real-Time Status</h4>
          <p className="text-xs text-slate-400 mt-0.5">See Who Is Available Right Now</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
            <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h4 className="font-black text-lg text-white">Free Quotes</h4>
          <p className="text-xs text-slate-400 mt-0.5">Post Service Needs Proactively</p>
        </div>
      </div>

      <div className="mt-12 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Customer Satisfaction</span>
        <h3 className="text-2xl sm:text-3xl font-black mt-1">Trusted by 25,000+ Neighborhoods</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
              <img src={rev.image} alt={rev.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500" />
              <div>
                <p className="text-xs font-bold text-white">{rev.name}</p>
                <p className="text-[10px] text-slate-400">{rev.location} • {rev.service}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
