import { Check, Globe, Instagram, Share2, Users, Zap } from 'lucide-react';

export const ProfileBusinessSocialSection = ({
  onCopyReferral,
  onSaveProfile,
  onSettingChange,
  referralUrl,
  settings
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-50">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block text-black">Business Name</label>
        <input type="text" value={settings.brandName || ''} onChange={event => onSettingChange('brandName', event.target.value)} className="w-full bg-neutral-50 border border-transparent focus:border-neutral-200 rounded-lg px-6 py-4 text-sm font-bold outline-none text-black transition-all" />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block text-black">Address / Location</label>
        <input type="text" value={settings.address || ''} onChange={event => onSettingChange('address', event.target.value)} className="w-full bg-neutral-50 border border-transparent focus:border-neutral-200 rounded-lg px-6 py-4 text-sm font-bold outline-none text-black transition-all" placeholder="123 Main St, City" />
      </div>
    </div>

    <div className="pt-6 border-t border-neutral-50">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 block text-black">Social Links</label>
          <p className="text-xs text-neutral-400 font-medium mt-2">Used for your public booking page footer when enabled.</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50 border border-neutral-100 px-3 py-2 rounded-lg">Client facing</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg border border-transparent focus-within:border-neutral-200 hover:border-neutral-100 transition-all">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-black shrink-0"><Instagram size={16} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">Instagram</p>
            <input type="text" value={settings.socials?.instagram || ''} onChange={event => onSettingChange('socials', { ...settings.socials, instagram: event.target.value })} placeholder="@yourhandle" className="w-full bg-transparent text-sm font-bold outline-none placeholder-neutral-300" />
          </div>
        </div>
        <div className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg border border-transparent focus-within:border-neutral-200 hover:border-neutral-100 transition-all">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-black shrink-0"><Zap size={16} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">TikTok</p>
            <input type="text" value={settings.socials?.tiktok || ''} onChange={event => onSettingChange('socials', { ...settings.socials, tiktok: event.target.value })} placeholder="@yourtiktok" className="w-full bg-transparent text-sm font-bold outline-none placeholder-neutral-300" />
          </div>
        </div>
        <div className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg border border-transparent focus-within:border-neutral-200 hover:border-neutral-100 transition-all">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-black shrink-0"><Users size={16} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">Facebook</p>
            <input type="text" value={settings.socials?.facebook || ''} onChange={event => onSettingChange('socials', { ...settings.socials, facebook: event.target.value })} placeholder="facebook page or handle" className="w-full bg-transparent text-sm font-bold outline-none placeholder-neutral-300" />
          </div>
        </div>
        <div className="flex items-center gap-4 bg-neutral-50 p-3 rounded-lg border border-transparent focus-within:border-neutral-200 hover:border-neutral-100 transition-all">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-black shrink-0"><Globe size={16} /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-1">Website</p>
            <input type="text" value={settings.socials?.website || ''} onChange={event => onSettingChange('socials', { ...settings.socials, website: event.target.value })} placeholder="https://yourwebsite.com" className="w-full bg-transparent text-sm font-bold outline-none placeholder-neutral-300" />
          </div>
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-lg bg-black text-white border border-black shadow-[0_30px_90px_-55px_rgba(0,0,0,0.9)]">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 md:p-8">
          <div className="w-11 h-11 rounded-lg bg-[#39FF14] text-black flex items-center justify-center mb-8 shadow-xl shadow-[#39FF14]/20">
            <Share2 size={18} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/40 mb-3">Affiliate Link</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Share Build A Booking</h3>
          <p className="text-sm text-white/55 leading-relaxed max-w-xl">Your referral link sits below your social settings so it is easy to find when you recommend the platform.</p>
        </div>
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/10 p-5 md:p-8 flex flex-col justify-end gap-4">
          <div className="rounded-lg bg-white/10 border border-white/10 p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-2">Your Link</p>
            <p className="text-sm font-bold text-white truncate">{referralUrl}</p>
          </div>
          <button onClick={() => onCopyReferral(referralUrl, 'Affiliate link')} className="h-12 rounded-lg bg-[#39FF14] text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-95 transition-all">
            <Share2 size={15} /> Copy Link
          </button>
        </div>
      </div>
    </div>

    <div className="flex justify-end pt-8 border-t border-neutral-50">
      <button onClick={onSaveProfile} className="px-8 py-3 bg-[#39FF14] text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
        <Check size={14} /> Save Profile
      </button>
    </div>
  </>
);
