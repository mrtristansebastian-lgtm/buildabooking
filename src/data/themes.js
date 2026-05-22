import { colorContrastRatio, ensureReadableTextColor, hexToHsl, mixHexColors, normalizeHexColor, readableTextFor, themeBackground } from '../utils/theme.js';

const THEME_COLLECTION_CACHE_LIMIT = 72;
const themeCollectionCache = new Map();

const STYLE_ARCHETYPES = [
    {
        id: 'modern',
        label: 'Modern',
        fontFamily: 'plus-jakarta',
        fontSystem: {
            heading: 'plus-jakarta',
            body: 'inter',
            button: 'space-grotesk',
            slot: 'plus-jakarta',
            date: 'plus-jakarta'
        },
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
        fontSystem: {
            heading: 'newsreader',
            body: 'source-sans-3',
            button: 'work-sans',
            slot: 'source-sans-3',
            date: 'newsreader',
            headingSpacing: 0,
            subtextSpacing: 1
        },
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
        fontSystem: {
            heading: 'figtree',
            body: 'dm-sans',
            button: 'inter',
            slot: 'figtree',
            date: 'figtree',
            headingSpacing: 0,
            subtextSpacing: 0.5
        },
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
        fontSystem: {
            heading: 'space-grotesk',
            body: 'dm-sans',
            button: 'jetbrains-mono',
            slot: 'space-grotesk',
            date: 'space-grotesk',
            headingSpacing: 0,
            subtextSpacing: 1
        },
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
        fontSystem: {
            heading: 'marcellus',
            body: 'manrope',
            button: 'cinzel',
            slot: 'manrope',
            date: 'marcellus',
            headingSpacing: 1,
            subtextSpacing: 2
        },
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
        fontSystem: {
            heading: 'space-grotesk',
            body: 'ibm-plex-sans',
            button: 'ibm-plex-mono',
            slot: 'ibm-plex-mono',
            date: 'ibm-plex-mono',
            headingSpacing: 0,
            subtextSpacing: 1.5
        },
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
        fontSystem: {
            heading: 'montserrat',
            body: 'dm-sans',
            button: 'montserrat',
            slot: 'montserrat',
            date: 'montserrat',
            headingSpacing: 0,
            subtextSpacing: 0
        },
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
        fontSystem: {
            heading: 'spectral',
            body: 'source-sans-3',
            button: 'figtree',
            slot: 'source-sans-3',
            date: 'spectral',
            headingSpacing: 0,
            subtextSpacing: 0.5
        },
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
        fontSystem: {
            heading: 'unbounded',
            body: 'manrope',
            button: 'space-grotesk',
            slot: 'space-grotesk',
            date: 'unbounded',
            headingSpacing: 0,
            subtextSpacing: 0
        },
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
        fontSystem: {
            heading: 'bricolage',
            body: 'nunito-sans',
            button: 'figtree',
            slot: 'nunito-sans',
            date: 'bricolage',
            headingSpacing: 0,
            subtextSpacing: 1
        },
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

const INDUSTRY_THEME_PROFILES = {
    'all-industries': {
        id: 'all-industries',
        label: '',
        recipe: ['modern', 'editorial', 'minimal', 'night', 'luxe', 'tech', 'commerce', 'organic', 'bold', 'handmade'],
        styleTags: [],
        consultant: 'Balanced booking pages for broad service businesses.'
    },
    beauty: {
        id: 'beauty',
        label: 'Beauty',
        recipe: ['luxe', 'editorial', 'minimal', 'modern', 'organic', 'handmade', 'commerce', 'night', 'bold', 'tech'],
        fonts: { modern: 'manrope', minimal: 'figtree', bold: 'syne', tech: 'space-grotesk', luxe: 'marcellus', editorial: 'cormorant' },
        fontSystems: {
            luxe: { heading: 'marcellus', body: 'manrope', button: 'cinzel', slot: 'manrope', date: 'marcellus', headingSpacing: 1.5 },
            editorial: { heading: 'cormorant', body: 'manrope', button: 'manrope', slot: 'manrope', date: 'cormorant' },
            modern: { heading: 'manrope', body: 'dm-sans', button: 'manrope', slot: 'dm-sans', date: 'manrope' }
        },
        styleTags: ['luxury', 'editorial'],
        surfaceByStyle: { bold: 'cream', tech: 'ice' },
        consultant: 'Soft premium surfaces, elegant type, and polished conversion buttons for beauty bookings.'
    },
    wellness: {
        id: 'wellness',
        label: 'Wellness',
        recipe: ['organic', 'minimal', 'modern', 'editorial', 'handmade', 'luxe', 'commerce', 'tech', 'night', 'bold'],
        fonts: { organic: 'spectral', modern: 'dm-sans', minimal: 'figtree', tech: 'space-grotesk', bold: 'plus-jakarta' },
        fontSystems: {
            organic: { heading: 'spectral', body: 'source-sans-3', button: 'figtree', slot: 'source-sans-3', date: 'spectral' },
            minimal: { heading: 'figtree', body: 'dm-sans', button: 'figtree', slot: 'dm-sans', date: 'figtree' }
        },
        styleTags: ['organic', 'minimal'],
        buttonStyle: 'pill',
        consultant: 'Calm type, softer spacing, and low-pressure UI for therapy, spa, yoga, and wellness services.'
    },
    fitness: {
        id: 'fitness',
        label: 'Fitness',
        recipe: ['bold', 'tech', 'night', 'modern', 'commerce', 'minimal', 'editorial', 'luxe', 'organic', 'handmade'],
        fonts: { bold: 'unbounded', tech: 'space-grotesk', modern: 'plus-jakarta', commerce: 'montserrat', minimal: 'ibm-plex-sans' },
        fontSystems: {
            bold: { heading: 'unbounded', body: 'manrope', button: 'space-grotesk', slot: 'space-grotesk', date: 'unbounded' },
            tech: { heading: 'space-grotesk', body: 'ibm-plex-sans', button: 'ibm-plex-mono', slot: 'ibm-plex-mono', date: 'space-grotesk' },
            minimal: { heading: 'ibm-plex-sans', body: 'inter', button: 'ibm-plex-sans', slot: 'ibm-plex-sans', date: 'ibm-plex-sans' }
        },
        styleTags: ['bold', 'modern'],
        availabilityStyle: 'solid',
        buttonStyle: 'sharp',
        surfaceByStyle: { organic: 'impact', handmade: 'soft', luxe: 'dark' },
        consultant: 'Sharp, energetic booking pages with strong action contrast and athletic typography.'
    },
    healthcare: {
        id: 'healthcare',
        label: 'Healthcare',
        recipe: ['minimal', 'modern', 'tech', 'organic', 'commerce', 'editorial', 'luxe', 'handmade', 'night', 'bold'],
        fonts: { modern: 'inter', minimal: 'public-sans', tech: 'ibm-plex-sans', organic: 'source-sans-3' },
        fontSystems: {
            minimal: { heading: 'public-sans', body: 'source-sans-3', button: 'public-sans', slot: 'source-sans-3', date: 'public-sans' },
            modern: { heading: 'inter', body: 'source-sans-3', button: 'inter', slot: 'source-sans-3', date: 'inter' }
        },
        styleTags: ['minimal', 'modern'],
        availabilityStyle: 'solid',
        consultant: 'Clear, trustworthy layouts that prioritize readability, confidence, and low friction.'
    },
    consulting: {
        id: 'consulting',
        label: 'Consulting',
        recipe: ['modern', 'minimal', 'tech', 'editorial', 'luxe', 'commerce', 'night', 'organic', 'bold', 'handmade'],
        fonts: { modern: 'plus-jakarta', minimal: 'inter', editorial: 'newsreader', tech: 'ibm-plex-mono' },
        fontSystems: {
            modern: { heading: 'plus-jakarta', body: 'inter', button: 'plus-jakarta', slot: 'inter', date: 'plus-jakarta' },
            editorial: { heading: 'newsreader', body: 'source-sans-3', button: 'inter', slot: 'source-sans-3', date: 'newsreader' }
        },
        styleTags: ['modern', 'minimal'],
        consultant: 'Premium, direct, professional pages for advisors, coaches, and high-trust services.'
    },
    creative: {
        id: 'creative',
        label: 'Creative',
        recipe: ['editorial', 'bold', 'modern', 'luxe', 'handmade', 'tech', 'night', 'minimal', 'organic', 'commerce'],
        fonts: { editorial: 'newsreader', bold: 'syne', modern: 'space-grotesk', handmade: 'kalam' },
        fontSystems: {
            editorial: { heading: 'newsreader', body: 'manrope', button: 'space-grotesk', slot: 'manrope', date: 'newsreader' },
            bold: { heading: 'syne', body: 'manrope', button: 'space-grotesk', slot: 'space-grotesk', date: 'syne' }
        },
        styleTags: ['editorial', 'bold']
    },
    events: {
        id: 'events',
        label: 'Events',
        recipe: ['night', 'bold', 'luxe', 'editorial', 'modern', 'commerce', 'tech', 'minimal', 'organic', 'handmade'],
        fonts: { night: 'space-grotesk', bold: 'unbounded', luxe: 'cinzel', modern: 'manrope' },
        styleTags: ['night', 'bold'],
        buttonStyle: 'sharp'
    },
    food: {
        id: 'food',
        label: 'Food',
        recipe: ['organic', 'commerce', 'editorial', 'handmade', 'modern', 'luxe', 'minimal', 'bold', 'night', 'tech'],
        fonts: { organic: 'spectral', handmade: 'kalam', editorial: 'lora', commerce: 'montserrat' },
        styleTags: ['organic', 'commerce']
    },
    trades: {
        id: 'trades',
        label: 'Trades',
        recipe: ['commerce', 'bold', 'modern', 'tech', 'minimal', 'night', 'organic', 'editorial', 'luxe', 'handmade'],
        fonts: { commerce: 'montserrat', bold: 'oswald', tech: 'ibm-plex-mono', modern: 'public-sans' },
        styleTags: ['commerce', 'bold'],
        availabilityStyle: 'solid'
    },
    education: {
        id: 'education',
        label: 'Education',
        recipe: ['handmade', 'minimal', 'modern', 'tech', 'organic', 'commerce', 'editorial', 'bold', 'luxe', 'night'],
        fonts: { handmade: 'kalam', minimal: 'nunito-sans', modern: 'source-sans-3', tech: 'ibm-plex-mono' },
        styleTags: ['handmade', 'modern']
    },
    retail: {
        id: 'retail',
        label: 'Retail',
        recipe: ['commerce', 'luxe', 'modern', 'bold', 'editorial', 'minimal', 'organic', 'tech', 'night', 'handmade'],
        fonts: { commerce: 'montserrat', luxe: 'marcellus', modern: 'manrope', bold: 'syne' },
        styleTags: ['commerce', 'luxury']
    },
    hospitality: {
        id: 'hospitality',
        label: 'Hospitality',
        recipe: ['luxe', 'editorial', 'organic', 'modern', 'minimal', 'commerce', 'night', 'handmade', 'bold', 'tech'],
        fonts: { luxe: 'marcellus', editorial: 'newsreader', organic: 'spectral', modern: 'manrope' },
        styleTags: ['luxury', 'editorial']
    },
    property: {
        id: 'property',
        label: 'Property',
        recipe: ['minimal', 'modern', 'editorial', 'luxe', 'tech', 'organic', 'commerce', 'night', 'bold', 'handmade'],
        fonts: { minimal: 'inter', modern: 'plus-jakarta', editorial: 'newsreader', tech: 'ibm-plex-mono' },
        styleTags: ['minimal', 'modern']
    },
    finance: {
        id: 'finance',
        label: 'Finance',
        recipe: ['minimal', 'modern', 'tech', 'luxe', 'editorial', 'commerce', 'night', 'organic', 'bold', 'handmade'],
        fonts: { minimal: 'ibm-plex-sans', modern: 'inter', tech: 'ibm-plex-mono', luxe: 'marcellus' },
        styleTags: ['minimal', 'tech'],
        availabilityStyle: 'outline',
        buttonStyle: 'sharp'
    },
    technology: {
        id: 'technology',
        label: 'Technology',
        recipe: ['tech', 'modern', 'night', 'minimal', 'bold', 'commerce', 'editorial', 'luxe', 'organic', 'handmade'],
        fonts: { tech: 'ibm-plex-mono', modern: 'space-grotesk', night: 'space-grotesk', bold: 'unbounded' },
        styleTags: ['tech', 'modern'],
        buttonStyle: 'sharp'
    }
};

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

const INDUSTRY_PROFILE_ALIASES = {
    hair: {
        base: 'beauty',
        label: 'Hair Salon',
        recipe: ['editorial', 'luxe', 'modern', 'minimal', 'commerce', 'organic', 'bold', 'night', 'handmade', 'tech'],
        styleTags: ['beauty', 'editorial', 'luxury'],
        consultant: 'Salon-ready layouts with confident editorial type, polished service rhythm, and strong booking trust.'
    },
    barber: {
        base: 'fitness',
        label: 'Barber',
        recipe: ['bold', 'modern', 'night', 'commerce', 'minimal', 'tech', 'editorial', 'luxe', 'organic', 'handmade'],
        styleTags: ['bold', 'modern'],
        consultant: 'Sharper grooming pages with strong contrast, clean timing, and appointment-first confidence.'
    },
    nails: {
        base: 'beauty',
        label: 'Nails',
        recipe: ['luxe', 'bold', 'editorial', 'modern', 'handmade', 'commerce', 'minimal', 'organic', 'night', 'tech'],
        styleTags: ['beauty', 'bold', 'luxury'],
        consultant: 'Expressive but clean nail pages with playful color, premium cards, and social-ready polish.'
    },
    'brows-lashes': {
        base: 'beauty',
        label: 'Brows & Lashes',
        recipe: ['minimal', 'luxe', 'editorial', 'modern', 'organic', 'commerce', 'night', 'bold', 'handmade', 'tech'],
        styleTags: ['luxury', 'minimal'],
        consultant: 'Detailed, elegant booking pages for precise services where trust and clarity matter.'
    },
    waxing: {
        base: 'beauty',
        label: 'Waxing',
        recipe: ['minimal', 'modern', 'organic', 'luxe', 'commerce', 'editorial', 'handmade', 'bold', 'night', 'tech'],
        styleTags: ['minimal', 'modern'],
        consultant: 'Clean, fast, low-friction pages for recurring appointments and easy client confidence.'
    },
    spa: {
        base: 'wellness',
        label: 'Spa & Sauna',
        recipe: ['organic', 'luxe', 'minimal', 'editorial', 'modern', 'handmade', 'commerce', 'night', 'tech', 'bold'],
        styleTags: ['organic', 'luxury'],
        consultant: 'Quiet luxury surfaces, soft spacing, and calm booking patterns for slower premium experiences.'
    },
    medspa: {
        base: 'healthcare',
        label: 'Medspa',
        recipe: ['minimal', 'luxe', 'modern', 'editorial', 'tech', 'organic', 'commerce', 'night', 'bold', 'handmade'],
        styleTags: ['minimal', 'luxury'],
        consultant: 'Clinical premium pages that balance medical trust with luxury conversion cues.'
    },
    massage: {
        base: 'wellness',
        label: 'Massage',
        recipe: ['organic', 'minimal', 'editorial', 'handmade', 'modern', 'luxe', 'commerce', 'night', 'tech', 'bold'],
        styleTags: ['organic', 'minimal'],
        consultant: 'Warm, restorative pages with gentle typography and calm time selection.'
    },
    'personal-training': {
        base: 'fitness',
        label: 'Personal Training',
        recipe: ['bold', 'tech', 'modern', 'commerce', 'minimal', 'night', 'editorial', 'organic', 'luxe', 'handmade'],
        styleTags: ['bold', 'modern'],
        consultant: 'High-energy booking pages for results-driven coaching and recurring training sessions.'
    },
    therapy: {
        base: 'wellness',
        label: 'Therapy Centre',
        recipe: ['minimal', 'organic', 'modern', 'editorial', 'handmade', 'luxe', 'tech', 'commerce', 'night', 'bold'],
        styleTags: ['minimal', 'organic'],
        consultant: 'Private, calming interfaces that feel trustworthy and easy for sensitive appointments.'
    },
    'physical-therapy': {
        base: 'healthcare',
        label: 'Physical Therapy',
        recipe: ['modern', 'minimal', 'tech', 'organic', 'commerce', 'bold', 'editorial', 'luxe', 'night', 'handmade'],
        styleTags: ['healthcare', 'modern'],
        consultant: 'Recovery-focused pages with clear status, practical typography, and accessible scheduling.'
    },
    'tattoo-piercing': {
        base: 'creative',
        label: 'Tattoo & Piercing',
        recipe: ['night', 'bold', 'editorial', 'tech', 'modern', 'minimal', 'luxe', 'handmade', 'commerce', 'organic'],
        styleTags: ['bold', 'creative'],
        consultant: 'Portfolio-friendly pages with edge, contrast, and confident consult flow.'
    },
    tanning: {
        base: 'beauty',
        label: 'Tanning Studio',
        recipe: ['commerce', 'luxe', 'modern', 'organic', 'bold', 'editorial', 'minimal', 'handmade', 'night', 'tech'],
        styleTags: ['commerce', 'beauty'],
        consultant: 'Bright, glossy booking pages for glow services, packages, and repeat visits.'
    },
    pets: {
        base: 'wellness',
        label: 'Pet Grooming',
        recipe: ['handmade', 'organic', 'modern', 'commerce', 'minimal', 'bold', 'editorial', 'luxe', 'tech', 'night'],
        styleTags: ['friendly', 'organic'],
        consultant: 'Friendly, approachable pages that make care, timing, and repeat visits feel simple.'
    },
    'home-services': {
        base: 'trades',
        label: 'Home Services',
        recipe: ['commerce', 'modern', 'minimal', 'tech', 'bold', 'organic', 'editorial', 'night', 'handmade', 'luxe'],
        styleTags: ['commerce', 'modern'],
        consultant: 'Practical service pages built for fast trust, clear availability, and on-site appointments.'
    },
    automotive: {
        base: 'trades',
        label: 'Automotive',
        recipe: ['bold', 'tech', 'commerce', 'modern', 'night', 'minimal', 'editorial', 'organic', 'luxe', 'handmade'],
        styleTags: ['bold', 'tech'],
        consultant: 'Performance-feeling pages with strong contrast for detailing, repairs, and fitment bookings.'
    },
    legal: {
        base: 'finance',
        label: 'Legal',
        recipe: ['minimal', 'editorial', 'modern', 'luxe', 'tech', 'commerce', 'night', 'organic', 'bold', 'handmade'],
        styleTags: ['minimal', 'editorial'],
        consultant: 'Serious, readable booking pages for consults where authority and privacy matter.'
    }
};

Object.entries(INDUSTRY_PROFILE_ALIASES).forEach(([id, config]) => {
    const base = INDUSTRY_THEME_PROFILES[config.base] || INDUSTRY_THEME_PROFILES['all-industries'];
    INDUSTRY_THEME_PROFILES[id] = {
        ...base,
        id,
        label: config.label,
        recipe: config.recipe || base.recipe,
        styleTags: unique([...(base.styleTags || []), ...(config.styleTags || [])]),
        consultant: config.consultant || base.consultant
    };
});

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

const getIndustryProfile = (industryId = 'all-industries') => (
    INDUSTRY_THEME_PROFILES[industryId] || INDUSTRY_THEME_PROFILES['all-industries']
);

const STYLE_ALIASES = {
    luxury: 'luxe',
    luxe: 'luxe',
    all: 'modern',
    'all-styles': 'modern'
};

const canonicalStyleId = (styleId = 'modern') => STYLE_ALIASES[styleId] || styleId;

const getStyleArchetype = (styleId) => (
    STYLE_ARCHETYPES.find(archetype => archetype.id === canonicalStyleId(styleId)) || STYLE_ARCHETYPES[0]
);

const getIndustryRecipe = (profile, styleId = 'all-styles', detectedStyle = '') => {
    const selectedStyle = styleId && styleId !== 'all-styles'
        ? [canonicalStyleId(styleId)]
        : detectedStyle
            ? [canonicalStyleId(detectedStyle)]
            : [];
    const orderedIds = unique([...selectedStyle, ...(profile.recipe || []), ...STYLE_ARCHETYPES.map(archetype => archetype.id)]);
    return orderedIds.slice(0, 10).map(getStyleArchetype);
};

const getFontSystem = (profile, archetype) => {
    const profileSystem = profile.fontSystems?.[archetype.id] || profile.fontSystems?.[canonicalStyleId(archetype.id)];
    const baseSystem = archetype.fontSystem || {};
    const profileFont = profile.fonts?.[archetype.id] || profile.fonts?.[canonicalStyleId(archetype.id)];
    const fallback = profileFont || archetype.fontFamily || 'inter';

    return {
        heading: profileSystem?.heading || baseSystem.heading || fallback,
        body: profileSystem?.body || baseSystem.body || fallback,
        button: profileSystem?.button || baseSystem.button || fallback,
        slot: profileSystem?.slot || baseSystem.slot || profileSystem?.body || baseSystem.body || fallback,
        date: profileSystem?.date || baseSystem.date || profileSystem?.heading || baseSystem.heading || fallback,
        headingSpacing: profileSystem?.headingSpacing ?? baseSystem.headingSpacing ?? 0,
        subtextSpacing: profileSystem?.subtextSpacing ?? baseSystem.subtextSpacing ?? 0
    };
};

const createPaletteVariant = (collection, variant) => {
    if (variant === 'bright') {
        return {
            ...collection,
            id: collection.id,
            label: `${collection.label} Lift`,
            variantId: 'lift',
            variantLabel: 'Lift',
            accent: mixHexColors(collection.accent, '#FFFFFF', 0.12),
            accentSoft: mixHexColors(collection.accentSoft, '#FFFFFF', 0.22),
            pale: mixHexColors(collection.pale, '#FFFFFF', 0.36),
            wash: mixHexColors(collection.wash, '#FFFFFF', 0.28)
        };
    }

    if (variant === 'deep') {
        return {
            ...collection,
            id: collection.id,
            label: `${collection.label} Depth`,
            variantId: 'depth',
            variantLabel: 'Depth',
            accent: mixHexColors(collection.accent, '#000000', 0.12),
            accentSoft: mixHexColors(collection.accentSoft, collection.accent, 0.16),
            heading: mixHexColors(collection.heading, '#000000', 0.08),
            dark: mixHexColors(collection.dark, collection.accent, 0.08),
            darkPanel: mixHexColors(collection.darkPanel, collection.accent, 0.1)
        };
    }

    if (variant === 'noir') {
        return {
            ...collection,
            id: collection.id,
            label: `${collection.label} Noir`,
            variantId: 'noir',
            variantLabel: 'Noir',
            forceDark: true,
            accent: mixHexColors(collection.accent, '#FFFFFF', 0.04),
            accentSoft: mixHexColors(collection.accentSoft, collection.accent, 0.18),
            dark: mixHexColors(collection.dark, collection.accent, 0.08),
            darkPanel: mixHexColors(collection.darkPanel, collection.accent, 0.14)
        };
    }

    return collection;
};

const createCustomColorCollection = (customColor = '#755CFF') => {
    const accent = normalizeHexColor(customColor, '#755CFF');
    const accentSoft = mixHexColors(accent, '#FFFFFF', 0.76);
    const heading = mixHexColors(accent, '#000000', 0.64);
    return {
        id: 'custom',
        label: 'Custom',
        accent,
        accentSoft,
        background: '#FFFFFF',
        pale: mixHexColors(accent, '#FFFFFF', 0.92),
        warm: '#FFFDF9',
        cream: mixHexColors(accent, '#FFF8EC', 0.9),
        wash: mixHexColors(accent, '#FFFFFF', 0.86),
        heading,
        body: mixHexColors(heading, '#FFFFFF', 0.34),
        dark: mixHexColors(accent, '#000000', 0.82),
        darkPanel: mixHexColors(accent, '#000000', 0.68),
        darkHeading: mixHexColors(accent, '#FFFFFF', 0.88),
        darkBody: mixHexColors(accent, '#FFFFFF', 0.62),
        industries: ['custom']
    };
};

const paletteVariantsFor = (collection) => [
    collection,
    createPaletteVariant(collection, 'bright'),
    createPaletteVariant(collection, 'deep'),
    createPaletteVariant(collection, 'noir')
];

const getPaletteCollections = (paletteId = 'all', customColor = '#755CFF') => {
    if (paletteId === 'dark') {
        return {
            collections: COLOR_COLLECTIONS.map(collection => createPaletteVariant(collection, 'noir')),
            focused: false,
            forceDark: true
        };
    }

    if (paletteId === 'custom') {
        const base = createCustomColorCollection(customColor);
        return {
            collections: paletteVariantsFor(base),
            focused: true,
            forceDark: false
        };
    }

    if (paletteId && paletteId !== 'all') {
        const base = COLOR_COLLECTIONS.find(collection => collection.id === paletteId);
        if (base) {
            return {
                collections: paletteVariantsFor(base),
                focused: true,
                forceDark: false
            };
        }
        return { collections: [], focused: true, forceDark: false };
    }

    return { collections: COLOR_COLLECTIONS.flatMap(paletteVariantsFor), focused: false, forceDark: false };
};

const sortCollectionsByDetectedPalette = (collections, detectedPalette) => {
    if (!detectedPalette) return collections;
    return [...collections].sort((a, b) => {
        if (a.id === detectedPalette && b.id !== detectedPalette) return -1;
        if (b.id === detectedPalette && a.id !== detectedPalette) return 1;
        return 0;
    });
};

const shouldIncludeNativeTheme = ({ industry, palette, style }) => (
    (!industry || industry === 'all-industries' || industry === 'technology' || industry === 'consulting' || industry === 'creative')
    && (!palette || palette === 'all' || palette === 'neutral')
    && (!style || style === 'all-styles' || style === 'modern' || style === 'minimal')
);

const resolveSurface = (collection, archetype, profile, forceDark = false) => {
    const surface = forceDark ? 'dark' : (profile?.surfaceByStyle?.[archetype.id] || archetype.surface);
    if (surface === 'dark') return collection.dark;
    if (surface === 'warm') return collection.warm;
    if (surface === 'cream') return collection.cream;
    if (surface === 'wash') return collection.wash;
    if (surface === 'soft') return collection.pale;
    if (surface === 'ice') return collection.id === 'neutral' ? '#F8FAFC' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.62);
    if (surface === 'impact') return collection.id === 'neutral' ? '#F4F4F5' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.35);
    if (surface === 'paper') return collection.id === 'neutral' ? '#FFFFFC' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.72);
    return collection.background;
};

