import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Question & Answer API',
      version: '1.0.0',
      description: 'CRUD for question & answer'
    },
  },
  apis: ['./routes/*.mjs'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
