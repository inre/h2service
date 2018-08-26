const { createService } = require('../lib')
const pingService = require('./services/ping-service')

const service = createService(pingService)

service.listen(4440).then(() => console.log('Service listening on port 4440'))