const createTheme = (collection, archetype, options = {}) => {
    const profile = options.profile || getIndustryProfile();
    const surface = options.forceDark ? 'dark' : (profile.surfaceByStyle?.[archetype.id] || archetype.surface);
    const availabilityStyle = profile.availabilityByStyle?.[archetype.id] || profile.availabilityStyle || archetype.availabilityStyle;
    const buttonStyle = profile.buttonByStyle?.[archetype.id] || profile.buttonStyle || archetype.buttonStyle;
    const fontSystem = getFontSystem(profile, archetype);
    const isDark = surface === 'dark';
    const backgroundColor = resolveSurface(collection, archetype, profile, options.forceDark);
    const headingColor = isDark ? collection.darkHeading : collection.heading;
    const bodyColor = isDark ? collection.darkBody : collection.body;
    const slotBgColor = isDark
        ? collection.darkPanel
        : availabilityStyle === 'minimal'
            ? 'transparent'
            : (surface === 'white' ? '#F8FAFC' : mixHexColors(collection.accentSoft, '#FFFFFF', 0.46));
    const activeDateBg = availabilityStyle === 'minimal'
        ? 'transparent'
        : (isDark ? collection.darkPanel : mixHexColors(collection.accentSoft, '#FFFFFF', 0.3));
    const isIndustrySpecific = profile.id && profile.id !== 'all-industries';
    const paletteVariantId = options.variantId || collection.variantId || '';
    const paletteVariantLabel = options.variantLabel || collection.variantLabel || '';
    const collectionName = `${collection.label}${paletteVariantLabel && !collection.label.includes(paletteVariantLabel) ? ` ${paletteVariantLabel}` : ''}`;

    return {
        id: `${isIndustrySpecific ? `${profile.id}-` : ''}${slugify(collection.label)}-${archetype.id}${paletteVariantId ? `-${paletteVariantId}` : ''}`,
        name: `${isIndustrySpecific ? `${profile.label} ` : ''}${collectionName} ${archetype.label}`,
        primaryColor: collection.accent,
        backgroundColor,
        headingColor,
        bodyColor,
        slotBgColor,
        slotTextColor: headingColor,
        dateBgColor: 'transparent',
        dateTextColor: bodyColor,
        dateActiveBgColor: activeDateBg,
        dateActiveTextColor: availabilityStyle === 'minimal' ? collection.accent : headingColor,
        buttonTextColor: bestTextFor(collection.accent),
        buttonStyle,
        fontFamily: fontSystem.body,
        headingFontFamily: fontSystem.heading,
        bodyFontFamily: fontSystem.body,
        buttonFontFamily: fontSystem.button,
        slotFontFamily: fontSystem.slot,
        dateFontFamily: fontSystem.date,
        headingLetterSpacing: fontSystem.headingSpacing,
        subtextLetterSpacing: fontSystem.subtextSpacing,
        availabilityStyle,
        dateStyle: profile.dateByStyle?.[archetype.id] || availabilityStyle,
        timeSlotStyle: profile.timeByStyle?.[archetype.id] || availabilityStyle,
        actionButtonStyle: profile.actionByStyle?.[archetype.id] || 'solid',
        palette: collection.id,
        styleTags: unique([...archetype.styles, ...(profile.styleTags || [])]),
        industryTags: unique([
            isIndustrySpecific ? profile.id : '',
            ...(archetype.industries || []),
            ...(collection.industries || []).slice(0, 2)
        ]),
        consultantNote: profile.consultant || '',
        nativeAccent: false
    };
};

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

