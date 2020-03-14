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
    [user1, user2] = users
    delete user1.password
    user1.token = jwt.encode(user, variables.Security.secretKey)

    const accs = await app.db('accounts').insert([
        { name: 'Acc 1', user_id: user1.id },
        { name: 'Acc 2', user_id: user2.id },
    ], '*')
    [accUser1, accUser2] = accs
})

test('Deve listar apenas as transações do usuario', () => {
    return app.db('transactions').insert([
        { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser1.id },
        { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id },
    ])
    .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user1.token}`))
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1)
            expect(res.body.description).toBe('T1')
        })
})