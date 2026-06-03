import { Check, ChevronDown, Clock } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';
import { formatServiceDuration, formatServicePrice } from '../../../utils/services';
import { getServiceCardStyle } from '../utils/bookingFlowUtils';

export const BookingServicesSection = ({
    activeServices,
    headingLetterSpacing,
    inspectClass,
    isPreview,
    nativeAccent,
    nativeAccentBorderClass,
    onInspect,
    pageItems,
    pageTextClass,
    previewInspectEnabled,
    selectedService,
    selectedServiceCategory,
    selectedServiceForDisplay,
    serviceBorderStyle,
    serviceCardsForDisplay,
    serviceCategories,
    serviceDisplayStyle,
    serviceDropdownEnabled,
    serviceDropdownOptions,
    serviceDropdownOpen,
    serviceDropdownStyle,
    setSelectedServiceCategory,
    setSelectedServiceId,
    setServicesDropdownOpen,
    settings
}) => {
    if (activeServices.length === 0 && !isPreview) return null;

    const renderServiceButton = (service, options = {}) => {
        const isPreviewPlaceholder = Boolean(service.isPreviewPlaceholder);
        const isActive = options.isActive ?? (selectedService?.id === service.id);
        const price = formatServicePrice(service);
        const duration = formatServiceDuration(service.duration);
        const hasFacts = Boolean(price || duration);
        const hasServiceImage = Boolean(service.imageUrls?.[0]);

        return (
            <button
                key={service.id}
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    if (isPreviewPlaceholder) return;
                    setSelectedServiceId(service.id);
                }}
                className={`booking-service-option appearance-none outline-none focus:outline-none text-left rounded-2xl border p-4 md:p-5 transition-all booking-service-border-${serviceBorderStyle} ${hasServiceImage ? 'has-service-image' : 'is-text-only-service'} ${isPreviewPlaceholder ? 'is-preview-empty' : ''} ${isActive ? `is-selected scale-[1.01] shadow-xl ${nativeAccentBorderClass}` : 'opacity-80 hover:opacity-100'}`}
                style={getServiceCardStyle({ isActive, settings, nativeAccent, serviceBorderStyle })}
            >
                <div className="booking-service-shell flex items-start gap-4">
                    {hasServiceImage && (
                        <div className="booking-service-image w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: isActive ? (settings.primaryColor || '#000') : `${settings.headingColor || '#000'}0D`, color: isActive ? (settings.buttonTextColor || '#000') : settings.headingColor }}>
                            <img src={service.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="booking-service-copy min-w-0 flex-1">
                        <div className="booking-service-title-line flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                {service.category && <span className="booking-service-eyebrow" style={{ color: settings.bodyColor }}>{service.category}</span>}
                                <h5 className="text-base md:text-lg font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}>{service.name}</h5>
                            </div>
                            {isActive && (
                                <span className="booking-service-selected-mark" style={{ color: settings.primaryColor, borderColor: `${settings.primaryColor || '#000'}40`, backgroundColor: `${settings.primaryColor || '#000'}0F` }}>
                                    <Check size={14} />
                                </span>
                            )}
                        </div>
                        {service.description && <p className="text-xs md:text-sm mt-2 leading-relaxed opacity-65" style={{ color: settings.bodyColor }}>{service.description}</p>}
                        {hasFacts && (
                            <div className="booking-service-facts" aria-label="Service price and duration">
                                {duration && <span className="booking-service-fact" style={{ backgroundColor: `${settings.headingColor || '#000'}08`, borderColor: `${settings.headingColor || '#000'}10`, color: settings.bodyColor }}><Clock size={12} />{duration}</span>}
                                {price && <span className="booking-service-fact is-price" style={{ backgroundColor: `${settings.primaryColor || '#000'}12`, borderColor: `${settings.primaryColor || '#000'}1F`, color: settings.headingColor }}>{price}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </button>
        );
    };

    const renderServiceGrid = () => (
        <div className={`booking-services-wrap booking-services-wrap-${serviceDisplayStyle}`} onClick={() => previewInspectEnabled && onInspect('services')}>
            {serviceCategories.length > 1 && (
                <div className="booking-service-category-rail" aria-label="Service categories">
                    {serviceCategories.map(category => {
                        const isActive = selectedServiceCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                aria-pressed={isActive}
                                className={isActive ? nativeAccentBorderClass : ''}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedServiceCategory(category);
                                }}
                                style={{
                                    color: isActive ? settings.headingColor : settings.bodyColor,
                                    borderColor: isActive ? settings.primaryColor : `${settings.headingColor || '#000'}14`,
                                    backgroundColor: isActive ? (nativeAccent ? '#fff' : `${settings.primaryColor || '#000'}12`) : `${settings.headingColor || '#000'}05`
                                }}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            )}
            <div className={`booking-services-grid booking-services-${serviceDisplayStyle} ${activeServices.length === 0 && isPreview ? 'booking-services-preview-empty' : ''} grid grid-cols-1 md:grid-cols-2 gap-3`}>
                {serviceCardsForDisplay.map((service, index) => renderServiceButton(service, { isActive: activeServices.length === 0 && index === 0 }))}
            </div>
        </div>
    );

    const renderServiceDropdownMenu = () => (
        <div className="booking-service-dropdown-menu">
            {serviceDropdownOptions.map((service, index) => {
                const isPreviewPlaceholder = Boolean(service.isPreviewPlaceholder);
                const isActive = isPreviewPlaceholder ? index === 0 : selectedService?.id === service.id;
                const price = formatServicePrice(service);
                const hasServiceImage = Boolean(service.imageUrls?.[0]);
                const hasPrice = Boolean(price);

                return (
                    <button
                        key={service.id}
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (isPreviewPlaceholder) return;
                            setSelectedServiceId(service.id);
                            setServicesDropdownOpen(false);
                        }}
                        className={`booking-service-dropdown-row ${hasServiceImage ? 'has-service-image' : 'is-text-only-service'} ${isPreviewPlaceholder ? 'is-preview-empty' : ''} ${isActive ? 'is-active' : ''}`}
                        style={{
                            color: settings.headingColor,
                            borderColor: isActive ? `${settings.headingColor || settings.primaryColor || '#000'}2B` : `${settings.headingColor || '#000'}10`,
                            backgroundColor: isActive ? `${settings.headingColor || settings.primaryColor || '#000'}04` : 'transparent',
                            fontFamily: getFontFamily(settings.bodyFontFamily || settings.fontFamily)
                        }}
                    >
                        {hasServiceImage && <span className="booking-service-dropdown-row-image"><img src={service.imageUrls[0]} alt="" /></span>}
                        <span className="booking-service-dropdown-row-copy">
                            <strong style={{ fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}>{service.name}</strong>
                        </span>
                        {hasPrice && <span className="booking-service-dropdown-row-meta" style={{ color: settings.bodyColor }}>
                            {price && <b style={{ color: settings.headingColor }}>{price}</b>}
                        </span>}
                        <span className="booking-service-dropdown-row-check" style={{ borderColor: isActive ? settings.primaryColor : `${settings.headingColor || '#000'}14`, color: isActive ? settings.primaryColor : 'transparent' }}>
                            <Check size={12} />
                        </span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <section data-preview-section="services" className="pt-2" style={{ order: 1 }}>
            <div className={`flex flex-col ${pageItems} ${pageTextClass} mb-6 px-1 ${inspectClass}`} onClick={() => previewInspectEnabled && onInspect('services')}>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-40" style={{ color: settings.bodyColor }}>01 // Choose Service</h3>
                <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                    What would you like to book?
                </h4>
            </div>
            {serviceDropdownEnabled ? (
                <div className={`booking-services-dropdown ${serviceDropdownOpen ? 'is-open' : ''}`} onClick={() => previewInspectEnabled && onInspect('services')}>
                    <button
                        type="button"
                        className={`booking-service-dropdown-trigger booking-service-dropdown-trigger-${serviceDropdownStyle} booking-service-dropdown-border-${serviceBorderStyle} ${nativeAccentBorderClass}`}
                        aria-expanded={serviceDropdownOpen}
                        onClick={(event) => {
                            event.stopPropagation();
                            setServicesDropdownOpen(open => !open);
                        }}
                        style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}
                    >
                        <span className="booking-service-dropdown-copy">
                            <strong>{selectedServiceForDisplay?.name || 'Choose a service'}</strong>
                        </span>
                        <span className="booking-service-dropdown-meta">
                            {selectedServiceForDisplay && formatServicePrice(selectedServiceForDisplay) && <span className="booking-service-dropdown-trigger-fact is-price">{formatServicePrice(selectedServiceForDisplay)}</span>}
                            <ChevronDown size={16} className="booking-service-dropdown-chevron" />
                        </span>
                    </button>
                    <div className="booking-service-dropdown-panel">
                        {renderServiceDropdownMenu()}
                    </div>
                </div>
            ) : (
                renderServiceGrid()
            )}
        </section>
    );
};