export const generateThemeCollection = ({
    industry = 'all-industries',
    palette = 'all',
    style = 'all-styles',
    detectedPalette = '',
    detectedStyle = '',
    customColor = ''
} = {}) => {
    const cacheKey = `${industry}|${palette}|${customColor || ''}|${style}|${palette === 'all' ? detectedPalette : ''}|${style === 'all-styles' ? detectedStyle : ''}`;
    const cached = themeCollectionCache.get(cacheKey);
    if (cached) return cached;

    const profile = getIndustryProfile(industry);
    const recipe = getIndustryRecipe(profile, style, detectedStyle);
    const palettePlan = getPaletteCollections(palette, customColor);
    const collections = sortCollectionsByDetectedPalette(palettePlan.collections, palette === 'all' ? detectedPalette : '');
    const generated = palettePlan.focused
        ? collections.flatMap(collection => (
            recipe.slice(0, 8).map(archetype => createTheme(collection, archetype, {
                profile,
                forceDark: palettePlan.forceDark || collection.forceDark,
                variantId: collection.variantId,
                variantLabel: collection.variantLabel
            }))
        ))
        : collections.map((collection, index) => createTheme(collection, recipe[index % recipe.length], {
            profile,
            forceDark: palettePlan.forceDark || collection.forceDark,
            variantId: collection.variantId,
            variantLabel: collection.variantLabel
        }));
    const generatedLimit = palettePlan.focused ? 34 : 34;
    const withNativeTheme = shouldIncludeNativeTheme({ industry, palette, style })
        ? [NATIVE_THEME, ...generated]
        : generated;

    const themes = withNativeTheme.slice(0, generatedLimit).map(polishPresetTheme);
    themeCollectionCache.set(cacheKey, themes);
    if (themeCollectionCache.size > THEME_COLLECTION_CACHE_LIMIT) {
        themeCollectionCache.delete(themeCollectionCache.keys().next().value);
    }
    return themes;
};

export const PRESET_THEMES = generateThemeCollection();

