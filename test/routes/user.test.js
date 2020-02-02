const request = require('supertest')
const app = require('../../src/app')
const jwt = require('jwt-simple')
const variables = require('../../src/config/variables')

const mail = `${Date.now()}@mail.com`

beforeAll( async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, password: '123456' })
    user = { ...res[0] }
    user.token = jwt.encode(user, variables.Security.secretKey)
})

test('Deve lista todos os usuarios', () => {
    return request(app).get('/users')
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.length).toBeGreaterThan(0)
        })
})

test('Deve inserir usuario com sucesso', () => {
    return request(app).post('/users')
        .send({name: 'Walter Muller', mail, password: '123456'})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.name).toBe('Walter Muller')
            expect(res.body).not.toHaveProperty('password')
        })
})

test('Deve armazenar senha criptografada', async () => {
    const res = await request(app).post('/users')
        .send({name: 'Walter Muller', mail: `${Date.now()}@mail.com`, password: '123456'})
        .set('authorization', `bearer ${user.token}`)
    expect(res.status).toBe(201)

    const {id} = res.body
    const userDB = await app.services.user.find({id})
    expect(userDB.password).not.toBeUndefined()
    expect(userDB.password).not.toBe('123456')
})

test('Não deve inserir usuário sem nome', () => {
    return request(app).post('/users')
        .send({mail: 'walter@mail.com', password: '123456'})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('Não deve inserir usuario sem email', async () => {
    const result = await request(app).post('/users')
        .send({name: 'Walter Muller', password: '123456'})
        .set('authorization', `bearer ${user.token}`)
        expect(result.status).toBe(400)
        expect(result.body.error).toBe('Email é um atributo obrigatorio')
})

test('Não deve inserir usuário sem senha', (done) => {
    request(app).post('/users')
        .send({name: 'Walter Muller', mail: 'walter@mail.com'})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Senha é um atributo obrigatorio')
            done()
        })
})

test('Não deve inserir um usuario com email existente', () => {
    return request(app).post('/users')
        .send({name: 'Walter Muller', mail, password: '123456'})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Ja existe um usuario com esse email')
        })
})