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