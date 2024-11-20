declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG: string;
      CA_PRIVATE_KEY_NAME: string;
      CA_CERTIFICATE_NAME: string;
      LOCAL_SERVER: string;
    }
  }
}

export {};