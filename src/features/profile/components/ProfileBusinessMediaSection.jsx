import { ImagePlus, Images, Monitor, Trash2 } from 'lucide-react';

export const ProfileBusinessMediaSection = ({
  onImageCrop,
  onImageRemove,
  onImageUpload,
  onOpenStyleRoom,
  onRemoveVenuePhoto,
  onVenuePhotoUpload,
  settings,
  venuePhotos
}) => (
  <>
    <div>
      <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-4 block text-black">Brand Logo</label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
        <div className="w-28 h-28 bg-transparent border-0 flex items-center justify-center overflow-visible shrink-0">
          {settings.logo ? <img src={settings.logo} className="w-full h-full object-contain" /> : <div className="font-bold text-4xl text-neutral-300">{settings.brandName?.charAt(0) || 'B'}</div>}
        </div>
        <div>
          <label className="inline-flex px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-neutral-800 transition-colors mb-3">
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files[0];
              onImageUpload('logo', file, 'brand');
              event.target.value = '';
            }} />
          </label>
          <p className="text-xs text-neutral-400 font-medium">Recommended: 400x400px (JPG/PNG)</p>
          {settings.logo && <button type="button" onClick={() => onImageRemove('logo')} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline mt-2">Remove Image</button>}
        </div>
      </div>
    </div>

    <div className="pt-6 border-t border-neutral-50">
      <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-4 block text-black">Booking Page Banner</label>
      <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-4 md:p-5">
        <div className="w-full aspect-[16/7] rounded-lg bg-white border border-neutral-100 flex items-center justify-center overflow-hidden shadow-inner mb-5">
          {settings.bannerImage ? <img src={settings.bannerImage} className="w-full h-full object-cover" /> : (
            <div className="text-center px-4">
              <Monitor size={24} className="mx-auto text-neutral-300" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 mt-2">Optional landscape banner</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-black">Shown above the booking page heading</p>
            <p className="text-xs text-neutral-400 font-medium">Recommended: wide landscape image (JPG/PNG)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex px-5 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-neutral-800 transition-colors">
              Upload Banner
              <input type="file" accept="image/*" className="hidden" onChange={(event) => {
                const file = event.target.files[0];
                onImageUpload('bannerImage', file, 'brand');
                event.target.value = '';
              }} />
            </label>
            {settings.bannerImage && <button type="button" onClick={() => onImageRemove('bannerImage')} className="px-5 py-3 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Remove</button>}
          </div>
        </div>
      </div>
    </div>

    <div className="pt-6 border-t border-neutral-50">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 block text-black">Business Page Images</label>
          <p className="text-xs text-neutral-400 font-medium mt-2 max-w-xl">The banner handles top and side hero media, while the footer image gives editorial layouts a polished closing visual.</p>
        </div>
        <button type="button" onClick={onOpenStyleRoom} className="h-12 px-5 rounded-full bg-white border border-neutral-200 text-black text-[10px] font-bold uppercase tracking-widest hover:border-black transition-colors shrink-0">
          Open Style Room
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[{
          key: 'businessFooterImage',
          title: 'Business Footer Image',
          note: 'Closing visual for footer, venue, and editorial layouts.',
          value: settings.businessFooterImage,
          empty: 'Footer image'
        }].map((imageSlot) => (
          <div key={imageSlot.key} className="rounded-lg bg-neutral-50 border border-neutral-100 p-4 md:p-5">
            <div className="w-full aspect-[16/9] rounded-lg bg-white border border-neutral-100 flex items-center justify-center overflow-hidden shadow-inner mb-4">
              {imageSlot.value ? <img src={imageSlot.value} className="w-full h-full object-cover" /> : (
                <div className="text-center px-4">
                  <Images size={24} className="mx-auto text-neutral-300" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 mt-2">{imageSlot.empty}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-bold text-black">{imageSlot.title}</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">{imageSlot.note}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex px-5 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-neutral-800 transition-colors">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => {
                    const file = event.target.files[0];
                    onImageUpload(imageSlot.key, file, 'brand');
                    event.target.value = '';
                  }} />
                </label>
                {imageSlot.value && (
                  <>
                    <button type="button" onClick={() => onImageCrop(imageSlot.key, 'brand')} className="px-5 py-3 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-black uppercase tracking-widest hover:border-black transition-colors">Crop</button>
                    <button type="button" onClick={() => onImageRemove(imageSlot.key)} className="px-5 py-3 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Remove</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="pt-6 border-t border-neutral-50">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 block text-black">Venue Gallery</label>
          <p className="text-xs text-neutral-400 font-medium mt-2 max-w-xl">Show clients the space after they submit their request, just before social links and map details.</p>
        </div>
        <label className="inline-flex h-12 px-5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-neutral-800 transition-colors items-center justify-center gap-2 shrink-0">
          <ImagePlus size={14} /> Upload Venue Photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              onVenuePhotoUpload(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      {venuePhotos.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {venuePhotos.map((photo, index) => (
            <div key={`${photo}-${index}`} className={`${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''} group relative overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 aspect-[4/3] shadow-inner`}>
              <img src={photo} alt={`Venue photo ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-black shadow-sm">Photo {index + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveVenuePhoto(photo)}
                  className="w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove venue photo ${index + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-6 flex flex-col sm:flex-row sm:items-center gap-4 text-neutral-400">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-black shrink-0">
            <Images size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-black">No venue photos yet</p>
            <p className="text-xs font-medium mt-1">Upload a few polished photos of the venue, studio, workspace, or service environment.</p>
          </div>
        </div>
      )}
    </div>
  </>
);
