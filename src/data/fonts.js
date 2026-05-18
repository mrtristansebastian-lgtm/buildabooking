// --- 27 FONT TYPOGRAPHY MASTER LIST ---
        export const FONT_OPTIONS = [
            // SANS-SERIF
            { id: 'inter', name: 'Inter', category: 'Sans', family: '"Inter", sans-serif' },
            { id: 'plus-jakarta', name: 'Jakarta', category: 'Sans', family: '"Plus Jakarta Sans", sans-serif' },
            { id: 'outfit', name: 'Outfit', category: 'Sans', family: '"Outfit", sans-serif' },
            { id: 'dm-sans', name: 'DM Sans', category: 'Sans', family: '"DM Sans", sans-serif' },
            { id: 'manrope', name: 'Manrope', category: 'Sans', family: '"Manrope", sans-serif' },
            { id: 'chivo', name: 'Chivo', category: 'Sans', family: '"Chivo", sans-serif' },
            { id: 'spline-sans', name: 'Spline', category: 'Sans', family: '"Spline Sans", sans-serif' },
            { id: 'space-grotesk', name: 'Space Grotesk', category: 'Sans', family: '"Space Grotesk", sans-serif' },
            { id: 'bricolage', name: 'Bricolage', category: 'Sans', family: '"Bricolage Grotesque", sans-serif' },
            // SERIF
            { id: 'playfair', name: 'Playfair', category: 'Serif', family: '"Playfair Display", serif' },
            { id: 'cormorant', name: 'Cormorant', category: 'Serif', family: '"Cormorant Garamond", serif' },
            { id: 'lora', name: 'Lora', category: 'Serif', family: '"Lora", serif' },
            { id: 'fraunces', name: 'Fraunces', category: 'Serif', family: '"Fraunces", serif' },
            { id: 'newsreader', name: 'Newsreader', category: 'Serif', family: '"Newsreader", serif' },
            { id: 'bodoni', name: 'Bodoni', category: 'Serif', family: '"Bodoni Moda", serif' },
            // DISPLAY & POP
            { id: 'syne', name: 'Syne', category: 'Display', family: '"Syne", sans-serif' },
            { id: 'cinzel', name: 'Cinzel', category: 'Display', family: '"Cinzel", serif' },
            { id: 'bebas-neue', name: 'Bebas Neue', category: 'Display', family: '"Bebas Neue", sans-serif' },
            { id: 'righteous', name: 'Righteous', category: 'Display', family: '"Righteous", size-adjust' },
            { id: 'archivo-black', name: 'Archivo Black', category: 'Display', family: '"Archivo Black", sans-serif' },
            // MONOSPACE
            { id: 'space-mono', name: 'Space Mono', category: 'Mono', family: '"Space Mono", monospace' },
            { id: 'jetbrains-mono', name: 'JetBrains', category: 'Mono', family: '"JetBrains Mono", monospace' },
            { id: 'ibm-plex-mono', name: 'IBM Plex', category: 'Mono', family: '"IBM Plex Mono", monospace' },
            // BRUSH & FUN
            { id: 'permanent-marker', name: 'Marker', category: 'Brush', family: '"Permanent Marker", cursive' },
            { id: 'sedgwick-ave', name: 'Graffiti', category: 'Brush', family: '"Sedgwick Ave", cursive' },
            { id: 'caveat-brush', name: 'Paintbrush', category: 'Brush', family: '"Caveat Brush", cursive' },
            { id: 'kalam', name: 'Casual Ink', category: 'Brush', family: '"Kalam", cursive' }
        ];

        export const getFontFamily = (id) => {
            const font = FONT_OPTIONS.find(f => f.id === id);
            return font ? font.family : '"Inter", sans-serif';
        };
