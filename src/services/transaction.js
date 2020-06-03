const ValidationError = require('../errors/ValidationError')

module.exports = (app) => {
    const find = (userId, filter = {}) => {
        return app.db('transactions')
            .join('accounts', 'accounts.id', 'acc_id')
            .where(filter)
            .andWhere('accounts.user_id', '=', userId)
            .select()
    }

    const save = (transaction) => {

        if(!transaction.description) throw new ValidationError('Descrição é um atributo obrigatório')
        if(!transaction.ammount) throw new ValidationError('Valor é um atributo obrigatório')
        if(!transaction.date) throw new ValidationError('Data é um atributo obrigatório')
        if(!transaction.acc_id) throw new ValidationError('Conta é um atributo obrigatório')
        if(!transaction.type) throw new ValidationError('Tipo é um atributo obrigatório')
        if(!(transaction.type === 'I' || transaction.type === 'O')) throw new ValidationError('Tipo deve ser entrada ou saida (I ou O)')

        if((transaction.type === 'I' && transaction.ammount < 0) || (transaction.type === 'O' && transaction.ammount > 0)) {
            transaction.ammount *= -1
        }

        return app.db('transactions')
            .insert(transaction, '*')
    }

    const findById = (filter) => {
        return app.db('transactions').where(filter).first()
    }

    const update = (id, transaction) => {
        return app.db('transactions')
            .where({id})
            .update(transaction, '*')
    }

    const remove = (id) => {
        return app.db('transactions')
            .where(id)
            .del()
    }

    return { find, save, findById, update, remove }
}