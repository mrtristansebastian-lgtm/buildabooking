// --- 50 FONT TYPOGRAPHY MASTER LIST ---
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
            { id: 'montserrat', name: 'Montserrat', category: 'Sans', family: '"Montserrat", sans-serif' },
            { id: 'poppins', name: 'Poppins', category: 'Sans', family: '"Poppins", sans-serif' },
            { id: 'work-sans', name: 'Work Sans', category: 'Sans', family: '"Work Sans", sans-serif' },
            { id: 'roboto', name: 'Roboto', category: 'Sans', family: '"Roboto", sans-serif' },
            { id: 'source-sans-3', name: 'Source Sans 3', category: 'Sans', family: '"Source Sans 3", sans-serif' },
            { id: 'urbanist', name: 'Urbanist', category: 'Sans', family: '"Urbanist", sans-serif' },
            { id: 'rubik', name: 'Rubik', category: 'Sans', family: '"Rubik", sans-serif' },
            { id: 'nunito-sans', name: 'Nunito Sans', category: 'Sans', family: '"Nunito Sans", sans-serif' },
            { id: 'figtree', name: 'Figtree', category: 'Sans', family: '"Figtree", sans-serif' },
            { id: 'lexend', name: 'Lexend', category: 'Sans', family: '"Lexend", sans-serif' },
            { id: 'ibm-plex-sans', name: 'IBM Plex Sans', category: 'Sans', family: '"IBM Plex Sans", sans-serif' },
            { id: 'public-sans', name: 'Public Sans', category: 'Sans', family: '"Public Sans", sans-serif' },
            // SERIF
            { id: 'playfair', name: 'Playfair', category: 'Serif', family: '"Playfair Display", serif' },
            { id: 'cormorant', name: 'Cormorant', category: 'Serif', family: '"Cormorant Garamond", serif' },
            { id: 'lora', name: 'Lora', category: 'Serif', family: '"Lora", serif' },
            { id: 'fraunces', name: 'Fraunces', category: 'Serif', family: '"Fraunces", serif' },
            { id: 'newsreader', name: 'Newsreader', category: 'Serif', family: '"Newsreader", serif' },
            { id: 'bodoni', name: 'Bodoni', category: 'Serif', family: '"Bodoni Moda", serif' },
            { id: 'libre-baskerville', name: 'Libre Baskerville', category: 'Serif', family: '"Libre Baskerville", serif' },
            { id: 'merriweather', name: 'Merriweather', category: 'Serif', family: '"Merriweather", serif' },
            { id: 'prata', name: 'Prata', category: 'Serif', family: '"Prata", serif' },
            { id: 'spectral', name: 'Spectral', category: 'Serif', family: '"Spectral", serif' },
            { id: 'marcellus', name: 'Marcellus', category: 'Serif', family: '"Marcellus", serif' },
            // DISPLAY & POP
            { id: 'syne', name: 'Syne', category: 'Display', family: '"Syne", sans-serif' },
            { id: 'cinzel', name: 'Cinzel', category: 'Display', family: '"Cinzel", serif' },
            { id: 'bebas-neue', name: 'Bebas Neue', category: 'Display', family: '"Bebas Neue", sans-serif' },
            { id: 'righteous', name: 'Righteous', category: 'Display', family: '"Righteous", sans-serif' },
            { id: 'archivo-black', name: 'Archivo Black', category: 'Display', family: '"Archivo Black", sans-serif' },
            { id: 'abril-fatface', name: 'Abril Fatface', category: 'Display', family: '"Abril Fatface", serif' },
            { id: 'anton', name: 'Anton', category: 'Display', family: '"Anton", sans-serif' },
            { id: 'oswald', name: 'Oswald', category: 'Display', family: '"Oswald", sans-serif' },
            { id: 'unbounded', name: 'Unbounded', category: 'Display', family: '"Unbounded", sans-serif' },
            // MONOSPACE
            { id: 'space-mono', name: 'Space Mono', category: 'Mono', family: '"Space Mono", monospace' },
            { id: 'jetbrains-mono', name: 'JetBrains', category: 'Mono', family: '"JetBrains Mono", monospace' },
            { id: 'ibm-plex-mono', name: 'IBM Plex Mono', category: 'Mono', family: '"IBM Plex Mono", monospace' },
            { id: 'roboto-mono', name: 'Roboto Mono', category: 'Mono', family: '"Roboto Mono", monospace' },
            { id: 'source-code-pro', name: 'Source Code Pro', category: 'Mono', family: '"Source Code Pro", monospace' },
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
