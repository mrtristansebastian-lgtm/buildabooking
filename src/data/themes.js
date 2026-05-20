import { colorContrastRatio, ensureReadableTextColor, hexToHsl, mixHexColors, normalizeHexColor, readableTextFor, themeBackground } from '../utils/theme.js';

const STYLE_ARCHETYPES = [
    {
        id: 'modern',
        label: 'Modern',
        fontFamily: 'plus-jakarta',
        buttonStyle: 'pill',
        availabilityStyle: 'solid',
        surface: 'clean',
        styles: ['modern'],
        industries: ['consulting', 'technology', 'healthcare']
    },
    {
        id: 'editorial',
        label: 'Editorial',
        fontFamily: 'newsreader',
        buttonStyle: 'sharp',
        availabilityStyle: 'outline',
        surface: 'warm',
        styles: ['editorial', 'luxury'],
        industries: ['creative', 'hospitality', 'beauty']
    },
    {
        id: 'minimal',
        label: 'Minimal',
        fontFamily: 'figtree',
        buttonStyle: 'pill',
        availabilityStyle: 'minimal',
        surface: 'white',
        styles: ['minimal', 'modern'],
        industries: ['consulting', 'healthcare', 'finance']
    },
    {
        id: 'night',
        label: 'Night',
        fontFamily: 'space-grotesk',
        buttonStyle: 'pill',
        availabilityStyle: 'minimal',
        surface: 'dark',
        styles: ['night', 'modern'],
        industries: ['fitness', 'events', 'technology']
    },
    {
        id: 'luxe',
        label: 'Luxe',
        fontFamily: 'marcellus',
        buttonStyle: 'sharp',
        availabilityStyle: 'outline',
        surface: 'cream',
        styles: ['luxury', 'editorial'],
        industries: ['beauty', 'hospitality', 'events']
    },
    {
        id: 'tech',
        label: 'Tech',
        fontFamily: 'ibm-plex-mono',
        buttonStyle: 'sharp',
        availabilityStyle: 'solid',
        surface: 'ice',
        styles: ['tech', 'modern'],
        industries: ['technology', 'education', 'finance']
    },
    {
        id: 'commerce',
        label: 'Commerce',
        fontFamily: 'montserrat',
        buttonStyle: 'pill',
        availabilityStyle: 'solid',
        surface: 'soft',
        styles: ['commerce', 'bold'],
        industries: ['retail', 'food', 'trades']
    },
    {
        id: 'organic',
        label: 'Organic',
        fontFamily: 'spectral',
        buttonStyle: 'pill',
        availabilityStyle: 'minimal',
        surface: 'wash',
        styles: ['organic', 'minimal'],
        industries: ['wellness', 'food', 'property']
    },
    {
        id: 'bold',
        label: 'Bold',
        fontFamily: 'unbounded',
        buttonStyle: 'pill',
        availabilityStyle: 'solid',
        surface: 'impact',
        styles: ['bold', 'modern'],
        industries: ['fitness', 'events', 'creative']
    },
    {
        id: 'handmade',
        label: 'Handmade',
        fontFamily: 'kalam',
        buttonStyle: 'pill',
        availabilityStyle: 'minimal',
        surface: 'paper',
        styles: ['handmade', 'organic'],
        industries: ['education', 'creative', 'wellness']
    }
];

