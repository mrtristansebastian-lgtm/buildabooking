import { memo, useEffect, useMemo, useState } from 'react';
import { Images, MapPin, Plus } from 'lucide-react';
import '../styles/booking-runtime.css';
import { getFontFamily } from '../data/fonts';
import * as FirebaseSDK from '../services/firebase';
import { appId, functions } from '../services/firebase';
import { getLocalDateStr } from '../utils/dates';
import { normalizeServiceList } from '../utils/services';
import { BookingCartStep } from '../features/booking-flow/components/BookingCartStep';
import { BookingCheckoutStep } from '../features/booking-flow/components/BookingCheckoutStep';
import { BookingPaymentStep } from '../features/booking-flow/components/BookingPaymentStep';
import { BookingDateSection } from '../features/booking-flow/components/BookingDateSection';
import { BookingDetailsForm } from '../features/booking-flow/components/BookingDetailsForm';
import { BookingFaqSection } from '../features/booking-flow/components/BookingFaqSection';
import { BookingPageLoader } from '../features/booking-flow/components/BookingPageLoader';
import { BookingSelectionStep } from '../features/booking-flow/components/BookingSelectionStep';
import { BookingServiceStaffSection } from '../features/booking-flow/components/BookingServiceStaffSection';
import { BookingServicesSection } from '../features/booking-flow/components/BookingServicesSection';
import { BookingSocialLinks } from '../features/booking-flow/components/BookingSocialLinks';
import { BookingSuccessState } from '../features/booking-flow/components/BookingSuccessState';
import { BookingTimeSection } from '../features/booking-flow/components/BookingTimeSection';
import { BookingVenueGallery } from '../features/booking-flow/components/BookingVenueGallery';
import {
    getPaymentOptionsForCheckout,
    isHostedPaymentOption,
    parseCheckoutAmountToCents
} from '../features/booking-flow/utils/checkoutUtils';
import {
    buildGoogleMapsDirectionsUrl,
    buildGoogleMapsEmbedUrl,
    getMapPlaceLabel
} from '../features/maps/googleMaps';
import {
    bookingStyleDirections,
    createPreviewSocialLinks,
    previewServiceSamples,
    previewTimeSlots
} from '../features/booking-flow/config/bookingFlowConfig';
import {
    clampNumber,
    getAlign,
    getBlockMargins,
    getDisplayLook,
    getOptionalLetterSpacing,
    getVisualStyle,
    normalizeHandle,
    normalizeWebsite
} from '../features/booking-flow/utils/bookingFlowUtils';

const previewSocialLinks = createPreviewSocialLinks();

