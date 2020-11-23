API REST Node with Test Driven Development

COMANDOS:

npm i
docker-compose up
node_modules/.bin/knex migrate:latest --env test
node_modules/.bin/knex seed:run --env test