const COLOR_COLLECTIONS = [
    {
        id: 'neutral',
        label: 'Graphite',
        accent: '#111827',
        accentSoft: '#E5E7EB',
        background: '#FFFFFF',
        pale: '#FAFAFA',
        warm: '#FFFDF9',
        cream: '#F8F6F1',
        wash: '#F5F5F4',
        heading: '#09090B',
        body: '#666A73',
        dark: '#030712',
        darkPanel: '#111827',
        darkHeading: '#F9FAFB',
        darkBody: '#AAB2C0',
        industries: ['consulting', 'finance', 'technology', 'property']
    },
    {
        id: 'blue',
        label: 'Cobalt',
        accent: '#2563EB',
        accentSoft: '#DBEAFE',
        background: '#FFFFFF',
        pale: '#F6F8FF',
        warm: '#FFFDF9',
        cream: '#F7F9FF',
        wash: '#EFF6FF',
        heading: '#172554',
        body: '#53627F',
        dark: '#071227',
        darkPanel: '#102044',
        darkHeading: '#DBEAFE',
        darkBody: '#9DB4F4',
        industries: ['healthcare', 'consulting', 'education', 'property', 'technology']
    },
    {
        id: 'green',
        label: 'Emerald',
        accent: '#10B981',
        accentSoft: '#D1FAE5',
        background: '#FFFFFF',
        pale: '#F3FCF8',
        warm: '#FFFDF9',
        cream: '#F4FBF3',
        wash: '#ECFDF5',
        heading: '#064E3B',
        body: '#527166',
        dark: '#021A13',
        darkPanel: '#073527',
        darkHeading: '#D1FAE5',
        darkBody: '#8AD7B6',
        industries: ['wellness', 'food', 'property', 'healthcare', 'fitness']
    },
    {
        id: 'purple',
        label: 'Violet',
        accent: '#8B5CF6',
        accentSoft: '#EDE9FE',
        background: '#FFFFFF',
        pale: '#FAF7FF',
        warm: '#FFFDF9',
        cream: '#F8F4FF',
        wash: '#F5F3FF',
        heading: '#2E1065',
        body: '#655B76',
        dark: '#10051C',
        darkPanel: '#211035',
        darkHeading: '#F3E8FF',
        darkBody: '#C7A9E8',
        industries: ['creative', 'technology', 'events', 'beauty', 'education']
    },
    {
        id: 'pink',
        label: 'Rose',
        accent: '#DB2777',
        accentSoft: '#FCE7F3',
        background: '#FFFFFF',
        pale: '#FFF7FB',
        warm: '#FFFDF9',
        cream: '#FFF4F8',
        wash: '#FDF2F8',
        heading: '#500724',
        body: '#785363',
        dark: '#1E0610',
        darkPanel: '#3A0B1F',
        darkHeading: '#FCE7F3',
        darkBody: '#F0A7C8',
        industries: ['beauty', 'creative', 'retail', 'wellness', 'hospitality']
    },
    {
        id: 'red',
        label: 'Ruby',
        accent: '#BE123C',
        accentSoft: '#FFE4E6',
        background: '#FFFFFF',
        pale: '#FFF7F8',
        warm: '#FFFDF9',
        cream: '#FFF4F4',
        wash: '#FFF1F2',
        heading: '#4C0519',
        body: '#76535D',
        dark: '#1F050C',
        darkPanel: '#3A0C17',
        darkHeading: '#FFE4E6',
        darkBody: '#F2A6B7',
        industries: ['events', 'food', 'fitness', 'retail', 'beauty']
    },
    {
        id: 'orange',
        label: 'Tangerine',
        accent: '#F97316',
        accentSoft: '#FFEDD5',
        background: '#FFFFFF',
        pale: '#FFF8F1',
        warm: '#FFFDF9',
        cream: '#FFF4EA',
        wash: '#FFF7ED',
        heading: '#431407',
        body: '#745C4C',
        dark: '#1B0902',
        darkPanel: '#351507',
        darkHeading: '#FFEDD5',
        darkBody: '#E9AD84',
        industries: ['food', 'trades', 'retail', 'events', 'hospitality']
    },
    {
        id: 'yellow',
        label: 'Marigold',
        accent: '#EAB308',
        accentSoft: '#FEF3C7',
        background: '#FFFFFF',
        pale: '#FFFDF5',
        warm: '#FFFDF4',
        cream: '#FFF8DB',
        wash: '#FEFCE8',
        heading: '#332700',
        body: '#73684B',
        dark: '#151003',
        darkPanel: '#2B2105',
        darkHeading: '#FEF9C3',
        darkBody: '#E8D78B',
        industries: ['hospitality', 'education', 'food', 'creative', 'retail']
    }
];

