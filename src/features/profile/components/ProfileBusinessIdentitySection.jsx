import { Building2, ImagePlus, MapPin, Trash2 } from 'lucide-react';

export const ProfileBusinessIdentitySection = ({
  onImageRemove,
  onImageUpload,
  onSettingChange,
  settings
}) => (
  <section className="rounded-lg bg-neutral-50/80 p-4 sm:p-5 md:p-6">
    <div className="mb-5 flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase text-neutral-400">Business identity</p>
      <h4 className="text-xl font-black text-black">Name, place, and logo</h4>
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem]">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="group flex min-h-[4.75rem] items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] focus-within:shadow-[inset_0_0_0_1px_rgba(15,23,42,0.2)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black">
            <Building2 size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-1 block text-[9px] font-black uppercase text-neutral-400">Business name</span>
            <input
              type="text"
              value={settings.brandName || ''}
              onChange={event => onSettingChange('brandName', event.target.value)}
              className="w-full bg-transparent text-sm font-black text-black outline-none placeholder:text-neutral-300"
              placeholder="Your Business"
            />
          </span>
        </label>

        <label className="group flex min-h-[4.75rem] items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] focus-within:shadow-[inset_0_0_0_1px_rgba(15,23,42,0.2)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black">
            <MapPin size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-1 block text-[9px] font-black uppercase text-neutral-400">Address / location</span>
            <input
              type="text"
              value={settings.address || ''}
              onChange={event => onSettingChange('address', event.target.value)}
              className="w-full bg-transparent text-sm font-bold text-black outline-none placeholder:text-neutral-300"
              placeholder="123 Main St, City"
            />
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] lg:flex-col lg:items-stretch">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-100 text-2xl font-black text-neutral-300 lg:mx-auto">
          {settings.logo ? (
            <img src={settings.logo} alt="" className="h-full w-full object-contain" />
          ) : (
            settings.brandName?.charAt(0) || 'B'
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:justify-center">
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-4 text-[10px] font-black uppercase text-white transition-colors hover:bg-neutral-800">
            <ImagePlus size={13} />
            Logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files[0];
                onImageUpload('logo', file, 'brand');
                event.target.value = '';
              }}
            />
          </label>
          {settings.logo && (
            <button
              type="button"
              onClick={() => onImageRemove('logo')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.22)]"
              aria-label="Remove logo"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  </section>
);
