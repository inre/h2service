const { createService, dispencer } = require('../lib')

const service = createService(newService)

service.listen(4440).then(() => console.log('Service listening on port 4440'))
