const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopZone - Payment Service API',
      version: '1.0.0',
      description: 'Payment processing microservice',
      contact: {
        name: 'ShopZone Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5004',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
