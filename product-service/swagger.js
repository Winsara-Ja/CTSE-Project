const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopZone - Product Service API',
      version: '1.0.0',
      description: 'Product catalog management microservice',
      contact: {
        name: 'ShopZone Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5002',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
