const { z } = require("zod");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      let dataToValidate;

      switch (source) {
        case "body":
          dataToValidate = req.body;
          break;
        case "query":
          dataToValidate = req.query;
          break;
        case "params":
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      const validatedData = schema.parse(dataToValidate);

      if (source === "body") {
        req.body = validatedData;
      } else if (source === "query") {
        req.query = validatedData;
      } else if (source === "params") {
        req.params = validatedData;
      }

      next();
    } catch (error) {
      // Handle Zod v4 errors
      if (error.name === "ZodError" && error.issues) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors,
        });
      }

      // Handle Zod v3 errors (backward compatibility)
      if (error.name === "ZodError" && error.errors) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors,
        });
      }

      // Handle any other error
      console.error("Validation error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Validation failed",
      });
    }
  };
};

module.exports = { validate };
