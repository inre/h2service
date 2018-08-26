const { get } = require('lodash')

const dispencer = map => (message, ...args) => {
  const callee = get(message, 'call', 'missing')
  if (map.hasOwnProperty(callee)) {
    const fn = map[callee]
    return fn(message, ...args)
  }
  return undefined
}

module.exports = dispencer
