declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG: string;
      CA_PRIVATE_KEY: string;
      CA_CERTIFICATE: string;
    }
  }
}

export {};