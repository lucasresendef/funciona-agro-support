import { env } from "@/shared/config/env";
import axios from "axios";
import { installInterceptors } from "./interceptors";

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 10000,
});

installInterceptors(api);
