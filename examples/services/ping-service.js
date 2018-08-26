const { dispenser } = require('../../lib')

const pong = {
  data: 'pong',
  error: null
}

const shutdown = (session) => {
  if (!session.destroyed) {
    session.shutdown({
      graceful: true
    }, () => {
      console.log('destroy')
      session.destroy()
    })
  }
}

const timeout = (session) =>
  setTimeout(() => shutdown(session), 2000)

const pingService = session => {
  let timerId = timeout(session)

  const ping = async (message, stream) => {
    clearTimeout(timerId)
    timerId = timeout(stream.session)
    return pong
  }
  const missing = async () => console.log('missing call')

  return dispenser({
    ping,
    missing
  })
}

module.exports = pingService
