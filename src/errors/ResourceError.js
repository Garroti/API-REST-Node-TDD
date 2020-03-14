module.exports = function ResourceError(message = 'Este recurso não pertence ao usuario') {
    this.name = 'resourceError'
    this.message = message
}