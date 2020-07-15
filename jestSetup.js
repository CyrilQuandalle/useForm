import '@testing-library/jest-dom/extend-expect';

const originalError = console.error;
beforeAll(() => {
    originalError.call(console, ...args);
  }
})

afterAll(() => {
  console.error = originalError;
});
