const request = require('supertest')
const app = require('../../src/app')
const jwt = require('jwt-simple')
const variables = require('../../src/config/variables')

const MAIN_ROUTE = '/api/accounts'
let user
let user2

beforeEach( async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, password: '123456' })
    user = { ...res[0] }
    user.token = jwt.encode(user, variables.Security.secretKey)

    const res2 = await app.services.user.save({ name: 'User Account 2', mail: `${Date.now()}@mail.com`, password: '123456' })
    user2 = { ...res2[0] }
})

test('Deve listar apenas as contas do usuario', () => {
    return app.db('accounts').insert([
        {name: 'Acc user 1', user_id: user.id},
        {name: 'Acc user 2', user_id: user2.id}
    ])
    .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`))
    .then((result) => {
        expect(result.status).toBe(200)
        expect(result.body.length).toBe(1)
        expect(result.body[0].name).toBe('Acc user 1')
    })
})

test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({name: 'Acc #1'})
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(201)
            expect(result.body.name).toBe('Acc #1')
        })
})

test('Não deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({})
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(400)
            expect(result.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('Não deve inserir uma conta de nome duplicado para o mesmo usuario', () => {
    return app.db('accounts').insert({name: 'Acc duplicada', user_id: user.id})
        .then(() => request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
            .send({name: 'Acc duplicada'})
            .then((result) => {
                expect(result.status).toBe(400)
                expect(result.body.error).toBe('Ja existe uma conta com esse nome')
            })
        )
})

test('Deve retornar uma conta por id', () => {
    return app.db('accounts')
        .insert({name: 'Acc id', user_id: user.id}, ['id'])
        .then(account => request(app).get(`${MAIN_ROUTE}/${account[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Acc id')
            expect(res.body.user_id).toBe(user.id)
        })
})

test('Não deve retornar uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({name: 'Acc user 2', user_id: user2.id}, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(403)
                expect(res.body.error).toBe('Este recurso não pertence ao usuario')
            })
        )
})

test('Não deve alterar uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({name: 'Acc user 2', user_id: user2.id}, ['id'])
        .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .send({name: 'Acc update'})
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(403)
                expect(res.body.error).toBe('Este recurso não pertence ao usuario')
            })
        )
})

test('Não deve remover uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({name: 'Acc user 2', user_id: user2.id}, ['id'])
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(403)
                expect(res.body.error).toBe('Este recurso não pertence ao usuario')
            })
        )
})

test('Deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({name: 'Acc update', user_id: user.id}, ['id'])
        .then(account => request(app).put(`${MAIN_ROUTE}/${account[0].id}`).send({name: 'Acc updated'}).set('authorization', `bearer ${user.token}`))   
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Acc updated')
        })
})

test('Deve remover uma conta', () => {
    return app.db('accounts')
        .insert({name: 'Acc remove', user_id: user.id}, ['id'])
        .then(account => request(app).delete(`${MAIN_ROUTE}/${account[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(204)
        })
})
