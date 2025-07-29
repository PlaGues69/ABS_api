const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Abs-Online Backend API',
      version: '1.0.0',
      description: 'API documentation for Abs-Online backend',
    },
    servers: [
      {
        url: 'http://localhost:5050',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to your API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
