import { getSocialLinkStyle } from '../utils/bookingFlowUtils';

export const BookingSocialLinks = ({
    inspectClass,
    isPreview,
    onInspect,
    previewInspectEnabled,
    previewSocialLinks,
    settings,
    socialDisplayStyle,
    socialIconStyle,
    socialLinks
}) => {
    const linksForDisplay = socialLinks.length > 0 ? socialLinks : (isPreview ? previewSocialLinks : []);
    if (linksForDisplay.length === 0) return null;

    const isPreviewEmpty = socialLinks.length === 0;

    return (
        <div className={`booking-social-links booking-social-${socialDisplayStyle} booking-social-placement-footer ${isPreviewEmpty ? 'booking-social-preview-empty' : ''} mt-8 flex flex-wrap items-center justify-center gap-3 ${inspectClass}`} data-preview-section="social" onClick={() => previewInspectEnabled && onInspect('social')}>
            {linksForDisplay.map(link => {
                const IconCmp = link.icon;
                return (
                    <a
                        key={link.key}
                        href={link.href}
                        target={link.isPreviewPlaceholder ? undefined : '_blank'}
                        rel={link.isPreviewPlaceholder ? undefined : 'noreferrer'}
                        className={`inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-[10px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 ${link.isPreviewPlaceholder ? 'is-preview-empty' : ''}`}
                        style={getSocialLinkStyle({ settings, socialIconStyle })}
                        aria-label={link.label}
                        onClick={(event) => {
                            if (isPreview || link.isPreviewPlaceholder) event.preventDefault();
                        }}
                    >
                        <IconCmp size={14} />
                        <span>{link.label}</span>
                    </a>
                );
            })}
        </div>
    );
};
