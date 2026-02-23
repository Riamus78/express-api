import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import env from "../../env.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "REST API",
      version: "1.0.0",
      description: "API documentation for REST API",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local Development",
      },
      // {
      //   url: "",
      //   description: "Production Server",
      // },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Ensure this points correctly from the root of your project
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  console.log(
    `Swagger docs available at http://localhost:${env.PORT}/api-docs`,
  );
};
