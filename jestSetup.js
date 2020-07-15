const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
