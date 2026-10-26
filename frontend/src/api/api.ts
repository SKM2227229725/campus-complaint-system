import axios from "axios";

export const api = axios.create({ baseURL: "/api/v1" });

export const getAccess = () => sessionStorage.getItem("access");
export const setTokens = (a: string, r?: string) => { 
  sessionStorage.setItem("access", a); 
  if (r) sessionStorage.setItem("refresh", r); 
};
export const clearTokens = () => { 
  sessionStorage.removeItem("access"); 
  sessionStorage.removeItem("refresh"); 
};

api.interceptors.request.use((c) => { 
  const t = getAccess(); 
  if (t) c.headers.Authorization = `Bearer ${t}`; 
  return c; 
});

export function errMsg(e: any): string {
  if (e.response?.data?.detail) return e.response.data.detail;
  if (e.message === "Network Error") return "Cannot connect to server. Ensure backend is running.";
  return "Something went wrong. Please try again.";
}