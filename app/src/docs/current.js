// TODO: Remove this file when docs are production-ready.
module.exports = (process.env.DOCS === 'on' ?
    require('./index.jsx') : require('./stub.jsx') // eslint-disable-line global-require
).default
