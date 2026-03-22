const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopZone - Order Service API',
      version: '1.0.0',
      description: 'Order management microservice',
      contact: {
        name: 'ShopZone Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5003',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
