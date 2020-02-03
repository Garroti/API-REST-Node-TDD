const request = require('supertest')
const app = require('../../src/app')

test('Deve criar usuario via signup', () => {
    return request(app).post('/auth/signup')
        .send({name: 'Gabryel', mail: `${Date.now()}@mail.com`, password: '123456'})
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.name).toBe('Gabryel')
            expect(res.body).toHaveProperty('mail')
            expect(res.body).not.toHaveProperty('password')
        })
})

test('Deve receber token ao logar', () => {
    const mail = `${Date.now()}@mail.com`
    return app.services.user.save({name: 'Gabryel', mail, password: '123456'})
        .then(() => request(app).post('/auth/signin')
            .send({mail, password: '123456'}))
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('token')
        })
})

test('Não deve autenticar usuario com senha errada', () => {
    return request(app).post('/auth/signin')
        .send({mail: 'algum@mail.com', password: '654321'})
        .then((res) => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Usuario ou senha invalida')
        })
})

test('Não deve acessar uma rota protegida sem token', () => {
    return request(app).get('/api/users')
        .then((res) => {
            expect(res.status).toBe(401)
        })
})