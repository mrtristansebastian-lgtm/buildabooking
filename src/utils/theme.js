export const hexToHsl = (hex) => {
            if (!hex || typeof hex !== 'string' || hex === 'transparent') return { h: 0, s: 0, l: 100 };
            const clean = hex.replace('#', '').trim();
            if (clean.length !== 6) return { h: 0, s: 0, l: 100 };
            let r = parseInt(clean.slice(0, 2), 16) / 255;
            let g = parseInt(clean.slice(2, 4), 16) / 255;
            let b = parseInt(clean.slice(4, 6), 16) / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    default: h = (r - g) / d + 4; break;
                }
                h *= 60;
            }
            return { h, s: s * 100, l: l * 100 };
        };

        export const hueBetween = (h, start, end) => start <= end ? h >= start && h < end : h >= start || h < end;
        export const themePrimary = (theme) => hexToHsl(theme.primaryColor);
        export const themeBackground = (theme) => hexToHsl(theme.backgroundColor);
        export const isNeutralTheme = (theme) => themePrimary(theme).s < 12 || ['#000000', '#FFFFFF', '#111827'].includes((theme.primaryColor || '').toUpperCase());

        export const THEME_PALETTE_FILTERS = [
            { id: 'all', name: 'All', hint: 'Full Library', swatches: ['#050505', '#FFFFFF', '#39FF14'], match: () => true },
            { id: 'light', name: 'Light', hint: 'Clean & Airy', swatches: ['#FFFFFF', '#F8FAFC', '#E5E7EB'], match: (theme) => themeBackground(theme).l >= 92 },
            { id: 'dark', name: 'Dark', hint: 'Noir & Night', swatches: ['#030712', '#111827', '#39FF14'], match: (theme) => themeBackground(theme).l < 18 },
            { id: 'blue', name: 'Blue', hint: 'Calm & Trust', swatches: ['#DBEAFE', '#2563EB', '#082F49'], match: (theme) => hueBetween(themePrimary(theme).h, 190, 255) && !isNeutralTheme(theme) },
            { id: 'green', name: 'Green', hint: 'Fresh & Natural', swatches: ['#D1FAE5', '#10B981', '#064E3B'], match: (theme) => hueBetween(themePrimary(theme).h, 95, 170) && !isNeutralTheme(theme) },
            { id: 'purple', name: 'Purple', hint: 'Creative & Luxe', swatches: ['#EDE9FE', '#7C3AED', '#2E1065'], match: (theme) => hueBetween(themePrimary(theme).h, 255, 295) && !isNeutralTheme(theme) },
            { id: 'pink', name: 'Pink', hint: 'Soft & Bold', swatches: ['#FCE7F3', '#DB2777', '#500724'], match: (theme) => hueBetween(themePrimary(theme).h, 295, 345) && !isNeutralTheme(theme) },
            { id: 'red', name: 'Red', hint: 'Drama & Heat', swatches: ['#FFE4E6', '#BE123C', '#4C0519'], match: (theme) => hueBetween(themePrimary(theme).h, 345, 15) && !isNeutralTheme(theme) },
            { id: 'orange', name: 'Orange', hint: 'Bright & Warm', swatches: ['#FFEDD5', '#F97316', '#431407'], match: (theme) => hueBetween(themePrimary(theme).h, 15, 38) && !isNeutralTheme(theme) },
            { id: 'yellow', name: 'Yellow', hint: 'Sunny & Sharp', swatches: ['#FEF9C3', '#EAB308', '#422006'], match: (theme) => hueBetween(themePrimary(theme).h, 38, 60) && !isNeutralTheme(theme) },
            { id: 'amber', name: 'Amber', hint: 'Warm & Sunny', swatches: ['#FEF3C7', '#F59E0B', '#451A03'], match: (theme) => hueBetween(themePrimary(theme).h, 15, 55) && !isNeutralTheme(theme) },
            { id: 'earth', name: 'Earth', hint: 'Organic & Grounded', swatches: ['#ECFCCB', '#4D7C0F', '#2C4C3B'], match: (theme) => hueBetween(themePrimary(theme).h, 55, 95) && !isNeutralTheme(theme) },
            { id: 'neutral', name: 'Neutral', hint: 'Black, White, Grey', swatches: ['#000000', '#F9FAFB', '#6B7280'], match: isNeutralTheme }
        ];

        export const normalizeHexColor = (color, fallback = '#000000') => {
            if (!color || typeof color !== 'string' || color === 'transparent') return fallback;
            const clean = color.trim();
            if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
                return `#${clean.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
            }
            if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean.toUpperCase();
            return fallback;
        };

        export const hexToRgb = (color, fallback = '#000000') => {
            const hex = normalizeHexColor(color, fallback).replace('#', '');
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        };

        export const rgbaFromHex = (color, alpha = 1, fallback = '#000000') => {
            const { r, g, b } = hexToRgb(color, fallback);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        export const mixHexColors = (base, overlay, amount = 0.5) => {
            const a = hexToRgb(base, '#FFFFFF');
            const b = hexToRgb(overlay, '#000000');
            const mix = (start, end) => Math.round(start + (end - start) * amount).toString(16).padStart(2, '0');
            return `#${mix(a.r, b.r)}${mix(a.g, b.g)}${mix(a.b, b.b)}`.toUpperCase();
        };

        export const readableTextFor = (backgroundColor) => {
            const { r, g, b } = hexToRgb(backgroundColor, '#000000');
            const luminance = [r, g, b].map(value => {
                const c = value / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            const score = 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2];
            return score > 0.58 ? '#000000' : '#FFFFFF';
        };

        export const colorContrastRatio = (foregroundColor, backgroundColor) => {
            const luminanceFor = (color, fallback) => {
                const { r, g, b } = hexToRgb(color, fallback);
                const [red, green, blue] = [r, g, b].map(value => {
                    const c = value / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
            };
            const lighter = Math.max(luminanceFor(foregroundColor, '#000000'), luminanceFor(backgroundColor, '#FFFFFF'));
            const darker = Math.min(luminanceFor(foregroundColor, '#000000'), luminanceFor(backgroundColor, '#FFFFFF'));
            return (lighter + 0.05) / (darker + 0.05);
        };

        export const ensureReadableTextColor = (color, backgroundColor, fallbackColor = readableTextFor(backgroundColor), minContrast = 4.5) => {
            const normalized = normalizeHexColor(color, fallbackColor);
            const background = normalizeHexColor(backgroundColor, '#FFFFFF');
            return colorContrastRatio(normalized, background) >= minContrast ? normalized : fallbackColor;
        };
