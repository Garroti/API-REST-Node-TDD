module.exports = {
    test: {
        client: 'pg',
        version: '10.11',
        connection: {
            host: 'db',
            user: 'postgres',
            password: 'postgres',
            database: 'barriga'
        },
        migrations: {
            directory: 'src/migrations'
        },
        seeds: {
            directory: 'src/seeds'
        }
    }
}