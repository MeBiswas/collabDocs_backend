import joi from 'joi'

/* Joi validation schema for environment variables */
const envValidationSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: joi.number().port().default(3000),
  APP_KEY: joi.string().required(),
  APP_SECRET: joi.string().required(),
  SERVICE_ID: joi.string().default('collabDocs_backend'),
})

export default envValidationSchema
