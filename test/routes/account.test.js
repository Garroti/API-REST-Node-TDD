const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/accounts'
let user

beforeAll( async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, password: '123456' })
    user = { ...res[0] }
})

test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({name: 'Acc #1', user_id: user.id})
        .then((result) => {
            expect(result.status).toBe(201)
            expect(result.body.name).toBe('Acc #1')
        })
})

test('Não deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({user_id: user.id})
        .then((result) => {
            expect(result.status).toBe(400)
            expect(result.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('Deve listar todas as contas', () => {
    return app.db('accounts')
        .insert({name: 'Acc list', user_id: user.id})
        .then(() => request(app).get(MAIN_ROUTE))
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.length).toBeGreaterThan(0)
        })
})

test('Deve retornar uma conta por id', () => {
    return app.db('accounts')
        .insert({name: 'Acc id', user_id: user.id}, ['id'])
        .then(account => request(app).get(`${MAIN_ROUTE}/${account[0].id}`))
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Acc id')
            expect(res.body.user_id).toBe(user.id)
        })
})

test('Deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({name: 'Acc update', user_id: user.id}, ['id'])
        .then(account => request(app).put(`${MAIN_ROUTE}/${account[0].id}`).send({name: 'Acc updated'}))   
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Acc updated')
        })
})

test('Deve remover uma conta', () => {
    return app.db('accounts')
        .insert({name: 'Acc remove', user_id: user.id}, ['id'])
        .then(account => request(app).delete(`${MAIN_ROUTE}/${account[0].id}`))
        .then((res) => {
            expect(res.status).toBe(204)
        })
})
