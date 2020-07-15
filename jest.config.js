require('regenerator-runtime/runtime');
const { defaults } = require('jest-config');
module.exports = {
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'jsx'],
  moduleNameMapper: {
    '^.+\\.(css|scss|svg)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['./jestSetup.js']
};
