const request = require('supertest')
const app = require('../../src/app')
const jwt = require('jwt-simple')
const variables = require('../../src/config/variables')

const MAIN_ROUTE = '/api/transactions'

let user1
let user2
let accUser1
let accUser2

beforeAll( async () => {
    await app.db('transactions').del()
    await app.db('accounts').del()
    await app.db('users').del()
    
    const users = await app.db('users').insert([
        { name: 'User 1', mail: 'user1@mail.com', password: '$2a$10$tFLo3/O5Fd.g.zkC3sQTF.4kbU1tYSIl/91JlX9g3EsZvIVFODydK' },
        { name: 'User 2', mail: 'user2@mail.com', password: '$2a$10$tFLo3/O5Fd.g.zkC3sQTF.4kbU1tYSIl/91JlX9g3EsZvIVFODydK' }
    ], '*')
    user1 = users[0] 
    user2 = users[1]
    delete user1.password
    user1.token = jwt.encode(user1, variables.Security.secretKey)

    const accs = await app.db('accounts').insert([
        { name: 'Acc 1', user_id: user1.id },
        { name: 'Acc 2', user_id: user2.id },
    ], '*')
    accUser1 = accs[0]
    accUser2 = accs[1]
})

test('Deve listar apenas as transações do usuario', () => {
    return app.db('transactions').insert([
        { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id },
        { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id },
    ])
    .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1)
            expect(res.body[0].description).toBe('T1')
        }))
})

test('Deve funcionar com snnipets', () => {
    return request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body[0].description).toBe('T1')
        })
})

test('Deve inserir uma transação com sucesso', () => {
    return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`)
        .send({ description: 'New T', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.acc_id).toBe(accUser1.id)
            expect(res.body.ammount).toBe('100.00')
        })
})

test('Transações de entrada devem ser positivas', () => {
    return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`)
        .send({ description: 'New T', date: new Date(), ammount: -100, type: 'I', acc_id: accUser1.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.acc_id).toBe(accUser1.id)
            expect(res.body.ammount).toBe('100.00')
        })
})

test('Transações de saida devem ser negativas', () => {
    return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`)
        .send({ description: 'New T', date: new Date(), ammount: 100, type: 'O', acc_id: accUser1.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.acc_id).toBe(accUser1.id)
            expect(res.body.ammount).toBe('-100.00')
        })
})

describe('Ao tentar inserir uma transação válida', () => {

    let validTransaction
    beforeAll(() => {
        validTransaction = { description: 'Desc', date: new Date(), ammount: 100, type: 'O', acc_id: accUser1.id }
    })

    const testTemplate = (newData, errorMessage) => {
        return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`)
        .send({ ...validTransaction, ...newData })
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe(errorMessage)
        })
    }

    test('Não deve inserir sem descrição', () => testTemplate({ description: null }, 'Descrição é um atributo obrigatório'))
    test('Não deve inserir sem valor', () => testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'))
    test('Não deve inserir sem data', () => testTemplate({ date: null }, 'Data é um atributo obrigatório'))
    test('Não deve inserir sem conta', () => testTemplate({ acc_id: null }, 'Conta é um atributo obrigatório'))
    test('Não deve inserir sem tipo', () => testTemplate({ type: null }, 'Tipo é um atributo obrigatório'))
    test('Não deve inserir tipo inválido', () => testTemplate({ type: 'A' }, 'Tipo deve ser entrada ou saida (I ou O)'))

})

test('Deve alterar uma transação por ID', () => {
    return app.db('transactions').insert(
        { description: 'To update', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id }, ['id']
    ).then(result => request(app).put(`${MAIN_ROUTE}/${result[0].id}`)
    .set('authorization', `bearer ${user1.token}`)
    .send({ description: 'alterada' })
    .then((res) => {
        expect(res.status).toBe(200)
        expect(res.body.description).toBe('alterada')
    }))
})

test('Deve remover uma transação', () => {
    return app.db('transactions').insert(
        { description: 'To delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id }, ['id']
    ).then(result => request(app).delete(`${MAIN_ROUTE}/${result[0].id}`)
    .set('authorization', `bearer ${user1.token}`)
    .then((res) => {
        expect(res.status).toBe(204)
    }))
})

test('Não deve remover uma transação', () => {
    return app.db('transactions').insert(
        { description: 'To delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser2.id }, ['id']
    ).then(result => request(app).delete(`${MAIN_ROUTE}/${result[0].id}`)
    .set('authorization', `bearer ${user1.token}`)
    .then((res) => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('Este recurso não pertence ao usuario')
    }))
})