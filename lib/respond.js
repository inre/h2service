
const error = (err) => {
  return {
    'data': null,
    'error': {
      'message': err.toString()
    }
  }
}

const blank = () => {
  return {
    'data': null,
    'error': null
  }
}

const data = (dt) => {
  return {
    'data': dt,
    'error': null
  }
}

module.exports = {
  error,
  blank,
  data
}
