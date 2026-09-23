import { Platform, type ViewStyle } from 'react-native';

const card = Platform.select<ViewStyle>({
  web: {
    boxShadow: '0 8px 18px rgba(23, 36, 77, 0.08)',
  },
  default: {
    shadowColor: '#17244D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
});

const button = Platform.select<ViewStyle>({
  web: {
    boxShadow: '0 4px 8px rgba(56, 82, 208, 0.18)',
  },
  default: {
    shadowColor: '#3852D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
});

export const shadows = Object.freeze({ card, button });
