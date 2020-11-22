const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/api/transfers'
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDAwIiwibmFtZSI6IlVzZXIgMSIsIm1haWwiOiJ1c2VyMUBtYWlsLmNvbSJ9.o1vQ6Ktz8D6Q7Oml-kIN3LkTEVfL4efTXnQ4VMypw-o'

beforeAll(async() => {
    // await app.db.migrate.rollback()
    // await app.db.migrate.latest()
    await app.db.seed.run()
})

test('Deve listar apenas as transferencias do usuario', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1)
            expect(res.body[0].description).toBe('Transfer 1')
        })
})

describe('Ao salvar uma transferencia valida... ', () => {
  let transferId
  let income
  let outcome

  test('Deve retornar o status 201 e os dados da transferencia', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ description: 'Regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
          .then( async (res) => {
            expect(res.status).toBe(201)
            expect(res.body.description).toBe('Regular transfer')
            transferId = res.body.id
          })
  })

  test('As transações equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount')
    expect(transactions).toHaveLength(2)
    outcome = transactions[0]
    income = transactions[1]
  })

  test('A transaçao de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001')
    expect(outcome.ammount).toBe('-100.00')
    expect(outcome.acc_id).toBe(10000)
    expect(outcome.type).toBe('O')
  })

  test('A transaçao de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000')
    expect(income.ammount).toBe('100.00')
    expect(income.acc_id).toBe(10001)
    expect(income.type).toBe('I')
  })

  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(outcome.transfer_id).toBe(transferId)
    expect(income.transfer_id).toBe(transferId)
  })

  test('Ambas devem estar com status de realizadas', () => {
    expect(outcome.status).toBe(true)
    expect(income.status).toBe(true)
  })

})

describe('Ao alterar uma transferncia valida... ', () => {

  let validTransfer
  beforeAll(() => {
    validTransfer = { description: 'Regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() }
  })

  const testTemplate = (newData, errorMessage) => {
      return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${TOKEN}`)
      .send({ ...validTransfer, ...newData })
      .then((res) => {
          expect(res.status).toBe(400)
          expect(res.body.error).toBe(errorMessage)
      })
  }

  test('Não deve inserir sem descrição', () => testTemplate({ description: null }, 'Descrição é um atributo obrigatório'))
  test('Não deve inserir sem valor', () => testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'))
  test('Não deve inserir sem data', () => testTemplate({ date: null }, 'Data é um atributo obrigatório'))
  test('Não deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Conta de origem é um atributo obrigatório'))
  test('Não deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Conta de destino é um atributo obrigatório'))
  test('Não deve inserir se as contas de origem forem as mesmas', () => testTemplate({ acc_dest_id: 10000 }, 'Conta de destino é a mesma de origem'))
  test('Não deve inserir se as contas pertencerem a outro usuario', () => testTemplate({ acc_ori_id: 10002 }, 'Conta pertence ao outro usuario'))
})

test('Deve retornar uma transferencia por Id', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.description).toBe('Transfer 1')
        })
})

describe('Ao tentar salvar uma transferencia invalida... ', () => {
  let transferId
  let income
  let outcome

  test('Deve retornar o status 200 e os dados da transferencia', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ description: 'Update transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 500, date: new Date() })
          .then( async (res) => {
            expect(res.status).toBe(200)
            expect(res.body.description).toBe('Update transfer')
            expect(res.body.ammount).toBe('500.00')
            transferId = res.body.id
          })
  })

  test('As transações equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount')
    expect(transactions).toHaveLength(2)
    outcome = transactions[0]
    income = transactions[1]
  })

  test('A transaçao de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001')
    expect(outcome.ammount).toBe('-500.00')
    expect(outcome.acc_id).toBe(10000)
    expect(outcome.type).toBe('O')
  })

  test('A transaçao de entrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000')
    expect(income.ammount).toBe('500.00')
    expect(income.acc_id).toBe(10001)
    expect(income.type).toBe('I')
  })

  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(outcome.transfer_id).toBe(transferId)
    expect(income.transfer_id).toBe(transferId)
  })

})

describe('Ao tentar alterar uma transferncia invalida... ', () => {

  let validTransfer
  beforeAll(() => {
    validTransfer = { description: 'Regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() }
  })

  const testTemplate = (newData, errorMessage) => {
      return request(app).put(`${MAIN_ROUTE}/10000`).set('authorization', `bearer ${TOKEN}`)
      .send({ ...validTransfer, ...newData })
      .then((res) => {
          expect(res.status).toBe(400)
          expect(res.body.error).toBe(errorMessage)
      })
  }

  test('Não deve inserir sem descrição', () => testTemplate({ description: null }, 'Descrição é um atributo obrigatório'))
  test('Não deve inserir sem valor', () => testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'))
  test('Não deve inserir sem data', () => testTemplate({ date: null }, 'Data é um atributo obrigatório'))
  test('Não deve inserir sem conta de origem', () => testTemplate({ acc_ori_id: null }, 'Conta de origem é um atributo obrigatório'))
  test('Não deve inserir sem conta de destino', () => testTemplate({ acc_dest_id: null }, 'Conta de destino é um atributo obrigatório'))
  test('Não deve inserir se as contas de origem forem as mesmas', () => testTemplate({ acc_dest_id: 10000 }, 'Conta de destino é a mesma de origem'))
  test('Não deve inserir se as contas pertencerem a outro usuario', () => testTemplate({ acc_ori_id: 10002 }, 'Conta pertence ao outro usuario'))
})

describe('Ao remover uma transferencia', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204)
      })
  })

  test('O registro deve ser apagado do banco', () => {
    return app.db('transfers').where({id: 10000})
      .then((result) => {
        expect(result).toHaveLength(0)
      })
  })

  test('As transações associadas devem ter sido removidas', () => {
    return app.db('transactions').where({transfer_id: 10000})
      .then((result) => {
        expect(result).toHaveLength(0)
      })
  })
})

test('Não deve retornar transferencia de outro usuario', () => {
  return request(app).get(`${MAIN_ROUTE}/10001`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Este recurso não pertence ao usuario')
    })
})