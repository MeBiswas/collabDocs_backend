import joi from 'joi'

/* Joi validation schema for environment variables */
const envValidationSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_KEY: joi.string().required(),
  REDIS_URL: joi.string().required(),
  APP_SECRET: joi.string().required(),
  CORS_ORIGINS: joi.string().required(),
  PORT: joi.number().port().default(3000),
  MONGODB_ATLAS_URI: joi.string().required(),
  SERVICE_ID: joi.string().default('collabDocs_backend'),
})

export default envValidationSchema
