const ValidationError = require('../errors/ValidationError')

module.exports = (app) => {
    const save = async (account) => {
        if(!account.name) throw new ValidationError('Nome é um atributo obrigatorio')

        return app.db('accounts').insert(account, '*')
    }

    const findAll = () => {
        return app.db('accounts')
    }

    const find = (id = {}) => {
        return app.db('accounts').where(id).first()
    }

    const update = (id, account) => {
        return app.db('accounts').where(id).update(account, '*')
    }

    const remove = (id) => {
        return app.db('accounts').where(id).del()
    }

    return { save, findAll, find, update, remove }
}