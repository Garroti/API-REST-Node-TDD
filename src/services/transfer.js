const ValidationError = require('../errors/ValidationError')
const transfers = require('../routes/transfers')

module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers')
            .where(filter)
            .select()
    }

    const findById = (filter = {}) => {
      return app.db('transfers')
          .where(filter)
          .first()
    }

    const validate = async (transfer) => {
      if(!transfer.description) throw new ValidationError('Descrição é um atributo obrigatório')
      if(!transfer.ammount) throw new ValidationError('Valor é um atributo obrigatório')
      if(!transfer.date) throw new ValidationError('Data é um atributo obrigatório')
      if(!transfer.acc_ori_id) throw new ValidationError('Conta de origem é um atributo obrigatório')
      if(!transfer.acc_dest_id) throw new ValidationError('Conta de destino é um atributo obrigatório')
      if(transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('Conta de destino é a mesma de origem')

      const accounts = await app.db('accounts').whereIn('id', [transfer.acc_ori_id, transfer.acc_dest_id])
      accounts.forEach(el => { 
        if(el.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError('Conta pertence ao outro usuario') 
      });
    }

    const save = async (transfer) => {

      const result = await app.db('transfers').insert(transfer, '*')
      const transferId = result[0].id

      const transactions = [
        { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId, status: true },
        { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: transferId, status: true }
      ]

      await app.db('transactions').insert(transactions)
      return result
    }

    const update = async (id, transfer) => {

      const result = await app.db('transfers').where({id}).update(transfer, '*')

      const transactions = [
        { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: id },
        { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, ammount: transfer.ammount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: id }
      ]
  
      await app.db('transactions').where({transfer_id: id}).del()
      await app.db('transactions').insert(transactions)
      return result
    }

    const remove = async (id) => {
      await app.db('transactions').where({transfer_id: id}).del()
      return app.db('transfers').where({id}).del()
    }



    return { find, findById, save, update, remove, validate }
}