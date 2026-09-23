module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/tests'],
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
