import HttpClient from "./http-client-base";

export const backendHttpClient = new HttpClient(process.env.NEXT_PUBLIC_BACKEND_URL);
