const { DataSource } = require('typeorm');
const { ConfigService } = require('@nestjs/config');
require('dotenv').config();

const configService = new ConfigService();

module.exports = new DataSource({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  entities: [__dirname + '/../app/entities/**/*.entity.js'],
  migrations: [__dirname + '/migrations/*.js'],
  synchronize: false,
});
