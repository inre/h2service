const http2 = require('http2')
const { encode, decode } = require('./de')
const { error } = require('./respond')
const combineServices = require('./combine-services')
const util = require('util')

const serviceMap = new Map()

const createService = (...newServices) => {
  let logger = createDefaultLogger()
  const newService = combineServices(...newServices)
  const server = http2.createServer()

  server.on('error', (e) => {
    logger.error(e)
    server.close()
  })
  server.on('close', () => {
    logger.trace('closed')
  })

  server.on('stream', (stream, headers) => {
    if (!serviceMap.has(stream.session)) {
      serviceMap.set(stream.session, newService(stream.session, stream))
      stream.session.on('close', () => serviceMap.delete(stream.session))
    }

    const service = serviceMap.get(stream.session, 0)
    let input = ''

    stream.on('data', chunk => {
      input += chunk
    })

    stream.on('end', () => {
      call(input, stream, service, logger)
    })
  })

  // TODO: reject
  const listen = (port, host) =>
    new Promise((resolve) =>
      server.listen(port, host, resolve)
    )

  const close = () => {
    const serverClose = () => util.promisify(server.close())

    return serverClose().then(() =>
      Promise.all(serviceMap.map((service) =>
        util.promisify(service.close)()
      ))
    )
  }

  const setLogger = (newLogger) => {
    logger = newLogger
  }

  return {
    listen,
    close,
    setLogger
  }
}

const call = async (input, stream, service, logger) => {
  const im = decode(input)
  let om

  try {
    logger.trace(`in ${input}`)
    om = await service(im, stream)
  } catch (reason) {
    logger.error(reason)
    om = error(reason)
  }
  if (om !== false) {
    const output = encode(om)
    respond(output, stream, logger)
  }
}

const respond = (output, stream, logger) => {
  logger.trace(`out ${output}`)
  stream.respond({
    'content-type': 'application/json',
    ':status': 200
  })
  stream.end(output)
}

const createDefaultLogger = () => {
  return {
    trace: (_) => require('debug')('h2service:trace'),
    error: (_) => require('debug')('h2service:error')
  }
}

module.exports = createService
