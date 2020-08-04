module.exports = {
  presets:[
    [
      '@babel/preset-env',
      {
        targets: {
          node: '12'
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    [ 'module-resolver', {
      alias: {
        '@modelss': './src/models',
        '@controller': './src/controller'
      }
    }]
  ],
  ignore: [
    '**/*.spec.ts'
  ]
}