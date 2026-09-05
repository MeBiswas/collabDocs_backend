// Typed configuration factory
export default () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  observe: {
    APP_KEY: process.env.APP_KEY || '',
    APP_SECRET: process.env.APP_SECRET || '',
    SERVICE_ID: process.env.SERVICE_ID || 'collabDocs_backend',
  },
})