const NATIVE_THEME = {
    id: 'build-a-booking-native',
    name: 'Build A Booking Native',
    primaryColor: '#755CFF',
    backgroundColor: '#FFFFFF',
    headingColor: '#050505',
    bodyColor: '#5E6470',
    slotBgColor: '#F8FAFC',
    slotTextColor: '#050505',
    dateBgColor: 'transparent',
    dateTextColor: '#8A8F98',
    dateActiveBgColor: '#EEF7FF',
    dateActiveTextColor: '#050505',
    buttonTextColor: '#050505',
    buttonStyle: 'pill',
    fontFamily: 'plus-jakarta',
    availabilityStyle: 'solid',
    dateStyle: 'solid',
    timeSlotStyle: 'solid',
    actionButtonStyle: 'solid',
    palette: 'neutral',
    styleTags: ['modern', 'minimal'],
    industryTags: ['consulting', 'technology', 'creative', 'fitness'],
    nativeAccent: true
};

const COLOR_FAMILIES = [
    { id: 'red', start: 345, end: 15 },
    { id: 'orange', start: 15, end: 38 },
    { id: 'yellow', start: 38, end: 65 },
    { id: 'earth', start: 65, end: 100 },
    { id: 'green', start: 100, end: 170 },
    { id: 'blue', start: 190, end: 255 },
    { id: 'purple', start: 255, end: 295 },
    { id: 'pink', start: 295, end: 345 }
];

const hueBetweenLocal = (h, start, end) => start <= end ? h >= start && h < end : h >= start || h < end;

const unique = (items) => [...new Set(items.filter(Boolean))];

const slugify = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const softTint = (background, accent, darkAmount = 0.18, lightAmount = 0.88) => {
    const bg = normalizeHexColor(background, '#FFFFFF');
    const primary = normalizeHexColor(accent, '#000000');
    return themeBackground({ backgroundColor: bg }).l < 45
        ? mixHexColors(bg, primary, darkAmount)
        : mixHexColors(primary, '#FFFFFF', lightAmount);
};

const bestTextFor = (background) => (
    colorContrastRatio('#000000', background) >= colorContrastRatio('#FFFFFF', background) ? '#000000' : '#FFFFFF'
);

const resolveSurface = (collection, archetype) => {
    if (archetype.surface === 'dark') return collection.dark;
    if (archetype.surface === 'warm') return collection.warm;
    if (archetype.surface === 'cream') return collection.cream;
    if (archetype.surface === 'wash') return collection.wash;
    if (archetype.surface === 'soft') return collection.pale;
    if (archetype.surface === 'ice') return collection.id === 'neutral' ? '#F8FAFC' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.62);
    if (archetype.surface === 'impact') return collection.id === 'neutral' ? '#F4F4F5' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.35);
    if (archetype.surface === 'paper') return collection.id === 'neutral' ? '#FFFFFC' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.72);
    return collection.background;
};

const createTheme = (collection, archetype) => {
    const isDark = archetype.surface === 'dark';
    const backgroundColor = resolveSurface(collection, archetype);
    const headingColor = isDark ? collection.darkHeading : collection.heading;
    const bodyColor = isDark ? collection.darkBody : collection.body;
    const slotBgColor = isDark
        ? collection.darkPanel
        : archetype.availabilityStyle === 'minimal'
            ? 'transparent'
            : (archetype.surface === 'white' ? '#F8FAFC' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.46));
    const activeDateBg = archetype.availabilityStyle === 'minimal'
        ? 'transparent'
        : (isDark ? collection.darkPanel : mixHexColors(collection.accentSoft, '#FFFFFF', 0.3));

    return {
        id: `${slugify(collection.label)}-${archetype.id}`,
        name: `${collection.label} ${archetype.label}`,
        primaryColor: collection.accent,
        backgroundColor,
        headingColor,
        bodyColor,
        slotBgColor,
        slotTextColor: headingColor,
        dateBgColor: 'transparent',
        dateTextColor: bodyColor,
        dateActiveBgColor: activeDateBg,
        dateActiveTextColor: archetype.availabilityStyle === 'minimal' ? collection.accent : headingColor,
        buttonTextColor: bestTextFor(collection.accent),
        buttonStyle: archetype.buttonStyle,
        fontFamily: archetype.fontFamily,
        availabilityStyle: archetype.availabilityStyle,
        palette: collection.id,
        styleTags: unique(archetype.styles),
        industryTags: unique([...archetype.industries, ...collection.industries.slice(0, 2)]),
        nativeAccent: false
    };
};

