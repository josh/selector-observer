const user       = process.env.SAUCE_USER
    , key        = process.env.SAUCE_KEY
    , path       = require('path')
    , brtapsauce = require('brtapsauce')

      // list of browsers & versions that you want to test
    , capabilities = [
          { browserName: 'safari',            platform: 'OS X 10.8',   version: '6'  }
        , { browserName: 'safari',            platform: 'OS X 10.9',   version: '7'  }
        , { browserName: 'safari',            platform: 'OS X 10.10',  version: '8'  }
        , { browserName: 'chrome',            platform: 'OS X 10.10',  version: ''   }
        , { browserName: 'firefox',           platform: 'OS X 10.10',  version: ''   }

        , { browserName: 'internet explorer', platform: 'Windows 7',   version: '9'  }
        , { browserName: 'internet explorer', platform: 'Windows 8',   version: '10' }
        , { browserName: 'internet explorer', platform: 'Windows 8.1', version: '11' }

        // The following tests are failing with sauce labs related errors

        // , { browserName: 'internet explorer', platform: 'Windows 7',  version: '8'  }

        // , { browserName: 'iphone',            platform: 'OS X 10.10',  version: '7.1' }
        // , { browserName: 'iphone',            platform: 'OS X 10.10',  version: '8.1' }

        // , { browserName: 'android',           platform: 'Linux',       version: '4.3' }
        // , { browserName: 'android',           platform: 'Linux',       version: '4.4' }
        // , { browserName: 'android',           platform: 'Linux',       version: '5.0' }
      ]

if (!user)
  throw new Error('Must set a SAUCE_USER env var')
if (!key)
  throw new Error('Must set a SAUCE_KEY env var')

brtapsauce({
    name         : 'selector-observer'
  , user         : user
  , key          : key
  , brsrc        : path.join(__dirname, 'index.js')
  , capabilities : capabilities
})