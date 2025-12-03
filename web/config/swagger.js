import swaggerJsdoc from "swagger-jsdoc";

function countApi(swaggerDocs) {
  return Object.keys(swaggerDocs.paths).length;
}

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Seojog API's",
      version: "1.0.0",
      description: "", // Will be updated dynamically
    },
    servers: [
      {
        url: "http://localhost:4500", // Your local server URL
      },
      {
        url: "https://app.seojog.app", // Your local server URL
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./Route/*.js"], // Path to your API files
};

// Generate Swagger docs
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Dynamically update the description with API count
swaggerDocs.info.description = `Your API documentation - Total Endpoints: ${countApi(swaggerDocs)}`;

export default swaggerDocs;
