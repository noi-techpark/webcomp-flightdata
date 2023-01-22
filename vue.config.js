const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  productionSourceMap: false,
  transpileDependencies: [
    'vuetify'
  ],
  css: {
    loaderOptions: {
      css: {
        import: true
      }
    }
  }
})

