import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { Brown, ChocolateBrown, CoconutWhite, LightGreen, PrimaryGreen } from './palettes';

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
          color: CoconutWhite[50],
          focusColor: CoconutWhite[50],
        },
        surface: ChocolateBrown
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
