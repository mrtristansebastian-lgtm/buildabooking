import { Check, ChevronDown, Clock, ImageIcon, Plus } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';
import { formatServiceDuration, formatServicePrice } from '../../../utils/services';
import { withColorAlpha } from '../../../utils/theme';
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

    const serviceTextColor = settings.serviceTextColor || settings.bodyColor || '#050505';
    const serviceBodyColor = settings.serviceBodyColor || settings.bodyColor;
    const serviceBgColor = settings.serviceBgColor || withColorAlpha(settings.bodyColor || '#000', 2, '#000000');
    const serviceBorderColor = settings.serviceBorderColor || withColorAlpha(settings.bodyColor || '#000', 9, '#000000');
    const serviceActiveBgColor = settings.serviceActiveBgColor || withColorAlpha(settings.primaryColor || '#000', 7, '#000000');
    const goToServicesStudio = () => {
        if (typeof window !== 'undefined') window.location.hash = '#/dashboard/services';
    };
    const renderServiceImagePlaceholder = (showAction = false) => (
        <span className={`booking-service-image-placeholder ${showAction ? 'has-add-action' : ''}`} aria-hidden={showAction ? undefined : 'true'}>
            <ImageIcon className="booking-service-image-placeholder-icon" size={22} />
            {showAction && (
                <span className="booking-service-image-placeholder-action">
                    <Plus size={13} />
                    <span>Add services</span>
                </span>
            )}
        </span>
    );

    const renderServiceButton = (service, options = {}) => {
        const isPreviewPlaceholder = Boolean(service.isPreviewPlaceholder);
        const isActive = options.isActive ?? (selectedService?.id === service.id);
        const price = formatServicePrice(service);
        const duration = formatServiceDuration(service.duration);
        const hasFacts = Boolean(price || duration);
        const hasServiceImage = Boolean(service.imageUrls?.[0]);
        const showServiceImageSlot = hasServiceImage || isPreview;

        return (
            <button
                key={service.id}
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    if (isPreviewPlaceholder) {
                        goToServicesStudio();
                        return;
                    }
                    setSelectedServiceId(service.id);
                }}
                className={`booking-service-option appearance-none outline-none focus:outline-none text-left rounded-2xl border p-4 md:p-5 transition-all booking-service-border-${serviceBorderStyle} ${showServiceImageSlot ? 'has-service-image' : 'is-text-only-service'} ${!hasServiceImage && isPreview ? 'has-placeholder-image' : ''} ${isPreviewPlaceholder ? 'is-preview-empty' : ''} ${isActive ? `is-selected scale-[1.01] shadow-xl ${nativeAccentBorderClass}` : 'opacity-80 hover:opacity-100'}`}
                style={getServiceCardStyle({ isActive, settings, nativeAccent, serviceBorderStyle })}
            >
                <div className="booking-service-shell flex items-start gap-4">
                    {showServiceImageSlot && (
                        <div className="booking-service-image w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: isActive ? (settings.primaryColor || '#000') : serviceBgColor, color: isActive ? (settings.buttonTextColor || '#000') : serviceTextColor }}>
                            {hasServiceImage ? (
                                <img src={service.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                renderServiceImagePlaceholder(isPreviewPlaceholder)
                            )}
                        </div>
                    )}
                    <div className="booking-service-copy min-w-0 flex-1">
                        <div className="booking-service-title-line flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                {service.category && <span className="booking-service-eyebrow" style={{ color: serviceBodyColor }}>{service.category}</span>}
                                <h5 className="text-base md:text-lg font-bold tracking-tight" style={{ color: serviceTextColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}>{service.name}</h5>
                            </div>
                            {isActive && (
                                <span className="booking-service-selected-mark" style={{ color: settings.primaryColor, borderColor: `${settings.primaryColor || '#000'}40`, backgroundColor: `${settings.primaryColor || '#000'}0F` }}>
                                    <Check size={14} />
                                </span>
                            )}
                        </div>
                        {service.description && <p className="text-xs md:text-sm mt-2 leading-relaxed opacity-65" style={{ color: serviceBodyColor }}>{service.description}</p>}
                        {hasFacts && (
                            <div className="booking-service-facts" aria-label="Service price and duration">
                                {duration && <span className="booking-service-fact" style={{ backgroundColor: serviceBgColor, borderColor: serviceBorderColor, color: serviceBodyColor }}><Clock size={12} />{duration}</span>}
                                {price && <span className="booking-service-fact is-price" style={{ backgroundColor: serviceActiveBgColor, borderColor: withColorAlpha(settings.primaryColor || '#000', 12, '#000000'), color: serviceTextColor }}>{price}</span>}
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
                                    color: isActive ? serviceTextColor : settings.bodyColor,
                                    borderColor: isActive ? settings.primaryColor : serviceBorderColor,
                                    backgroundColor: isActive ? serviceActiveBgColor : serviceBgColor
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
                const showServiceImageSlot = hasServiceImage || isPreview;
                const hasPrice = Boolean(price);

                return (
                    <button
                        key={service.id}
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (isPreviewPlaceholder) {
                                goToServicesStudio();
                                return;
                            }
                            setSelectedServiceId(service.id);
                            setServicesDropdownOpen(false);
                        }}
                        className={`booking-service-dropdown-row ${showServiceImageSlot ? 'has-service-image' : 'is-text-only-service'} ${!hasServiceImage && isPreview ? 'has-placeholder-image' : ''} ${isPreviewPlaceholder ? 'is-preview-empty' : ''} ${isActive ? 'is-active' : ''}`}
                        style={{
                            color: serviceTextColor,
                            borderColor: isActive ? settings.primaryColor || serviceBorderColor : serviceBorderColor,
                            backgroundColor: isActive ? serviceActiveBgColor : 'transparent',
                            fontFamily: getFontFamily(settings.bodyFontFamily || settings.fontFamily)
                        }}
                    >
                        {showServiceImageSlot && (
                            <span className="booking-service-dropdown-row-image">
                                {hasServiceImage ? <img src={service.imageUrls[0]} alt="" /> : renderServiceImagePlaceholder(isPreviewPlaceholder)}
                            </span>
                        )}
                        <span className="booking-service-dropdown-row-copy">
                            <strong style={{ fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}>{service.name}</strong>
                        </span>
                        {hasPrice && <span className="booking-service-dropdown-row-meta" style={{ color: serviceBodyColor }}>
                            {price && <b style={{ color: serviceTextColor }}>{price}</b>}
                        </span>}
                        <span className="booking-service-dropdown-row-check" style={{ borderColor: isActive ? settings.primaryColor : withColorAlpha(settings.bodyColor || '#000', 8, '#000000'), color: isActive ? settings.primaryColor : 'transparent' }}>
                            <Check size={12} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
    const renderServiceSpotlight = () => {
        if (!selectedServiceForDisplay) return null;
        const price = formatServicePrice(selectedServiceForDisplay);
        const duration = formatServiceDuration(selectedServiceForDisplay.duration);
        const hasServiceImage = Boolean(selectedServiceForDisplay.imageUrls?.[0]);
        const showServiceImageSlot = hasServiceImage || isPreview;
        const hasDetails = Boolean(duration || price || selectedServiceForDisplay.category);

        return (
            <article
                className={`booking-service-spotlight ${showServiceImageSlot ? 'has-service-image' : 'is-text-only-service'} ${!hasServiceImage && isPreview ? 'has-placeholder-image' : ''}`}
                style={{
                    borderColor: serviceBorderColor,
                    backgroundColor: settings.pageSurfaceColor || '#ffffff',
                    color: serviceTextColor,
                    fontFamily: getFontFamily(settings.bodyFontFamily || settings.fontFamily)
                }}
            >
                {showServiceImageSlot && (
                    <div
                        className={`booking-service-spotlight-media ${selectedServiceForDisplay.isPreviewPlaceholder ? 'is-add-services-action' : ''}`}
                        style={{ backgroundColor: serviceBgColor }}
                        onClick={selectedServiceForDisplay.isPreviewPlaceholder ? goToServicesStudio : undefined}
                    >
                        {hasServiceImage ? (
                            <img src={selectedServiceForDisplay.imageUrls[0]} alt="" />
                        ) : (
                            renderServiceImagePlaceholder(Boolean(selectedServiceForDisplay.isPreviewPlaceholder))
                        )}
                    </div>
                )}
                <div className="booking-service-spotlight-copy">
                    {selectedServiceForDisplay.category && (
                        <span className="booking-service-eyebrow" style={{ color: serviceBodyColor }}>{selectedServiceForDisplay.category}</span>
                    )}
                    <h5 style={{ color: serviceTextColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily) }}>
                        {selectedServiceForDisplay.name || 'Service name'}
                    </h5>
                    {selectedServiceForDisplay.description && (
                        <p style={{ color: serviceBodyColor }}>{selectedServiceForDisplay.description}</p>
                    )}
                    {hasDetails && (
                        <div className="booking-service-spotlight-facts" aria-label="Selected service details">
                            {duration && (
                                <span style={{ backgroundColor: serviceBgColor, borderColor: serviceBorderColor, color: serviceBodyColor }}>
                                    <Clock size={12} />
                                    {duration}
                                </span>
                            )}
                            {price && (
                                <span className="is-price" style={{ backgroundColor: serviceActiveBgColor, borderColor: withColorAlpha(settings.primaryColor || '#000', 12, '#000000'), color: serviceTextColor }}>
                                    {price}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </article>
        );
    };

    return (
        <section data-preview-section="services" className="pt-2" style={{ order: 1 }}>
            <div className={`flex flex-col ${pageItems} ${pageTextClass} mb-6 px-1 ${inspectClass}`} onClick={() => previewInspectEnabled && onInspect('services')}>
                <h4 className="booking-section-heading text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                    Choose your service
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
                        style={{
                            color: serviceTextColor,
                            borderColor: serviceBorderColor,
                            backgroundColor: serviceBgColor,
                            fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily)
                        }}
                    >
                        <span className="booking-service-dropdown-copy">
                            <strong>{selectedServiceForDisplay?.name || 'Choose a service'}</strong>
                        </span>
                        <span className="booking-service-dropdown-meta">
                            {selectedServiceForDisplay && formatServicePrice(selectedServiceForDisplay) && <span className="booking-service-dropdown-trigger-fact is-price">{formatServicePrice(selectedServiceForDisplay)}</span>}
                            <ChevronDown size={16} className="booking-service-dropdown-chevron" />
                        </span>
                    </button>
                    {renderServiceSpotlight()}
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
