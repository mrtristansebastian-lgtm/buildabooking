import { getFontFamily } from '../../../data/fonts';

export const BookingDetailsForm = ({
    collectClientEmail,
    collectClientName,
    collectClientNotes,
    collectClientPhone,
    detailsStepNumber,
    formData,
    headingLetterSpacing,
    inspectClass,
    isPreview,
    isWaitlistMode,
    onInspect,
    onSettingChange,
    pageItems,
    pageTextClass,
    previewInspectEnabled,
    sectionOrder,
    setFormData,
    settings,
    showServiceStep
}) => (
    <section className="pt-10" style={{ order: sectionOrder ?? (showServiceStep ? 5 : 4) }}>
        <div className={`flex flex-col ${pageItems} ${pageTextClass} mb-8 px-1 ${inspectClass}`} data-preview-section="form" onClick={() => previewInspectEnabled && onInspect('form')}>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-40" style={{ color: settings.bodyColor }} contentEditable={previewInspectEnabled} suppressContentEditableWarning onBlur={(event) => isPreview && onSettingChange?.('detailsHeading', event.currentTarget.textContent.replace(/^\d+\s*\/\/\s*/i, '').trim())}>{detailsStepNumber} // {settings.detailsHeading || "Your Details"}</h3>
            <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                {isWaitlistMode ? 'Join Standby' : (settings.detailsSubHeading || "Secure Your Slot")}
            </h4>
        </div>

        <div className="space-y-10 px-1">
            {collectClientName && (
                <div className="group relative">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block group-focus-within:opacity-100 transition-opacity" style={{ color: settings.headingColor }}>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-transparent text-2xl md:text-3xl font-bold outline-none tracking-tighter transition-all pb-2" style={{ color: settings.headingColor }} />
                    <div className="w-full h-[1px] mt-2 group-focus-within:h-[2px] transition-all" style={{ backgroundColor: (settings.headingColor || '#000') + '20' }} />
                </div>
            )}
            {collectClientPhone && (
                <div className="group relative">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block group-focus-within:opacity-100 transition-opacity" style={{ color: settings.headingColor }}>Mobile Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-transparent text-2xl md:text-3xl font-bold outline-none tracking-tighter transition-all pb-2" style={{ color: settings.headingColor }} />
                    <div className="w-full h-[1px] mt-2 group-focus-within:h-[2px] transition-all" style={{ backgroundColor: (settings.headingColor || '#000') + '20' }} />
                </div>
            )}
            {collectClientEmail && (
                <div className="group relative">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block group-focus-within:opacity-100 transition-opacity" style={{ color: settings.headingColor }}>Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-transparent text-2xl md:text-3xl font-bold outline-none tracking-tighter transition-all pb-2" style={{ color: settings.headingColor }} />
                    <div className="w-full h-[1px] mt-2 group-focus-within:h-[2px] transition-all" style={{ backgroundColor: (settings.headingColor || '#000') + '20' }} />
                </div>
            )}
            {collectClientNotes && (
                <div className="group relative">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block group-focus-within:opacity-100 transition-opacity flex justify-between" style={{ color: settings.headingColor }}>Booking Note <span className="opacity-50 lowercase tracking-normal font-normal">Optional</span></label>
                    <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} rows={3} className="w-full bg-transparent text-xl md:text-2xl font-bold outline-none tracking-tight transition-all pb-2 resize-none" style={{ color: settings.headingColor }} />
                    <div className="w-full h-[1px] mt-2 group-focus-within:h-[2px] transition-all" style={{ backgroundColor: (settings.headingColor || '#000') + '20' }} />
                </div>
            )}
            {settings.features?.birthday && (
                <div className="group relative">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-3 block group-focus-within:opacity-100 transition-opacity flex justify-between" style={{ color: settings.headingColor }}>Birthday <span className="opacity-50 lowercase tracking-normal font-normal">Optional</span></label>
                    <input type="text" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} className="w-full bg-transparent text-2xl md:text-3xl font-bold outline-none tracking-tighter transition-all pb-2" style={{ color: settings.headingColor }} />
                    <div className="w-full h-[1px] mt-2 group-focus-within:h-[2px] transition-all" style={{ backgroundColor: (settings.headingColor || '#000') + '20' }} />
                </div>
            )}
        </div>
    </section>
);
