module.exports = function(wallaby) {
  return {
    files: [
      'src/**/*.js',
      'lib/**/*.js'
    ],
    tests: [
      'test/**/*.test.js'
    ],

    env: {
      type  : 'node',
      runner: 'node'
    },

    compilers: {
      '**/*.js?(x)': wallaby.compilers.babel()
    },

    testFramework: 'jest',

    debug: true
  }
}
