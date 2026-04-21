import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiClientConfig extends AxiosRequestConfig {
    baseURL?: string;
    withCredentials?: boolean;
}

class ApiClient {
    private client: AxiosInstance;

    constructor(config?: ApiClientConfig) {
        const baseURL =
            (import.meta as any).env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

        this.client = axios.create({
            baseURL,
            timeout: 10000,
            withCredentials: true,
            ...config,
        });

        // Request interceptor
        this.client.interceptors.request.use((request) => {
            // Add CSRF token if available
            const token = this.getCsrfToken();
            if (token) {
                request.headers['X-CSRF-TOKEN'] = token;
            }

            // Add authorization header if token exists
            const authToken = this.getAuthToken();
            if (authToken) {
                request.headers['Authorization'] = `Bearer ${authToken}`;
            }

            request.headers['X-Requested-With'] = 'XMLHttpRequest';
            return request;
        });

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized - redirect to login
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    private getCsrfToken(): string | null {
        const token =
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
            localStorage.getItem('csrf-token');
        return token || null;
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('auth-token') || null;
    }

    public setAuthToken(token: string): void {
        localStorage.setItem('auth-token', token);
    }

    public clearAuthToken(): void {
        localStorage.removeItem('auth-token');
    }

    // API Methods
    public get<T>(url: string, config?: AxiosRequestConfig) {
        return this.client.get<T>(url, config);
    }

    public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.client.post<T>(url, data, config);
    }

    public put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.client.put<T>(url, data, config);
    }

    public patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.client.patch<T>(url, data, config);
    }

    public delete<T>(url: string, config?: AxiosRequestConfig) {
        return this.client.delete<T>(url, config);
    }
}

export const apiClient = new ApiClient();
export default ApiClient;
