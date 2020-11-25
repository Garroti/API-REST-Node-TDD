module.exports = {
    test: {
        client: 'pg',
        version: '13',
        connection: {
            host: 'localhost',
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
    },
    prod: {
      client: 'pg',
      version: '13',
      connection: {
          host: 'localhost',
          user: 'postgres',
          password: 'postgres',
          database: 'barriga_prod'
      },
      migrations: {
          directory: 'src/migrations'
      }
  }
}