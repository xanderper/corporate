export interface AppConfig {
  databaseUrl: string;
  port: number;
  nodeEnv: string;
  minio: {
    endpoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucketName: string;
  };
  qorve: {
    merchantPublishableKey: string;
    checkoutUrl: string;
    apiUrl: string;
  };
}

export const env: AppConfig = {
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/virex_portal",
  port: Number(process.env.PORT) || 3203,
  nodeEnv: process.env.NODE_ENV || "development",
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    bucketName: process.env.MINIO_BUCKET_NAME || "virex-portal-documents",
  },
  qorve: {
    merchantPublishableKey:
      process.env.NEXT_PUBLIC_QORVE_MERCHANT_PUBLISHABLE_KEY || "",
    checkoutUrl:
      process.env.NEXT_PUBLIC_QORVE_CHECKOUT_URL || "http://localhost:3004",
    apiUrl:
      process.env.NEXT_PUBLIC_QORVE_API_URL || "http://localhost:3001/api",
  },
};