const generatedThemes = COLOR_COLLECTIONS.flatMap((collection) => {
    const archetypes = collection.id === 'neutral' ? STYLE_ARCHETYPES.slice(1) : STYLE_ARCHETYPES;
    const themes = archetypes.map((archetype) => createTheme(collection, archetype));
    return collection.id === 'neutral' ? [NATIVE_THEME, ...themes] : themes;
});

const RAW_PRESET_THEMES = generatedThemes.slice(0, 80);

const resolvePalette = (theme) => {
    if (theme.palette) return theme.palette;
    const primary = normalizeHexColor(theme.primaryColor, '#000000');
    const hsl = hexToHsl(primary);
    const bg = themeBackground(theme);
    if (bg.l < 18) return 'dark';
    if (hsl.s < 12 || ['#000000', '#FFFFFF', '#111827'].includes(primary)) return 'neutral';
    return COLOR_FAMILIES.find(family => hueBetweenLocal(hsl.h, family.start, family.end))?.id || 'neutral';
};

const deriveStyleTags = (theme) => {
    const text = `${theme.id} ${theme.name} ${theme.fontFamily} ${theme.buttonStyle} ${theme.availabilityStyle}`.toLowerCase();
    return unique([
        ...(Array.isArray(theme.styleTags) ? theme.styleTags : []),
        text.includes('editorial') || ['newsreader', 'lora', 'spectral', 'merriweather', 'libre-baskerville'].some(font => text.includes(font)) ? 'editorial' : '',
        text.includes('luxe') || text.includes('luxury') || ['marcellus', 'prata', 'bodoni', 'cinzel'].some(font => text.includes(font)) ? 'luxury' : '',
        text.includes('night') || themeBackground(theme).l < 18 ? 'night' : '',
        text.includes('mono') || text.includes('tech') ? 'tech' : '',
        text.includes('commerce') || ['montserrat', 'oswald', 'anton'].some(font => text.includes(font)) ? 'commerce' : '',
        text.includes('handmade') || ['kalam', 'caveat', 'marker'].some(font => text.includes(font)) ? 'handmade' : '',
        text.includes('organic') || ['spectral'].some(font => text.includes(font)) ? 'organic' : '',
        theme.availabilityStyle === 'minimal' ? 'minimal' : '',
        'modern'
    ]);
};

const deriveIndustryTags = (theme, palette, styleTags) => {
    const text = `${theme.id} ${theme.name} ${theme.fontFamily}`.toLowerCase();
    return unique([
        ...(Array.isArray(theme.industryTags) ? theme.industryTags : []),
        palette === 'pink' ? 'beauty' : '',
        palette === 'green' ? 'wellness' : '',
        palette === 'blue' ? 'healthcare' : '',
        palette === 'purple' ? 'creative' : '',
        palette === 'red' ? 'events' : '',
        palette === 'orange' ? 'food' : '',
        palette === 'yellow' ? 'hospitality' : '',
        palette === 'neutral' ? 'consulting' : '',
        styleTags.includes('tech') ? 'technology' : '',
        styleTags.includes('commerce') ? 'retail' : '',
        styleTags.includes('handmade') ? 'education' : '',
        text.includes('fitness') || styleTags.includes('bold') ? 'fitness' : '',
        text.includes('property') ? 'property' : '',
        text.includes('finance') || palette === 'neutral' ? 'finance' : ''
    ]);
};

