import chakraTheme from '@chakra-ui/theme';

export const theme = {
  ...chakraTheme,
  styles: {
    ...chakraTheme.styles,
    global: {
      ...chakraTheme.styles.global,
    },
  },
  colors: {
    ...chakraTheme.colors,
    blue: {
      50: '#edf9ff',
      100: '#ddf3ff',
      200: '#afd7ff',
      300: '#7ebcff',
      400: '#4da1ff',
      500: '#2086fe',
      600: '#0a6ce5',
      700: '#0054b3',
      800: '#003c81',
      900: '#002450',
    },
    cyan: {
      50: '#edfcff',
      100: '#dcfaff',
      200: '#b4eafb',
      300: '#89daf4',
      400: '#5dccee',
      500: '#36bde8',
      600: '#20a4cf',
      700: '#117fa2',
      800: '#035b75',
      900: '#003848',
    },
    grey: '#A0B6D7',
    background: '#EEF4FD',
    greyText: '#75818D',
    modalBG: 'rgba(98, 118, 148, 0.9)',
  },
  fonts: {
    ...chakraTheme.fonts,
    body: 'Roboto, sans-serif',
  },
};
