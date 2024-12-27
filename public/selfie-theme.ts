import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { Brown, CoconutWhite, PrimaryGreen } from './palettes';

export const SelfieTheme = definePreset(Aura, {
  semantic: {
    primary: PrimaryGreen,
    coconutWhite: CoconutWhite,
    colorScheme: {
      light: {
        content: {
            background: '{coconutWhite.400}' 
        },
        background: '{coconutWhite.200}',
        primary: {
          color: '{primary.500}',
          inverseColor: '{primary.50}',
          hoverColor: Brown[800],
          activeColor: Brown[800],
        },
        highlight: {
          background: CoconutWhite[950],
          focusBackground: CoconutWhite[700],
          color: CoconutWhite[0],
          focusColor: CoconutWhite[0],
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{coconutWhite.800}',
          900: '{coconutWhite.900}',
          950: '{coconutWhite.950}',
        },
      },
      dark: {
        primary: {
          color: '{primary.500}',
          inverseColor: Brown[100],
          hoverColor: Brown[50],
          activeColor: '#F0EAD2',
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        background: '{surface.950}',
        surface: Brown,
      },
    },
    components: {
      card: {
        colorScheme: {
          light: {
            root: {
              color: '{surface.700}',
            },
            subtitle: {
              color: '{surface.500}',
            },
          },
          dark: {
            root: {
              background: '{surface.900}',
              color: '{surface.0}',
            },
            subtitle: {
              color: '{surface.400}',
            },
          },
        },
      },
    },
  },
});
