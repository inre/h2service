const combineServices = (...newServices) => {
  if (newServices.length === 0) {
    return () => () => {}
  }

  if (newServices.length === 1) {
    return newServices[0]
  }

  return (...args) => {
    const services = newServices.map(newService => newService(...args))
    return (message, ...params) => {
      for (let service of services) {
        const result = service(message, ...params)
        if (result !== undefined) {
          return result
        }
      }
    }
  }
}

module.exports = combineServices
