API REST Node with Test Driven Development

COMANDOS:

npm i
docker-compose up

Rodando a primeira vez

ambiente de teste:
node_modules/.bin/knex migrate:latest --env test
node_modules/.bin/knex seed:run --env test

ambiente de produção:
node_modules/.bin/knex migrate:latest --env prod