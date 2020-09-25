module.exports = {
    compilers: {
      solc: {
        version: "^0.6.0",
        settings: {
            optimizer: {
              enabled: true,
              runs: 999999999
            }
          }
      }
    }
  }