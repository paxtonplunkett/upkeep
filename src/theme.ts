export const colors = {
  background: '#FBF7F2',
  surface: '#FFFFFF',
  text: '#221A1F',
  muted: '#7A6E74',
  border: '#ECE3DA',
  accent: '#7B2D52',
  accentSoft: '#F4E6EC',
  liked: '#2F7A55',
  fine: '#B07D1E',
  disliked: '#B23B3B',
};

export const sentimentLabel = {
  liked: 'Liked it',
  fine: 'It was fine',
  disliked: "Didn't like it",
} as const;

export const sentimentColor = {
  liked: colors.liked,
  fine: colors.fine,
  disliked: colors.disliked,
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };
