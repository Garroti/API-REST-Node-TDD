
const moment = require('moment')

exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex('users').insert([
    { id: 10100, name: 'User 3', mail: 'user3@mail.com', password: '$2a$10$tFLo3/O5Fd.g.zkC3sQTF.4kbU1tYSIl/91JlX9g3EsZvIVFODydK' },
    { id: 10101, name: 'User 4', mail: 'user4@mail.com', password: '$2a$10$tFLo3/O5Fd.g.zkC3sQTF.4kbU1tYSIl/91JlX9g3EsZvIVFODydK' },
    { id: 10102, name: 'User 5', mail: 'user5@mail.com', password: '$2a$10$tFLo3/O5Fd.g.zkC3sQTF.4kbU1tYSIl/91JlX9g3EsZvIVFODydK' }
  ])
  .then(() => knex('accounts').insert([
    { id: 10100, name: 'Acc Saldo Principal', user_id: 10100 },
    { id: 10101, name: 'Acc Saldo Secundario', user_id: 10100 },
    { id: 10102, name: 'Acc Alternativa 1', user_id: 10101 },
    { id: 10103, name: 'Acc Alternativa 2', user_id: 10101 },
    { id: 10104, name: 'Acc Geral Principal', user_id: 10102 },
    { id: 10105, name: 'Acc Geral Secundario', user_id: 10102 },
  ]))
  .then(() => knex('transfers').insert([
    { id: 10100, description: 'Transfer 1', user_id: 10102, acc_ori_id: 10105, acc_dest_id: 10104, ammount: 256, date: new Date() },
    { id: 10101, description: 'Transfer 2', user_id: 10101, acc_ori_id: 10102, acc_dest_id: 10103, ammount: 512, date: new Date() },
  ]))
  .then(() => knex('transactions').insert([
    // Trasação positiva / saldo = 2
    { description: '2', date: new Date(), ammount: 2, type: 'I', acc_id: 10104, status: true },
    // Trasação usuario errado / saldo = 2
    { description: '2', date: new Date(), ammount: 4, type: 'I', acc_id: 10102, status: true },
    // Trasação usuario errado / saldo = 2 / saldo = 8
    { description: '2', date: new Date(), ammount: 8, type: 'I', acc_id: 10105, status: true },
    // Trasação Pendente / saldo = 2 / saldo = 8
    { description: '2', date: new Date(), ammount: 16, type: 'I', acc_id: 10104, status: false },
    // Trasação passada / saldo = 34 / saldo = 8
    { description: '2', date: moment(new Date()).subtract(5, 'days').toDate(), ammount: 32, type: 'I', acc_id: 10104, status: true },
    // Trasação futura / saldo = 34 / saldo = 8
    { description: '2', date: moment(new Date()).add(5, 'days').toDate(), ammount: 64, type: 'I', acc_id: 10104, status: true },
    // Trasação negotiva / saldo = -96 / saldo = 8
    { description: '2', date: new Date(), ammount: -128, type: 'O', acc_id: 10104, status: true },
    // Transferencia / saldo = 162 / saldo = -248
    { description: '2', date: new Date(), ammount: 256, type: 'I', acc_id: 10104, status: true },
    { description: '2', date: new Date(), ammount: -256, type: 'O', acc_id: 10105, status: true },
    // Transferencia / saldo = 162 / saldo = -248
    { description: '2', date: new Date(), ammount: 512, type: 'I', acc_id: 10102, status: true },
    { description: '2', date: new Date(), ammount: -512, type: 'O', acc_id: 10103, status: true },
  ]))
};
