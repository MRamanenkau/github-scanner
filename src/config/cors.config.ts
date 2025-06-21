import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { envSchema } from './env.schema';

const env = envSchema.parse(process.env);

const corsConfig: CorsOptions = {
  origin: env.CORS_ORIGINS,
  methods: 'POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

export default corsConfig;
