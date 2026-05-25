import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Camera, Check, Clock, DollarSign, Image, Plus, Search, Sparkles, Trash2, UserPlus, X } from 'lucide-react';
import { getServiceIndustryOptions, getServiceTemplateGroup, resolveServiceIndustryId } from '../data/serviceTemplates';
import { createServiceFromTemplate, formatServiceDuration, formatServicePrice, normalizeService, normalizeServiceList } from '../utils/services';

const blankService = () => normalizeService({
  name: '',
  category: '',
  description: '',
  price: '',
  currency: 'R',
  priceType: 'fixed',
  duration: '',
  staffIds: [],
  imageUrls: [],
  active: true
});

const priceTypes = [
  { id: 'fixed', label: 'Fixed' },
  { id: 'from', label: 'From' },
  { id: 'hourly', label: 'Hourly' },
  { id: 'quote', label: 'Quote' }
];

export const ServicesStudio = ({
  settings,
  staffList = [],
  currentIndustry = '',
  onChooseIndustry,
  onUpdateSettings,
  canManageWorkspace = true,
  showToast
}) => {
  const services = useMemo(() => normalizeServiceList(settings?.services || []), [settings?.services]);
  const industryOptions = useMemo(() => getServiceIndustryOptions(), []);
  const [selectedIndustry, setSelectedIndustry] = useState(resolveServiceIndustryId(settings?.serviceIndustry || currentIndustry || 'hair'));
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(blankService);
  const [galleryInput, setGalleryInput] = useState('');

  const templateGroup = useMemo(() => getServiceTemplateGroup(selectedIndustry), [selectedIndustry]);
  const selectedService = services.find(service => service.id === selectedId) || (!selectedId ? services[0] : null);
  const staffOptions = staffList.length ? staffList : [{ id: 'owner', name: 'Owner', color: '#755CFF' }];
  const visibleServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return services;
    return services.filter(service => (
      [service.name, service.category, service.description, service.priceType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    ));
  }, [query, services]);

  useEffect(() => {
    const nextIndustry = settings?.serviceIndustry || currentIndustry;
    const resolvedIndustry = resolveServiceIndustryId(nextIndustry);
    if (resolvedIndustry && resolvedIndustry !== selectedIndustry) {
      setSelectedIndustry(resolvedIndustry);
    }
  }, [currentIndustry, selectedIndustry, settings?.serviceIndustry]);

  useEffect(() => {
    if (!selectedService) return;
    setSelectedId(selectedService.id);
    setDraft(normalizeService(selectedService));
  }, [selectedService?.id]);

  const saveSettings = async (nextServices, message = 'Services saved.') => {
    const nextSettings = {
      ...settings,
      serviceIndustry: selectedIndustry,
      services: normalizeServiceList(nextServices)
    };
    await onUpdateSettings?.(nextSettings, message);
  };

  const chooseIndustry = async (industryId) => {
    setSelectedIndustry(industryId);
    onChooseIndustry?.(industryId);
    await onUpdateSettings?.({ ...settings, serviceIndustry: industryId }, 'Service templates tuned to this industry.');
  };

  const addTemplate = async (template) => {
    const nextService = createServiceFromTemplate(template, {
      staffIds: staffOptions.length === 1 ? [staffOptions[0].id] : []
    });
    const nextServices = [nextService, ...services];
    setSelectedId(nextService.id);
    setDraft(nextService);
    await saveSettings(nextServices, `${nextService.name} added.`);
  };

  const addBlankService = () => {
    const nextService = blankService();
    nextService.id = `service-${Date.now()}`;
    nextService.name = 'New Service';
    nextService.category = templateGroup.title;
    setSelectedId(nextService.id);
    setDraft(nextService);
  };

  const saveDraft = async () => {
    const cleaned = normalizeService(draft);
    if (!cleaned.name.trim()) {
      showToast?.('Give this service a name first.');
      return;
    }
    const exists = services.some(service => service.id === cleaned.id);
    const nextServices = exists
      ? services.map(service => service.id === cleaned.id ? cleaned : service)
      : [cleaned, ...services];
    setSelectedId(cleaned.id);
    await saveSettings(nextServices, `${cleaned.name} saved.`);
  };

  const removeDraft = async () => {
    if (!draft?.id) return;
    const nextServices = services.filter(service => service.id !== draft.id);
    setSelectedId(nextServices[0]?.id || '');
    setDraft(nextServices[0] ? normalizeService(nextServices[0]) : blankService());
    await saveSettings(nextServices, 'Service removed.');
  };

  const updateDraft = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const toggleStaff = (staffId) => {
    setDraft(prev => {
      const current = Array.isArray(prev.staffIds) ? prev.staffIds : [];
      return {
        ...prev,
        staffIds: current.includes(staffId)
          ? current.filter(id => id !== staffId)
          : [...current, staffId]
      };
    });
  };

  const addGalleryUrl = () => {
    const url = galleryInput.trim();
    if (!url) return;
    setDraft(prev => ({ ...prev, imageUrls: [...(prev.imageUrls || []), url] }));
    setGalleryInput('');
  };

  const handleGalleryUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft(prev => ({ ...prev, imageUrls: [...(prev.imageUrls || []), String(reader.result || '')] }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeGalleryImage = (index) => {
    setDraft(prev => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  return (
    <div className="space-y-5">
      <header className="dashboard-page-header mb-4 md:mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-4xl font-bold tracking-tight text-black">My Services</h2>
          <p className="text-neutral-500 text-sm md:text-base mt-2 max-w-2xl">
            Build the menu clients book from. Add prices, durations, galleries, packages, and the staff who can deliver each service.
          </p>
        </div>
        <button
          type="button"
          onClick={addBlankService}
          className="h-11 md:h-12 px-5 md:px-6 rounded-lg bg-black text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:bg-neutral-800 transition-colors"
        >
          <Plus size={15} /> Add Service
        </button>
      </header>

      <section className="rounded-lg border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-neutral-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Industry Templates</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black mt-1">{templateGroup.title}</h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-2xl">{templateGroup.tone}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center shrink-0">
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 md:px-4 py-2.5">
              <p className="text-xl md:text-2xl font-bold text-black">{services.length}</p>
              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-neutral-400">Services</p>
            </div>
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 md:px-4 py-2.5">
              <p className="text-xl md:text-2xl font-bold text-black">{services.filter(service => service.active).length}</p>
              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-neutral-400">Live</p>
            </div>
            <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 md:px-4 py-2.5">
              <p className="text-xl md:text-2xl font-bold text-black">{staffOptions.length}</p>
              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-neutral-400">Staff</p>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {industryOptions.map(industry => {
              const active = selectedIndustry === industry.id;
              return (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => chooseIndustry(industry.id)}
                  className={`shrink-0 min-w-[9.5rem] rounded-xl border px-4 py-3 text-left transition-all ${active ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-black border-neutral-200 hover:border-neutral-300'}`}
                >
                  <span className="block text-sm font-bold leading-tight">{industry.name}</span>
                  <span className={`block text-[9px] font-bold uppercase tracking-[0.12em] mt-1 truncate ${active ? 'text-white/55' : 'text-neutral-400'}`}>{industry.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">Tap to add a starter</p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-black">{templateGroup.title} menu starters</h3>
            </div>
            <p className="text-xs md:text-sm text-neutral-500 max-w-xl">
              These are realistic starting points for this industry. Add one, then adjust price, duration, gallery, and staff.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {templateGroup.templates.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => addTemplate(template)}
                className="group text-left rounded-2xl border border-neutral-200 bg-white p-4 hover:border-black hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <Sparkles size={17} />
                  </div>
                  <span className="rounded-full bg-neutral-50 border border-neutral-100 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    {template.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-black">{template.name}</h3>
                <p className="text-xs text-neutral-500 mt-2 min-h-[2.5rem] line-clamp-2">{template.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formatServiceDuration(template.duration) && <span className="rounded-full bg-neutral-100 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500">{formatServiceDuration(template.duration)}</span>}
                  {formatServicePrice(template) && <span className="rounded-full bg-neutral-100 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500">{formatServicePrice(template)}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(0,1fr),430px] gap-5">
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">Service Desk</p>
              <h2 className="text-2xl font-black text-black">Your menu</h2>
            </div>
            <label className="h-11 rounded-full bg-neutral-50 border border-neutral-200 px-4 flex items-center gap-2">
              <Search size={16} className="text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services"
                className="bg-transparent outline-none text-sm font-bold text-black placeholder:text-neutral-400"
              />
            </label>
          </div>
          <div className="divide-y divide-neutral-100">
            {visibleServices.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 inline-flex items-center justify-center mb-4">
                  <Briefcase size={22} />
                </div>
                <h3 className="text-xl font-black text-black">No services yet</h3>
                <p className="text-sm text-neutral-500 mt-2">Pick an industry template or add your own service to start the booking menu.</p>
              </div>
            ) : visibleServices.map(service => {
              const selected = service.id === draft.id;
              const assignedStaff = staffOptions.filter(staff => service.staffIds.includes(staff.id));
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(service.id);
                    setDraft(normalizeService(service));
                  }}
                  className={`w-full text-left p-4 lg:p-5 transition-colors ${selected ? 'bg-neutral-950 text-white' : 'bg-white text-black hover:bg-neutral-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border ${selected ? 'border-white/10 bg-white/10' : 'border-neutral-100 bg-neutral-50'}`}>
                      {service.imageUrls?.[0] ? (
                        <img src={service.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-lg truncate">{service.name}</h3>
                        {!service.active && <span className="rounded-full bg-neutral-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-neutral-500">Hidden</span>}
                      </div>
                      <p className={`text-sm mt-1 line-clamp-2 ${selected ? 'text-white/60' : 'text-neutral-500'}`}>{service.description || 'No description yet.'}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {service.category && <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${selected ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'}`}>{service.category}</span>}
                        {formatServiceDuration(service.duration) && <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${selected ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'}`}>{formatServiceDuration(service.duration)}</span>}
                        {formatServicePrice(service) && <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${selected ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'}`}>{formatServicePrice(service)}</span>}
                        {assignedStaff.length > 0 && <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${selected ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'}`}>{assignedStaff.length} staff</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden xl:sticky xl:top-6 self-start">
          <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">Service File</p>
              <h2 className="text-2xl font-black text-black">{draft.name || 'New service'}</h2>
              <p className="text-sm text-neutral-500 mt-1">This is what clients will see and what bookings carry into your calendar.</p>
            </div>
            <button
              type="button"
              onClick={() => updateDraft('active', !draft.active)}
              className={`h-10 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.16em] ${draft.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}
            >
              {draft.active ? 'Live' : 'Hidden'}
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="service-field sm:col-span-2">
                <span>Name</span>
                <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Service name" />
              </label>
              <label className="service-field">
                <span>Category</span>
                <input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} placeholder="Cut, class, consult..." />
              </label>
              <label className="service-field">
                <span>Duration</span>
                <input value={draft.duration} onChange={(event) => updateDraft('duration', event.target.value)} placeholder="60 or 1 hour" />
              </label>
            </div>

            <label className="service-field">
              <span>Description</span>
              <textarea value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} placeholder="What is included, who it is for, and anything clients should know." rows={4} />
            </label>

            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Pricing</p>
                  <p className="text-sm text-neutral-500">Fixed, hourly, from-price, or quote-based.</p>
                </div>
                <DollarSign size={18} />
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {priceTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateDraft('priceType', type.id)}
                    className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] ${draft.priceType === type.id ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-500 border border-neutral-100'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[78px,1fr] gap-3">
                <label className="service-field">
                  <span>Currency</span>
                  <input value={draft.currency} onChange={(event) => updateDraft('currency', event.target.value)} />
                </label>
                <label className="service-field">
                  <span>Price</span>
                  <input value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} placeholder={draft.priceType === 'quote' ? 'Optional' : '450'} />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Assigned Staff</p>
                  <p className="text-sm text-neutral-500">Choose who can be booked for this service.</p>
                </div>
                <UserPlus size={18} />
              </div>
              <div className="flex flex-wrap gap-2">
                {staffOptions.map(staff => {
                  const active = draft.staffIds?.includes(staff.id);
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => toggleStaff(staff.id)}
                      className={`rounded-full border px-3 py-2 text-xs font-black inline-flex items-center gap-2 ${active ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-200'}`}
                    >
                      <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black" style={{ background: active ? '#ffffff22' : `${staff.color || '#755CFF'}22`, color: active ? '#fff' : staff.color || '#755CFF' }}>
                        {(staff.name || 'S').charAt(0).toUpperCase()}
                      </span>
                      {staff.name || 'Staff'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Gallery</p>
                  <p className="text-sm text-neutral-500">Optional images for your service card.</p>
                </div>
                <Image size={18} />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(draft.imageUrls || []).slice(0, 6).map((url, index) => (
                  <div key={`${url}-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black text-white inline-flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center cursor-pointer">
                  <Camera size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  value={galleryInput}
                  onChange={(event) => setGalleryInput(event.target.value)}
                  placeholder="Paste image URL"
                  className="min-w-0 flex-1 h-11 rounded-xl bg-neutral-50 border border-neutral-200 px-3 text-sm font-bold outline-none"
                />
                <button type="button" onClick={addGalleryUrl} className="h-11 px-4 rounded-xl bg-neutral-900 text-white text-xs font-black uppercase tracking-[0.14em]">Add</button>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Booking Preview</p>
              <div className="rounded-2xl bg-white border border-neutral-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black text-white inline-flex items-center justify-center">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-black">{draft.name || 'Service name'}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{draft.description || 'Client-facing description will show here.'}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formatServiceDuration(draft.duration) && <span className="rounded-full bg-neutral-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-neutral-500 inline-flex items-center gap-1"><Clock size={11} />{formatServiceDuration(draft.duration)}</span>}
                      {formatServicePrice(draft) && <span className="rounded-full bg-neutral-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-neutral-500">{formatServicePrice(draft)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr,1fr] gap-3">
              <button
                type="button"
                onClick={removeDraft}
                disabled={!draft.id || !services.some(service => service.id === draft.id) || !canManageWorkspace}
                className="h-12 rounded-full border border-red-100 bg-red-50 text-red-600 text-xs font-black uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Trash2 size={15} /> Remove
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={!canManageWorkspace}
                className="h-12 rounded-full bg-black text-white text-xs font-black uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Check size={15} /> Save Service
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