const polishPresetTheme = (theme) => {
    const backgroundColor = normalizeHexColor(theme.backgroundColor, '#FFFFFF');
    const primaryColor = normalizeHexColor(theme.primaryColor, '#000000');
    const headingColor = ensureReadableTextColor(theme.headingColor, backgroundColor, readableTextFor(backgroundColor), 4.5);
    const bodyColor = ensureReadableTextColor(theme.bodyColor, backgroundColor, headingColor, 3.2);
    const dark = themeBackground({ backgroundColor }).l < 45;
    const palette = resolvePalette({ ...theme, backgroundColor, primaryColor });
    const styleTags = deriveStyleTags({ ...theme, backgroundColor });
    const industryTags = deriveIndustryTags(theme, palette, styleTags);
    const slotSurface = theme.slotBgColor && theme.slotBgColor !== 'transparent'
        ? normalizeHexColor(theme.slotBgColor, softTint(backgroundColor, primaryColor))
        : softTint(backgroundColor, primaryColor, 0.16, 0.9);
    const activeDateSurface = theme.dateActiveBgColor && theme.dateActiveBgColor !== 'transparent'
        ? normalizeHexColor(theme.dateActiveBgColor, softTint(backgroundColor, primaryColor))
        : (theme.availabilityStyle === 'minimal' ? 'transparent' : softTint(backgroundColor, primaryColor, 0.2, 0.86));
    const slotTextColor = ensureReadableTextColor(theme.slotTextColor || headingColor, slotSurface, headingColor, 4.5);
    const dateTextColor = ensureReadableTextColor(theme.dateTextColor || bodyColor, backgroundColor, bodyColor, 3);
    const dateActiveTextColor = activeDateSurface === 'transparent'
        ? ensureReadableTextColor(theme.dateActiveTextColor || primaryColor, backgroundColor, headingColor, 3)
        : ensureReadableTextColor(theme.dateActiveTextColor || headingColor, activeDateSurface, headingColor, 4.5);
    const buttonTextColor = ensureReadableTextColor(theme.buttonTextColor, primaryColor, bestTextFor(primaryColor), 4.5);
    const faqSurface = softTint(backgroundColor, primaryColor, dark ? 0.22 : 0.08, dark ? 0.36 : 0.94);
    const socialStyle = theme.socialIconStyle || (theme.availabilityStyle === 'solid' ? 'solid' : 'outline');

    return {
        ...theme,
        primaryColor,
        backgroundColor,
        headingColor,
        bodyColor,
        slotBgColor: slotSurface,
        slotTextColor,
        dateBgColor: theme.dateBgColor || 'transparent',
        dateTextColor,
        dateActiveBgColor: activeDateSurface,
        dateActiveTextColor,
        buttonTextColor,
        palette,
        styleTags,
        industryTags,
        nativeAccent: Boolean(theme.nativeAccent),
        dateStyle: theme.dateStyle || theme.availabilityStyle || 'minimal',
        timeSlotStyle: theme.timeSlotStyle || theme.availabilityStyle || 'minimal',
        actionButtonStyle: theme.actionButtonStyle || 'solid',
        faqStyle: theme.faqStyle || theme.availabilityStyle || 'minimal',
        faqBgColor: theme.faqBgColor || faqSurface,
        faqBorderColor: theme.faqBorderColor || mixHexColors(backgroundColor, primaryColor, dark ? 0.32 : 0.18),
        faqTextColor: theme.faqTextColor || headingColor,
        faqAnswerColor: theme.faqAnswerColor || bodyColor,
        socialIconColor: theme.socialIconColor || primaryColor,
        socialIconBgColor: theme.socialIconBgColor || (socialStyle === 'solid' ? primaryColor : 'transparent'),
        socialIconTextColor: ensureReadableTextColor(theme.socialIconTextColor || buttonTextColor, socialStyle === 'solid' ? primaryColor : backgroundColor, bestTextFor(socialStyle === 'solid' ? primaryColor : backgroundColor), 4.5),
        socialIconStyle: socialStyle
    };
};

export const PRESET_THEMES = RAW_PRESET_THEMES.map(polishPresetTheme);
