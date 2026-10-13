import { ZodError } from 'zod';

/**
 * Validate request body, query, or params against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req[source]);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorsList = error.errors.map((err) => ({
          field: err.path.join('.') || 'input',
          message: err.message,
        }));

        // Format a clear, natural message telling the user exactly what is wrong
        const formattedMessages = errorsList.map((err) => {
          if (!err.field || err.field === 'input') return err.message;
          const cleanField = err.field
            .split('.')
            .map((p) => p.replace(/_/g, ' '))
            .join(' > ');
          // If the message already includes the field name, return as is
          if (err.message.toLowerCase().includes(cleanField.toLowerCase())) {
            return err.message;
          }
          return `${cleanField.charAt(0).toUpperCase() + cleanField.slice(1)}: ${err.message}`;
        });

        const detailedMessage = formattedMessages.length === 1
          ? formattedMessages[0]
          : formattedMessages.join('. ');

        return res.status(400).json({
          success: false,
          message: detailedMessage,
          errors: errorsList,
        });
      }
      next(error);
    }
  };
};

export default validate;
