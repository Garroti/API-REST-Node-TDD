const request = require('supertest')
const app = require('../../src/app')

const mail = `${Date.now()}@mail.com`

test('Deve lista todos os usuarios', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.length).toBeGreaterThan(0)
        })
})

test('Deve inserir usuario com sucesso', () => {
    return request(app).post('/users')
        .send({name: 'Walter Muller', mail, password: '123456'})
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.name).toBe('Walter Muller')
        })
})

test('Não deve inserir usuário sem nome', () => {
    return request(app).post('/users')
        .send({mail: 'walter@mail.com', password: '123456'})
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('Não deve inserir usuario sem email', async () => {
    const result = await request(app).post('/users')
        .send({name: 'Walter Muller', password: '123456'})
        expect(result.status).toBe(400)
        expect(result.body.error).toBe('Email é um atributo obrigatorio')
})

test('Não deve inserir usuário sem senha', (done) => {
    request(app).post('/users')
        .send({name: 'Walter Muller', mail: 'walter@mail.com'})
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Senha é um atributo obrigatorio')
            done()
        })
})

test('Não deve inserir um usuario com email existente', () => {
    return request(app).post('/users')
        .send({name: 'Walter Muller', mail, password: '123456'})
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Ja existe um usuario com esse email')
        })
})