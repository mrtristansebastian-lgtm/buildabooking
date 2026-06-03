import { ChevronDown, ChevronUp } from 'lucide-react';
import { getFontFamily } from '../../../data/fonts';
import { previewFaqItems } from '../config/bookingFlowConfig';
import { getFaqItemStyle } from '../utils/bookingFlowUtils';

export const BookingFaqSection = ({
    faqDisplayStyle,
    faqItems,
    faqStepNumber,
    faqStyle,
    headingLetterSpacing,
    inspectClass,
    isPreview,
    onInspect,
    openFaq,
    pageItems,
    pageTextClass,
    previewInspectEnabled,
    setOpenFaq,
    settings,
    showServiceStep
}) => {
    if (faqItems.length === 0 && !isPreview) return null;

    const isPreviewEmpty = isPreview && faqItems.length === 0;
    const faqItemsForDisplay = faqItems.length > 0 ? faqItems : (isPreviewEmpty ? previewFaqItems : []);

    return (
        <section
            className={`booking-faq-section booking-faq-${faqDisplayStyle} pt-2 ${inspectClass}`}
            data-preview-section="faq"
            onClick={() => previewInspectEnabled && onInspect('faq')}
            style={{ order: showServiceStep ? 4 : 3 }}
        >
            <div className={`flex flex-col ${pageItems} ${pageTextClass} mb-6 px-1`}>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2 opacity-40" style={{ color: settings.bodyColor }}>{faqStepNumber} // Good to know</h3>
                <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: settings.headingColor, fontFamily: getFontFamily(settings.headingFontFamily || settings.fontFamily), ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}) }}>
                    Questions before booking
                </h4>
            </div>
            <div className={`space-y-3 ${isPreviewEmpty ? 'booking-faq-preview-empty' : ''}`}>
                {faqItemsForDisplay.map((faq, index) => {
                    const isOpen = isPreviewEmpty ? index === 0 : openFaq === index;
                    return (
                        <button
                            key={`${faq.q}-${index}`}
                            type="button"
                            className={`w-full text-left transition-all ${isPreviewEmpty ? 'is-preview-empty' : ''}`}
                            style={getFaqItemStyle({ settings, faqStyle })}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (isPreviewEmpty) return;
                                setOpenFaq(openFaq === index ? null : index);
                            }}
                        >
                            <span className="flex justify-between items-center gap-4">
                                <span className="font-bold text-sm" style={{ color: settings.faqTextColor || settings.headingColor, fontFamily: getFontFamily(settings.faqFontFamily || settings.headingFontFamily || settings.fontFamily) }}>{faq.q}</span>
                                {isOpen ? <ChevronUp size={16} style={{ color: settings.faqAnswerColor || settings.bodyColor }} /> : <ChevronDown size={16} style={{ color: settings.faqAnswerColor || settings.bodyColor }} />}
                            </span>
                            {isOpen && <span className="block mt-3 text-sm opacity-85 leading-relaxed" style={{ color: settings.faqAnswerColor || settings.bodyColor, fontFamily: getFontFamily(settings.faqFontFamily || settings.bodyFontFamily || settings.fontFamily) }}>{faq.a}</span>}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