// --- PUBLIC BOOKING ENGINE (WITH NEW EXTENSIONS & SPECIFIC FONTS) ---
export const BookingFlow = memo(({ settings, onComplete, isPreview = false, previewStep = 'select', onInspect, onInstallApp, onSettingChange, onMediaUpload }) => {
            const [step, setStep] = useState(() => (isPreview ? previewStep : 'select'));
            const [selectedDateIdx, setSelectedDateIdx] = useState(0);
            const [selectedTime, setSelectedTime] = useState(null);
            const [selectedServiceId, setSelectedServiceId] = useState('');
            const [selectedStaffId, setSelectedStaffId] = useState('');
            const [serviceAvailability, setServiceAvailability] = useState({ loading: false, times: null, staffOptions: [], unavailableReason: '' });
            const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
            const [formData, setFormData] = useState({ name: '', phone: '', email: '', birthday: '', note: '', emailOptIn: false });
            const [selectedManualPayment, setSelectedManualPayment] = useState('');
            const [submittedBooking, setSubmittedBooking] = useState(null);
            const [paymentCheckout, setPaymentCheckout] = useState({ checkoutUrl: '', error: '', isStarting: false });
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [submitError, setSubmitError] = useState('');
            const [isInitialLoading, setIsInitialLoading] = useState(() => Boolean(settings.features?.loadingScreen));
            const [openFaq, setOpenFaq] = useState(null);

            useEffect(() => {
                if (!isPreview) return;
                if (['select', 'cart', 'details', 'payment', 'success'].includes(previewStep)) {
                    setStep(previewStep);
                }
            }, [isPreview, previewStep]);

            useEffect(() => {
                if (typeof window === 'undefined') return;
                const query = window.location.hash.split('?')[1] || '';
                const params = new URLSearchParams(query);
                const bookingId = params.get('booking');
                const paymentStatus = params.get('paymentStatus');
                if (!bookingId || !paymentStatus) return;
                setSubmittedBooking({
                    bookingId,
                    paymentStatus
                });
                setStep('success');
            }, []);

            useEffect(() => {
                if (settings.features?.loadingScreen) {
                    setIsInitialLoading(true);
                    const t = setTimeout(() => setIsInitialLoading(false), 1500);
                    return () => clearTimeout(t);
                } else {
                    setIsInitialLoading(false);
                }
            }, [settings.features?.loadingScreen, isPreview]);

            const dates = useMemo(() => {
                const arr = [];
                let d = new Date();
                d.setHours(0,0,0,0);
                let daysChecked = 0;
                while(arr.length < 14 && daysChecked < 365) {
                    const localDateStr = getLocalDateStr(d);
                    const dayConfig = settings.schedule?.[localDateStr];
                    const isAvailable = dayConfig ? dayConfig.available : true;
                    if (isAvailable) {
                        arr.push({ full: d.toDateString(), dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'long' }), year: d.getFullYear(), localDateStr });
                    }
                    d.setDate(d.getDate() + 1);
                    daysChecked++;
                }
                return arr;
            }, [settings.schedule]);
            const previewCalendarDates = useMemo(() => {
                const arr = [];
                let d = new Date();
                d.setHours(0,0,0,0);
                while (arr.length < 14) {
                    arr.push({
                        full: d.toDateString(),
                        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                        dayNum: d.getDate(),
                        month: d.toLocaleDateString('en-US', { month: 'long' }),
                        year: d.getFullYear(),
                        localDateStr: getLocalDateStr(d),
                        isPreviewPlaceholder: true
                    });
                    d.setDate(d.getDate() + 1);
                }
                return arr;
            }, []);
            const displayDates = useMemo(() => (
                dates.length > 0 ? dates : (isPreview ? previewCalendarDates : [])
            ), [dates, isPreview, previewCalendarDates]);

            useEffect(() => {
                setSelectedDateIdx(0);
                setSelectedTime(null);
            }, [displayDates]);

            const activeDate = displayDates[selectedDateIdx] || displayDates[0];
            
            const availableTimesForActiveDate = useMemo(() => {
                if (!activeDate) return [];
                const dayConfig = settings.schedule?.[activeDate.localDateStr];
                return dayConfig && Array.isArray(dayConfig.times)
                    ? dayConfig.times
                    : (Array.isArray(settings.availableTimes) ? settings.availableTimes : []);
            }, [activeDate, settings.schedule, settings.availableTimes]);

            const collectClientName = settings.features?.collectClientName !== false;
            const collectClientPhone = settings.features?.collectClientPhone !== false;
            const collectClientEmail = settings.features?.collectClientEmail !== false;
            const collectClientNotes = Boolean(settings.features?.collectClientNotes);
            const emailOptInEnabled = Boolean(settings.features?.emailUpdates !== false && collectClientEmail);
            const activeServices = useMemo(() => normalizeServiceList(settings.services || []).filter(service => service.active !== false), [settings.services]);
            const showServiceStep = activeServices.length > 0 || isPreview;
            const selectedService = activeServices.find(service => service.id === selectedServiceId) || activeServices[0] || null;
            const availabilityRules = settings.availabilityRules || {};
            const staffAssignmentMode = ['auto', 'client', 'later'].includes(availabilityRules.staffAssignmentMode)
                ? availabilityRules.staffAssignmentMode
                : 'auto';
            const serviceAwareAvailabilityEnabled = Boolean(
                !isPreview &&
                availabilityRules.enabled !== false &&
                settings.ownerId &&
                settings.slug &&
                selectedService?.id &&
                activeDate?.localDateStr &&
                functions &&
                FirebaseSDK.httpsCallable
            );
            const isPreviewTimePlaceholder = Boolean(isPreview && availableTimesForActiveDate.length === 0);
            const displayTimesForActiveDate = serviceAwareAvailabilityEnabled
                ? (serviceAvailability.loading ? [] : (serviceAvailability.times || []))
                : (availableTimesForActiveDate.length > 0 ? availableTimesForActiveDate : (isPreview ? previewTimeSlots : []));
            const isWaitlistMode = !serviceAvailability.loading && !isPreviewTimePlaceholder && displayTimesForActiveDate.length === 0 && settings.features?.waitlist;
            useEffect(() => {
                if (!isPreview || previewStep === 'select' || selectedTime || !displayTimesForActiveDate.length) return;
                setSelectedTime(displayTimesForActiveDate[0]);
            }, [displayTimesForActiveDate, isPreview, previewStep, selectedTime]);
            const publicStaffOptions = useMemo(() => {
                if (!selectedService?.id) return [];
                const staff = Array.isArray(settings.publicStaff) && settings.publicStaff.length
                    ? settings.publicStaff
                    : [{ id: 'owner', name: 'Owner', color: '#111827', photoURL: '' }];
                const serviceStaffIds = new Set(Array.isArray(selectedService?.staffIds) ? selectedService.staffIds : []);
                return staff
                    .filter(member => member?.id && (!serviceStaffIds.size || serviceStaffIds.has(member.id)))
                    .map(member => ({
                        id: member.id,
                        name: member.name || 'Staff',
                        color: member.color || '#111827',
                        photoURL: member.photoURL || ''
                    }));
            }, [selectedService?.id, selectedService?.staffIds, settings.publicStaff]);
            const serviceStaffOptions = staffAssignmentMode === 'client'
                ? (serviceAvailability.staffOptions.length ? serviceAvailability.staffOptions : publicStaffOptions)
                : [];
            const selectedAvailabilityStaff = serviceStaffOptions.find(staff => staff.id === selectedStaffId) || null;
            const previewMotionClass = isPreview ? '' : 'transition-all duration-1000';
            const previewStepMotionClass = isPreview ? '' : 'animate-in fade-in slide-in-from-bottom-20 duration-1000';
            const previewSuccessMotionClass = isPreview ? '' : 'animate-in zoom-in-95 duration-1000';
            const serviceReady = activeServices.length === 0 || Boolean(selectedService?.id);
            const showStaffSelection = staffAssignmentMode === 'client' && Boolean(selectedService?.id) && serviceStaffOptions.length > 0;
            const staffReady = staffAssignmentMode !== 'client' || !serviceAwareAvailabilityEnabled || Boolean(selectedStaffId);
            const staffStepNumber = '02';
            const dateStepNumber = showServiceStep ? (showStaffSelection ? '03' : '02') : '01';
            const timeStepNumber = showServiceStep ? (showStaffSelection ? '04' : '03') : '02';
            const faqStepNumber = showServiceStep ? (showStaffSelection ? '05' : '04') : '03';
            const dateSectionOrder = showServiceStep ? (showStaffSelection ? 3 : 2) : 1;
            const timeSectionOrder = showServiceStep ? (showStaffSelection ? 4 : 3) : 2;
            const faqSectionOrder = showServiceStep ? (showStaffSelection ? 5 : 4) : 3;
            const selectionActionOrder = faqSectionOrder + 1;
            const detailsReady = Boolean(
                (!collectClientName || formData.name) &&
                (!collectClientPhone || formData.phone) &&
                (!collectClientEmail || formData.email)
            );
            const canContinueToCart = Boolean((selectedTime || isWaitlistMode) && serviceReady && staffReady && !serviceAvailability.loading);
            const canSubmitBooking = Boolean(canContinueToCart && detailsReady);

            useEffect(() => {
                if (!activeServices.length) {
                    setSelectedServiceId('');
                    return;
                }
                if (!activeServices.some(service => service.id === selectedServiceId)) {
                    setSelectedServiceId(activeServices[0].id);
                }
            }, [activeServices, selectedServiceId]);

            useEffect(() => {
                setSelectedTime(null);
            }, [activeDate?.localDateStr, selectedService?.id, selectedStaffId]);

            useEffect(() => {
                if (staffAssignmentMode !== 'client') setSelectedStaffId('');
            }, [staffAssignmentMode]);

            useEffect(() => {
                if (staffAssignmentMode !== 'client') return;
                if (!serviceStaffOptions.length) {
                    if (selectedStaffId) setSelectedStaffId('');
                    return;
                }
                if (!selectedStaffId || !serviceStaffOptions.some(staff => staff.id === selectedStaffId)) {
                    setSelectedStaffId(serviceStaffOptions[0].id);
                }
            }, [selectedStaffId, serviceStaffOptions, staffAssignmentMode]);

            useEffect(() => {
                let cancelled = false;
                if (!serviceAwareAvailabilityEnabled) {
                    setServiceAvailability({ loading: false, times: null, staffOptions: [], unavailableReason: '' });
                    return () => { cancelled = true; };
                }
                setServiceAvailability(prev => ({ ...prev, loading: true, unavailableReason: '' }));
                const callable = FirebaseSDK.httpsCallable(functions, 'getPublicServiceAvailability');
                callable({
                    appId,
                    workspaceSlug: settings.slug,
                    dateKey: activeDate.localDateStr,
                    staffId: staffAssignmentMode === 'client' ? selectedStaffId : '',
                    service: {
                        serviceId: selectedService.id,
                        serviceDuration: selectedService.duration || ''
                    }
                }).then((result) => {
                    if (cancelled) return;
                    const data = result?.data || {};
                    const staffOptions = Array.isArray(data.staffOptions) ? data.staffOptions : [];
                    setServiceAvailability({
                        loading: false,
                        times: Array.isArray(data.times) ? data.times : [],
                        staffOptions,
                        unavailableReason: data.unavailableReason || ''
                    });
                    if (staffAssignmentMode === 'client') {
                        if (!selectedStaffId && staffOptions[0]?.id) {
                            setSelectedStaffId(staffOptions[0].id);
                        } else if (selectedStaffId && !staffOptions.some(staff => staff.id === selectedStaffId)) {
                            setSelectedStaffId(staffOptions[0]?.id || '');
                        }
                    }
                }).catch((error) => {
                    console.error(error);
                    if (!cancelled) {
                        setServiceAvailability({
                            loading: false,
                            times: availableTimesForActiveDate,
                            staffOptions: [],
                            unavailableReason: 'Times could not refresh. The business will verify your request.'
                        });
                    }
                });
                return () => { cancelled = true; };
            }, [
                activeDate?.localDateStr,
                availableTimesForActiveDate,
                selectedService?.duration,
                selectedService?.id,
                selectedStaffId,
                serviceAwareAvailabilityEnabled,
                settings.slug,
                staffAssignmentMode
            ]);

            useEffect(() => {
                setFormData(prev => ({
                    ...prev,
                    name: collectClientName ? prev.name : '',
                    phone: collectClientPhone ? prev.phone : '',
                    email: collectClientEmail ? prev.email : '',
                    note: collectClientNotes ? prev.note : '',
                    emailOptIn: emailOptInEnabled ? prev.emailOptIn : false
                }));
            }, [collectClientEmail, collectClientName, collectClientNotes, collectClientPhone, emailOptInEnabled]);

            const dynamicStyles = {
                fontFamily: getFontFamily(settings.bodyFontFamily || settings.fontFamily),
                color: settings.bodyColor || '#666666',
                backgroundColor: settings.backgroundColor || '#ffffff'
            };
            const getFunnelPageSettings = (key) => {
                const pageColors = settings[`${key}PageColors`] || {};
                return {
                    ...settings,
                    ...pageColors,
                    pageSurfaceColor: pageColors.surfaceColor || '#ffffff',
                    pageBorderColor: pageColors.borderColor || `${pageColors.headingColor || settings.headingColor || '#000000'}1A`
                };
            };
            const cartPageSettings = getFunnelPageSettings('cart');
            const checkoutPageSettings = getFunnelPageSettings('checkout');
            const successPageSettings = getFunnelPageSettings('success');
            const nativeAccent = Boolean(settings.nativeAccent);
            const nativeAccentFillClass = nativeAccent ? 'booking-gradient-accent' : '';
            const nativeAccentButtonClass = nativeAccent ? 'booking-gradient-button' : '';
            const nativeAccentBorderClass = nativeAccent ? 'booking-gradient-border' : '';
            const previewInspectEnabled = false;
            const styleDirection = bookingStyleDirections.includes(settings.interfaceStyleDirection)
                ? settings.interfaceStyleDirection
                : 'native-precision';
            const styleDirectionClass = `booking-style-${styleDirection}`;
            const isCommandFlow = styleDirection === 'command-flow';
            const nativePrecisionHeroLayout = ['native-precision', 'command-flow'].includes(styleDirection)
                ? {
                    logoDisplay: { alignment: 'left', size: 104, placement: 'badge' },
                    bannerDisplay: { height: 190, placement: 'top', opacity: 92 },
                    serviceDisplayStyle: 'compact',
                    serviceDropdownEnabled: true,
                    serviceBorderStyle: 'solid'
                }
                : null;

            const inspectClass = "";
            const logoDisplay = useMemo(() => {
                const display = nativePrecisionHeroLayout?.logoDisplay
                    ? { ...(settings.logoDisplay || {}), ...nativePrecisionHeroLayout.logoDisplay }
                    : settings.logoDisplay || {};
                const size = Number(display.size);
                const alignment = ['left', 'center', 'right'].includes(display.alignment) ? display.alignment : 'left';
                return {
                    visible: display.visible !== false,
                    alignment,
                    placement: ['title', 'top', 'badge'].includes(display.placement) ? display.placement : 'title',
                    size: Number.isFinite(size) ? Math.min(176, Math.max(48, size)) : 96
                };
            }, [nativePrecisionHeroLayout, settings.logoDisplay]);
            const pageAlignment = getAlign(logoDisplay.alignment);
            const pageJustify = pageAlignment === 'center' ? 'center' : pageAlignment === 'right' ? 'flex-end' : 'flex-start';
            const pageItems = pageAlignment === 'center' ? 'items-center' : pageAlignment === 'right' ? 'items-end' : 'items-start';
            const pageTextClass = pageAlignment === 'center' ? 'text-center' : pageAlignment === 'right' ? 'text-right' : 'text-left';
            const brandText = {
                size: clampNumber(settings.brandNameSize, 36, 120, 76),
                font: settings.brandNameFontFamily || settings.headingFontFamily || settings.fontFamily
            };
            const taglineText = {
                size: clampNumber(settings.taglineSize, 8, 22, 9),
                font: settings.taglineFontFamily || settings.bodyFontFamily || settings.fontFamily
            };
            const welcomeText = {
                size: clampNumber(settings.welcomeSize, 13, 32, 20),
                font: settings.welcomeFontFamily || settings.bodyFontFamily || settings.fontFamily
            };
            const headingLetterSpacing = getOptionalLetterSpacing(settings.headingLetterSpacing, -4, 8);
            const subtextLetterSpacing = getOptionalLetterSpacing(settings.subtextLetterSpacing, -1, 6);
            const dateStyle = getVisualStyle(settings.dateStyle || settings.availabilityStyle, 'minimal');
            const timeSlotStyle = getVisualStyle(settings.timeSlotStyle || settings.availabilityStyle, 'minimal');
            const actionButtonStyle = getVisualStyle(settings.actionButtonStyle, 'solid');
            const faqStyle = isCommandFlow ? 'minimal' : getVisualStyle(settings.faqStyle, 'minimal');
            const socialIconStyle = getVisualStyle(settings.socialIconStyle, 'outline');
            const serviceDisplaySetting = nativePrecisionHeroLayout?.serviceDisplayStyle || settings.serviceDisplayStyle;
            const serviceDisplayStyle = ['signature', 'cards', 'menu', 'gallery', 'compact', 'luxury'].includes(serviceDisplaySetting)
                ? serviceDisplaySetting
                : 'signature';
            const serviceDropdownEnabled = nativePrecisionHeroLayout?.serviceDropdownEnabled ?? Boolean(settings.serviceDropdownEnabled);
            const serviceDropdownStyle = 'signature';
            const serviceBorderStyle = getVisualStyle(nativePrecisionHeroLayout?.serviceBorderStyle || settings.serviceBorderStyle, 'solid');
            const calendarDisplayStyle = getDisplayLook('calendar', settings.calendarDisplayStyle, 'studio');
            const calendarNativeFillLooks = new Set(['studio', 'glow']);
            const timeDisplayStyle = getDisplayLook('time', settings.timeDisplayStyle, 'pill');
            const faqDisplayStyle = isCommandFlow ? 'accordion' : getDisplayLook('faq', settings.faqDisplayStyle, 'accordion');
            const venueGalleryStyle = getDisplayLook('venue', settings.venueGalleryStyle, 'mosaic');
            const mapDisplayStyle = getDisplayLook('maps', settings.mapDisplayStyle, 'card');
            const socialDisplayStyle = getDisplayLook('social', settings.socialDisplayStyle, 'icons');
            useEffect(() => {
                if (!serviceDropdownEnabled) setServicesDropdownOpen(false);
            }, [serviceDropdownEnabled]);
            const serviceCategories = useMemo(() => {
                const categories = activeServices.map(service => service.category?.trim()).filter(Boolean);
                return ['All', ...Array.from(new Set(categories))];
            }, [activeServices]);
            const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
            useEffect(() => {
                if (!serviceCategories.includes(selectedServiceCategory)) setSelectedServiceCategory('All');
            }, [selectedServiceCategory, serviceCategories]);
            const faqItems = (settings.features?.faqEnabled && Array.isArray(settings.features?.faqs))
                ? settings.features.faqs.filter(faq => faq?.q?.trim() && faq?.a?.trim())
                : [];
            const socialPlatformIsVisible = (platformKey) => (
                !settings.socialPlatforms || settings.socialPlatforms[platformKey] !== false
            );
            const socialLinks = settings.features?.socialLinks ? [
                settings.socials?.instagram && socialPlatformIsVisible('instagram') && {
                    key: 'instagram',
                    label: 'Instagram',
                    href: `https://instagram.com/${normalizeHandle(settings.socials.instagram).replace(/^instagram\.com\//i, '')}`
                },
                settings.socials?.tiktok && socialPlatformIsVisible('tiktok') && {
                    key: 'tiktok',
                    label: 'TikTok',
                    href: `https://www.tiktok.com/@${normalizeHandle(settings.socials.tiktok).replace(/^tiktok\.com\/@?/i, '')}`
                },
                settings.socials?.facebook && socialPlatformIsVisible('facebook') && {
                    key: 'facebook',
                    label: 'Facebook',
                    href: `https://facebook.com/${normalizeHandle(settings.socials.facebook).replace(/^(facebook|fb)\.com\//i, '')}`
                },
                settings.socials?.website && socialPlatformIsVisible('website') && {
                    key: 'website',
                    label: 'Website',
                    href: normalizeWebsite(settings.socials.website)
                }
            ].filter(Boolean) : [];
            const venuePhotos = Array.isArray(settings.venuePhotos)
                ? settings.venuePhotos.filter(Boolean).slice(0, 8)
                : [];
            const venueMapPlace = settings.mapPlace && typeof settings.mapPlace === 'object' ? settings.mapPlace : null;
            const venueMapLabel = getMapPlaceLabel(venueMapPlace, settings.address || settings.features?.location || '');
            const venueMapHref = buildGoogleMapsDirectionsUrl({
                address: settings.address || '',
                location: settings.features?.location || '',
                mapPlace: venueMapPlace
            });
            const venueMapEmbedSrc = buildGoogleMapsEmbedUrl(venueMapPlace);
            const amountInCents = useMemo(() => (
                parseCheckoutAmountToCents(selectedService?.price, selectedService?.priceType)
            ), [selectedService?.price, selectedService?.priceType]);
            const paymentOptions = useMemo(() => {
                const options = Array.isArray(settings.paymentOptions) && settings.paymentOptions.length
                    ? settings.paymentOptions
                    : (Array.isArray(settings.manualPaymentOptions) ? settings.manualPaymentOptions : []);
                return getPaymentOptionsForCheckout({ options, amountInCents });
            }, [amountInCents, settings.manualPaymentOptions, settings.paymentOptions]);
            const selectedManualPaymentOption = paymentOptions.find(option => option.id === selectedManualPayment) || null;
            const selectedHostedPaymentOption = selectedManualPaymentOption && isHostedPaymentOption(selectedManualPaymentOption)
                ? selectedManualPaymentOption
                : null;
            const bannerDisplay = useMemo(() => {
                const display = nativePrecisionHeroLayout?.bannerDisplay
                    ? { ...(settings.bannerDisplay || {}), ...nativePrecisionHeroLayout.bannerDisplay }
                    : settings.bannerDisplay || {};
                const height = Number(display.height);
                const opacity = Number(display.opacity);
                const position = ['top', 'center', 'bottom'].includes(display.position) ? display.position : 'center';
                return {
                    visible: display.visible !== false,
                    placement: ['hero', 'top', 'footer'].includes(display.placement) ? display.placement : 'hero',
                    height: Number.isFinite(height) ? Math.min(360, Math.max(120, height)) : 220,
                    opacity: Number.isFinite(opacity) ? Math.min(100, Math.max(15, opacity)) : 100,
                    objectPosition: position === 'top' ? 'center top' : position === 'bottom' ? 'center bottom' : 'center center'
                };
            }, [nativePrecisionHeroLayout, settings.bannerDisplay]);
            const hasHeroLogo = Boolean(settings.logo && logoDisplay.visible);
            const topBannerImage = settings.bannerImage || '';
            const businessFooterImage = settings.businessFooterImage || '';
            const getHeroMediaSource = () => topBannerImage;
            const hasHeroBanner = Boolean(getHeroMediaSource() && bannerDisplay.visible);
            const canPreviewUploadMedia = Boolean(isPreview && onMediaUpload);
            const shouldRenderHeroLogo = Boolean(logoDisplay.visible && (hasHeroLogo || canPreviewUploadMedia));
            const shouldRenderHeroBanner = Boolean(bannerDisplay.visible && bannerDisplay.placement !== 'footer' && (hasHeroBanner || canPreviewUploadMedia));
            const shouldRenderFooterMedia = Boolean(businessFooterImage || canPreviewUploadMedia);
            const handlePreviewMediaUpload = (key, event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                onMediaUpload?.(key, file);
            };
            const renderPreviewMediaPlaceholder = ({ key, label, icon: Icon = Images, className = '', placement = 'hero' }) => {
                if (!canPreviewUploadMedia) return null;
                const isLogo = key === 'logo';
                return (
                    <label
                        className={`booking-preview-media-drop ${isLogo ? 'is-logo' : ''} ${className} ${inspectClass}`}
                        data-preview-section={isLogo ? 'logo' : 'banner'}
                        style={isLogo ? {
                            '--booking-logo-size': `${logoDisplay.size}px`,
                            width: logoDisplay.size,
                            height: logoDisplay.size
                        } : { '--hero-media-height': `${bannerDisplay.height}px` }}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={label}
                    >
                        <span className="booking-preview-media-blank" aria-hidden="true">
                            <Icon size={isLogo ? 18 : 22} />
                        </span>
                        <span className="booking-preview-media-add">
                            <Plus size={13} />
                            <span>{label}</span>
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handlePreviewMediaUpload(key, event)}
                        />
                    </label>
                );
            };
            const renderHeroLogo = (extraClass = '') => hasHeroLogo ? (
                <button
                    type="button"
                    className={`booking-hero-logo-frame ${extraClass} ${inspectClass}`}
                    style={{
                        '--booking-logo-size': `${logoDisplay.size}px`,
                        width: logoDisplay.size,
                        height: logoDisplay.size
                    }}
                    onClick={() => previewInspectEnabled && onInspect('logo')}
                    aria-label="Edit brand logo"
                >
                    <img
                        src={settings.logo}
                        className="booking-hero-logo"
                        alt="Brand Logo"
                    />
                </button>
            ) : renderPreviewMediaPlaceholder({
                key: 'logo',
                label: 'Add logo',
                icon: Images,
                className: extraClass
            });
            const renderHeroMedia = (extraClass = '') => {
                const mediaSource = getHeroMediaSource();
                return mediaSource && bannerDisplay.visible ? (
                <figure
                    className={`booking-hero-media ${extraClass} ${inspectClass}`}
                    style={{ '--hero-media-height': `${bannerDisplay.height}px` }}
                    onClick={() => previewInspectEnabled && onInspect('banner')}
                >
                    <img
                        src={mediaSource}
                        className="booking-hero-banner-image"
                        style={{ objectPosition: bannerDisplay.objectPosition, opacity: bannerDisplay.opacity / 100 }}
                        alt="Business hero visual"
                    />
                </figure>
                ) : renderPreviewMediaPlaceholder({
                    key: 'bannerImage',
                    label: 'Add header banner',
                    icon: Images,
                    className: `booking-hero-media ${extraClass}`
                });
            };
            const renderFooterMedia = () => {
                if (!shouldRenderFooterMedia) return null;
                return businessFooterImage ? (
                    <figure
                        className={`booking-hero-media booking-footer-media ${inspectClass}`}
                        style={{ '--hero-media-height': `${bannerDisplay.height}px` }}
                        onClick={() => previewInspectEnabled && onInspect('banner')}
                    >
                        <img
                            src={businessFooterImage}
                            className="booking-hero-banner-image"
                            style={{ objectPosition: bannerDisplay.objectPosition, opacity: bannerDisplay.opacity / 100 }}
                            alt="Business footer visual"
                            loading="lazy"
                        />
                    </figure>
                ) : renderPreviewMediaPlaceholder({
                    key: 'businessFooterImage',
                    label: 'Add footer image',
                    icon: Images,
                    className: 'booking-hero-media booking-footer-media',
                    placement: 'footer'
                });
            };

            useEffect(() => {
                if (selectedManualPayment && !paymentOptions.some(option => option.id === selectedManualPayment)) {
                    setSelectedManualPayment('');
                }
            }, [paymentOptions, selectedManualPayment]);

            const buildPaymentReturnUrl = (status) => {
                if (typeof window === 'undefined') return '';
                const route = window.location.hash.split('?')[0] || `#/book/${settings.slug || ''}`;
                return `${window.location.origin}${window.location.pathname}${window.location.search}${route}?booking=${encodeURIComponent(submittedBooking?.bookingId || '')}&paymentStatus=${status}`;
            };

            const handleStartHostedPayment = async () => {
                if (!selectedHostedPaymentOption || !submittedBooking?.bookingId) {
                    setStep('success');
                    return;
                }
                if (paymentCheckout.checkoutUrl) {
                    window.location.href = paymentCheckout.checkoutUrl;
                    return;
                }
                if (!functions || !FirebaseSDK.httpsCallable) {
                    setPaymentCheckout({ checkoutUrl: '', isStarting: false, error: 'Secure payment is not available yet.' });
                    return;
                }
                setPaymentCheckout({ checkoutUrl: '', error: '', isStarting: true });
                try {
                    const initiatePayment = FirebaseSDK.httpsCallable(functions, 'initiatePayment');
                    const result = await initiatePayment({
                        appId,
                        businessId: settings.ownerId,
                        gatewayType: selectedHostedPaymentOption.gatewayType || selectedHostedPaymentOption.id,
                        amountInCents,
                        currency: settings.currency || 'ZAR',
                        bookingId: submittedBooking.bookingId,
                        description: selectedService?.name || 'Build A Booking payment',
                        customerEmail: formData.email || '',
                        customerName: formData.name || 'Client',
                        successUrl: buildPaymentReturnUrl('success'),
                        cancelUrl: buildPaymentReturnUrl('cancelled')
                    });
                    const checkoutUrl = result?.data?.checkoutUrl || '';
                    if (!checkoutUrl) {
                        throw new Error('Payment provider did not return a checkout link.');
                    }
                    setPaymentCheckout({ checkoutUrl, error: '', isStarting: false });
                    window.location.href = checkoutUrl;
                } catch (error) {
                    console.error(error);
                    setPaymentCheckout({
                        checkoutUrl: '',
                        isStarting: false,
                        error: error?.message || 'Payment could not be started. You can retry or finish later.'
                    });
                }
            };

            const handleAction = async () => {
                if (isPreview) {
                    setSubmittedBooking({
                        bookingId: 'Preview',
                        paymentReference: 'Preview'
                    });
                    setStep(selectedHostedPaymentOption ? 'payment' : 'success');
                    return;
                }
                if (canSubmitBooking) {
                    setIsSubmitting(true);
                    setSubmitError('');
                    try {
                        const completed = await onComplete(
                            {
                                ...formData,
                                name: collectClientName ? formData.name : 'Client',
                                phone: collectClientPhone ? formData.phone : '',
                                email: collectClientEmail ? formData.email : '',
                                note: collectClientNotes ? formData.note : '',
                                emailOptIn: Boolean(emailOptInEnabled && formData.emailOptIn),
                                serviceId: selectedService?.id || '',
                                serviceName: selectedService?.name || '',
                                serviceDescription: selectedService?.description || '',
                                servicePrice: selectedService?.price || '',
                                servicePriceType: selectedService?.priceType || '',
                                serviceDuration: selectedService?.duration || '',
                                serviceCategory: selectedService?.category || '',
                                staffId: staffAssignmentMode === 'client' ? selectedStaffId : '',
                                staffName: staffAssignmentMode === 'client' ? (selectedAvailabilityStaff?.name || '') : '',
                                staffPhotoURL: staffAssignmentMode === 'client' ? (selectedAvailabilityStaff?.photoURL || '') : '',
                                paymentMethod: selectedManualPaymentOption?.id || '',
                                paymentGateway: selectedManualPaymentOption?.gatewayType || selectedManualPaymentOption?.id || '',
                                paymentProviderName: selectedManualPaymentOption?.name || ''
                            },
                            activeDate.full,
                            isWaitlistMode ? 'Waitlist' : selectedTime,
                            isWaitlistMode ? 'waitlist' : 'pending',
                            activeDate.localDateStr
                        );
                        if (completed === false) {
                            setSubmitError('Booking could not be sent. Please try again.');
                            return;
                        }
                        setSubmittedBooking(completed && typeof completed === 'object' ? completed : null);
                        setPaymentCheckout({ checkoutUrl: '', error: '', isStarting: false });
                        setStep(selectedHostedPaymentOption ? 'payment' : 'success');
                    } catch (error) {
                        console.error(error);
                        setSubmitError('Booking could not be sent. Please try again.');
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            };

            const servicesForDisplay = selectedServiceCategory !== 'All'
                ? activeServices.filter(service => service.category?.trim() === selectedServiceCategory)
                : activeServices;
            const serviceCardsForDisplay = servicesForDisplay.length > 0
                ? servicesForDisplay
                : (isPreview ? previewServiceSamples : []);
            const serviceDropdownOptions = activeServices.length > 0
                ? activeServices
                : (isPreview ? previewServiceSamples : []);
            const selectedServiceForDisplay = selectedService || serviceDropdownOptions[0] || null;
            const selectedServiceForSummary = selectedService || (isPreview ? selectedServiceForDisplay : null);

            if (isInitialLoading) {
                return <BookingPageLoader isPreview={isPreview} settings={settings} />;
            }

            if (!activeDate) return <div className="h-full w-full flex items-center justify-center font-bold text-xl opacity-20">No Availability</div>;

            const selectedStaffForSummary = selectedAvailabilityStaff || null;
            const heroContent = (
                <header className={`booking-page-hero booking-hero-${pageAlignment} ${shouldRenderHeroBanner && bannerDisplay.placement === 'hero' ? 'has-banner' : ''} ${shouldRenderHeroLogo ? 'has-logo' : ''} logo-placement-${logoDisplay.placement} banner-placement-${bannerDisplay.placement} mb-10 flex-shrink-0`} data-preview-section="introduction">
                    {shouldRenderHeroBanner && bannerDisplay.placement === 'top' && renderHeroMedia('booking-hero-media-top')}
                    <div
                        className={`booking-hero-kicker flex items-center gap-4 ${inspectClass}`}
                        onClick={() => previewInspectEnabled && onInspect('calendar')}
                    >
                        <div className={`booking-hero-kicker-rule ${nativeAccentFillClass}`} style={{ backgroundColor: settings.primaryColor }} />
                        <span
                            className="font-bold uppercase opacity-40"
                            style={{ color: settings.bodyColor, fontFamily: getFontFamily(taglineText.font), fontSize: `${taglineText.size}px`, ...(subtextLetterSpacing ? { letterSpacing: subtextLetterSpacing } : {}) }}
                        >
                            {settings.tagline}
                        </span>
                        <div className={`booking-hero-kicker-rule ${nativeAccentFillClass}`} style={{ backgroundColor: settings.primaryColor }} />
                    </div>

                    {shouldRenderHeroBanner && bannerDisplay.placement === 'hero' && renderHeroMedia()}

                    <div className="booking-hero-copy">
                        {shouldRenderHeroLogo && renderHeroLogo('booking-hero-logo-top')}
                        <div className="booking-hero-title-lockup">
                            <h1
                                className={`booking-hero-title font-bold tracking-tighter leading-[0.85] max-w-full ${inspectClass}`}
                                style={{
                                    color: settings.headingColor,
                                    fontFamily: getFontFamily(brandText.font),
                                    fontSize: `${brandText.size}px`,
                                    ...(headingLetterSpacing ? { letterSpacing: headingLetterSpacing } : {}),
                                    textAlign: 'center',
                                    overflowWrap: 'anywhere',
                                    ...getBlockMargins('center')
                                }}
                                onClick={() => previewInspectEnabled && onInspect('introduction')}
                                contentEditable={previewInspectEnabled}
                                suppressContentEditableWarning
                                onBlur={(event) => isPreview && onSettingChange?.('brandName', event.currentTarget.textContent.trim())}
                            >
                                {settings.brandName}
                            </h1>
                        </div>
                        <p
                            className={`booking-hero-subtitle opacity-60 font-light leading-relaxed max-w-3xl ${inspectClass}`}
                            style={{
                                color: settings.bodyColor,
                                fontFamily: getFontFamily(welcomeText.font),
                                fontSize: `${welcomeText.size}px`,
                                ...(subtextLetterSpacing ? { letterSpacing: subtextLetterSpacing } : {}),
                                textAlign: 'center',
                                ...getBlockMargins('center')
                            }}
                            onClick={() => previewInspectEnabled && onInspect('introduction')}
                            contentEditable={previewInspectEnabled}
                            suppressContentEditableWarning
                            onBlur={(event) => isPreview && onSettingChange?.('welcomeMessage', event.currentTarget.textContent.trim())}
                        >
                            {settings.welcomeMessage}
                        </p>

                        {(settings.address || settings.features?.location) && (
                            <div className="booking-hero-actions" style={{ justifyContent: pageJustify }}>
                                {settings.address && (
                                    <span className="booking-hero-chip" style={{ color: settings.headingColor }}>
                                        <MapPin size={12} /> {settings.address}
                                    </span>
                                )}
                                {settings.features?.location && venueMapHref && (
                                    <a
                                        href={venueMapHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`booking-hero-chip booking-hero-chip-action transition-all hover:opacity-80 ${nativeAccent ? 'booking-gradient-chip' : ''}`}
                                        style={{ color: settings.primaryColor }}
                                        onClick={(event) => {
                                            if (isPreview) event.preventDefault();
                                        }}
                                    >
                                        <MapPin size={12} /> Get Directions
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </header>
            );

            const selectionSections = (
                <>
                    <BookingServicesSection
                        activeServices={activeServices}
                        headingLetterSpacing={headingLetterSpacing}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        nativeAccent={nativeAccent}
                        nativeAccentBorderClass={nativeAccentBorderClass}
                        onInspect={onInspect}
                        pageItems={pageItems}
                        pageTextClass={pageTextClass}
                        previewInspectEnabled={previewInspectEnabled}
                        selectedService={selectedService}
                        selectedServiceCategory={selectedServiceCategory}
                        selectedServiceForDisplay={selectedServiceForDisplay}
                        serviceBorderStyle={serviceBorderStyle}
                        serviceCardsForDisplay={serviceCardsForDisplay}
                        serviceCategories={serviceCategories}
                        serviceDisplayStyle={serviceDisplayStyle}
                        serviceDropdownEnabled={serviceDropdownEnabled}
                        serviceDropdownOptions={serviceDropdownOptions}
                        serviceDropdownOpen={servicesDropdownOpen}
                        serviceDropdownStyle={serviceDropdownStyle}
                        setSelectedServiceCategory={setSelectedServiceCategory}
                        setSelectedServiceId={setSelectedServiceId}
                        setServicesDropdownOpen={setServicesDropdownOpen}
                        settings={settings}
                    />

                    {showStaffSelection && (
                        <BookingServiceStaffSection
                            headingLetterSpacing={headingLetterSpacing}
                            pageItems={pageItems}
                            pageTextClass={pageTextClass}
                            sectionOrder={2}
                            selectedService={selectedService}
                            selectedStaffId={selectedStaffId}
                            setSelectedStaffId={setSelectedStaffId}
                            settings={settings}
                            staffOptions={serviceStaffOptions}
                            staffStepNumber={staffStepNumber}
                        />
                    )}

                    <BookingDateSection
                        activeDate={activeDate}
                        calendarDisplayStyle={calendarDisplayStyle}
                        calendarNativeFillLooks={calendarNativeFillLooks}
                        dateStepNumber={dateStepNumber}
                        dateStyle={dateStyle}
                        displayDates={displayDates}
                        headingLetterSpacing={headingLetterSpacing}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        nativeAccent={nativeAccent}
                        nativeAccentBorderClass={nativeAccentBorderClass}
                        nativeAccentButtonClass={nativeAccentButtonClass}
                        nativeAccentFillClass={nativeAccentFillClass}
                        onInspect={onInspect}
                        onSettingChange={onSettingChange}
                        pageAlignment={pageAlignment}
                        pageItems={pageItems}
                        pageJustify={pageJustify}
                        pageTextClass={pageTextClass}
                        previewInspectEnabled={previewInspectEnabled}
                        selectedDateIdx={selectedDateIdx}
                        sectionOrder={dateSectionOrder}
                        setSelectedDateIdx={setSelectedDateIdx}
                        settings={settings}
                        showServiceStep={showServiceStep}
                    />

                    <BookingTimeSection
                        displayTimesForActiveDate={displayTimesForActiveDate}
                        headingLetterSpacing={headingLetterSpacing}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        isPreviewTimePlaceholder={isPreviewTimePlaceholder}
                        isLoadingAvailability={serviceAvailability.loading}
                        isWaitlistMode={isWaitlistMode}
                        nativeAccent={nativeAccent}
                        nativeAccentBorderClass={nativeAccentBorderClass}
                        nativeAccentButtonClass={nativeAccentButtonClass}
                        nativeAccentFillClass={nativeAccentFillClass}
                        onInspect={onInspect}
                        onSettingChange={onSettingChange}
                        pageItems={pageItems}
                        pageTextClass={pageTextClass}
                        previewInspectEnabled={previewInspectEnabled}
                        selectedTime={selectedTime}
                        sectionOrder={timeSectionOrder}
                        setSelectedTime={setSelectedTime}
                        settings={settings}
                        showServiceStep={showServiceStep}
                        timeDisplayStyle={timeDisplayStyle}
                        timeSlotStyle={timeSlotStyle}
                        timeStepNumber={timeStepNumber}
                        unavailableReason={serviceAvailability.unavailableReason}
                    />

                    <BookingFaqSection
                        faqDisplayStyle={faqDisplayStyle}
                        faqItems={faqItems}
                        faqStepNumber={faqStepNumber}
                        faqStyle={faqStyle}
                        headingLetterSpacing={headingLetterSpacing}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        onInspect={onInspect}
                        openFaq={openFaq}
                        pageItems={pageItems}
                        pageTextClass={pageTextClass}
                        previewInspectEnabled={previewInspectEnabled}
                        sectionOrder={faqSectionOrder}
                        setOpenFaq={setOpenFaq}
                        settings={settings}
                        showServiceStep={showServiceStep}
                    />
                </>
            );

            const detailsForm = (
                <BookingDetailsForm
                    collectClientEmail={collectClientEmail}
                    collectClientName={collectClientName}
                    collectClientNotes={collectClientNotes}
                    collectClientPhone={collectClientPhone}
                    detailsStepNumber="01"
                    formData={formData}
                    headingLetterSpacing={headingLetterSpacing}
                    inspectClass={inspectClass}
                    isPreview={isPreview}
                    isWaitlistMode={isWaitlistMode}
                    onInspect={onInspect}
                    onSettingChange={onSettingChange}
                    pageItems="items-start"
                    pageTextClass="text-left"
                    previewInspectEnabled={previewInspectEnabled}
                    sectionOrder={1}
                    setFormData={setFormData}
                    settings={checkoutPageSettings}
                    showServiceStep={false}
                    layout="checkout"
                />
            );

            const socialLinksContent = (
                <BookingSocialLinks
                    inspectClass={inspectClass}
                    isPreview={isPreview}
                    onInspect={onInspect}
                    previewInspectEnabled={previewInspectEnabled}
                    previewSocialLinks={previewSocialLinks}
                    settings={settings}
                    socialDisplayStyle={socialDisplayStyle}
                    socialIconStyle={socialIconStyle}
                    socialLinks={socialLinks}
                />
            );

            const footerContent = (
                <div className="pt-10 text-center" data-preview-section="action">
                    <BookingVenueGallery
                        headingLetterSpacing={headingLetterSpacing}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        mapDisplayStyle={mapDisplayStyle}
                        onInspect={onInspect}
                        pageAlignment={pageAlignment}
                        previewInspectEnabled={previewInspectEnabled}
                        settings={settings}
                        subtextLetterSpacing={subtextLetterSpacing}
                        venueGalleryStyle={venueGalleryStyle}
                        venueMapEmbedSrc={venueMapEmbedSrc}
                        venueMapHref={venueMapHref}
                        venueMapLabel={venueMapLabel}
                        venuePhotos={venuePhotos}
                    />
                    {renderFooterMedia()}
                    {socialLinksContent}
                </div>
            );

            return (
                <div className={`w-full h-full max-w-full overflow-x-hidden flex flex-col ${previewMotionClass} select-none pb-12 ${nativeAccent ? 'native-booking-theme' : ''} ${styleDirectionClass} ${isPreview ? 'booking-flow-preview' : 'booking-flow-public'}`} style={{ ...dynamicStyles, overscrollBehaviorX: 'none' }}>
                {step === 'select' && (
                    <BookingSelectionStep
                        actionButtonStyle={actionButtonStyle}
                        actionOrder={selectionActionOrder}
                        canContinue={canContinueToCart}
                        ctaLabel={settings.bookingCtaLabel || 'Add booking to cart'}
                        footerContent={footerContent}
                        heroContent={heroContent}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        nativeAccentButtonClass={nativeAccentButtonClass}
                        onContinue={() => setStep('cart')}
                        previewStepMotionClass={previewStepMotionClass}
                        settings={settings}
                    >
                        {selectionSections}
                    </BookingSelectionStep>
                )}

                {step === 'cart' && (
                    <BookingCartStep
                        actionButtonStyle={actionButtonStyle}
                        activeDate={activeDate}
                        isPreview={isPreview}
                        isWaitlistMode={isWaitlistMode}
                        nativeAccentButtonClass={nativeAccentButtonClass}
                        onBack={() => setStep('select')}
                        onContinue={() => setStep('details')}
                        previewStepMotionClass={previewStepMotionClass}
                        selectedService={selectedServiceForSummary}
                        selectedStaff={selectedStaffForSummary}
                        selectedTime={selectedTime}
                        settings={cartPageSettings}
                    />
                )}

                {step === 'details' && (
                    <BookingCheckoutStep
                        actionButtonStyle={actionButtonStyle}
                        canSubmitBooking={canSubmitBooking}
                        detailsForm={detailsForm}
                        emailOptInEnabled={emailOptInEnabled}
                        formData={formData}
                        handleAction={handleAction}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        isSubmitting={isSubmitting}
                        isWaitlistMode={isWaitlistMode}
                        nativeAccentButtonClass={nativeAccentButtonClass}
                        nativeAccentFillClass={nativeAccentFillClass}
                        onBack={() => setStep('cart')}
                        paymentOptions={paymentOptions}
                        selectedPaymentOptionId={selectedManualPayment}
                        setFormData={setFormData}
                        setSelectedPaymentOptionId={setSelectedManualPayment}
                        settings={checkoutPageSettings}
                        submitError={submitError}
                    />
                )}

                {step === 'payment' && (
                    <BookingPaymentStep
                        checkoutUrl={paymentCheckout.checkoutUrl}
                        error={paymentCheckout.error}
                        isStarting={paymentCheckout.isStarting}
                        onBackToSuccess={() => setStep('success')}
                        onStartPayment={handleStartHostedPayment}
                        selectedPaymentOption={selectedHostedPaymentOption}
                    />
                )}

                {step === 'success' && (
                    <BookingSuccessState
                        activeDate={activeDate}
                        formData={formData}
                        headingLetterSpacing={headingLetterSpacing}
                        inspectClass={inspectClass}
                        isPreview={isPreview}
                        isWaitlistMode={isWaitlistMode}
                        onInspect={onInspect}
                        onInstallApp={onInstallApp}
                        previewInspectEnabled={previewInspectEnabled}
                        previewSuccessMotionClass={previewSuccessMotionClass}
                        selectedManualPaymentOption={selectedManualPaymentOption}
                        selectedTime={selectedTime}
                        setStep={setStep}
                        settings={successPageSettings}
                        submittedBooking={submittedBooking}
                        subtextLetterSpacing={subtextLetterSpacing}
                    />
                )}
                </div>
            );
        });


