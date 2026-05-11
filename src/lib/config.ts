// Dynamic URL Configuration Utility
// Automatically detects current domain/IP and constructs appropriate URLs

/**
 * Get the base URL of the current application
 * Works with localhost, IP addresses, and domain names
 */
export const getBaseUrl = (): string => {
    if (typeof window === 'undefined') return '';

    const { protocol, hostname, port } = window.location;

    // Return the base URL with protocol and hostname
    // Port is included only if it's not the default (80 for http, 443 for https)
    const isDefaultPort =
        (protocol === 'http:' && port === '80') ||
        (protocol === 'https:' && port === '443') ||
        port === '';

    return `${protocol}//${hostname}${isDefaultPort ? '' : `:${port}`}`;
};

/**
 * Get the Employee Portal URL
 * Uses environment variable if set, otherwise constructs from current domain
 * 
 * Port mapping:
 * - Main website: 8080
 * - Employee Portal: 8081
 * - Backend API: 8000
 */
export const getEmployeePortalUrl = (): string => {
    // Check if environment variable is set (for production deployments)
    const envUrl = import.meta.env.VITE_EMPLOYEE_PORTAL_URL;
    if (envUrl) return envUrl;

    // For development/automatic detection
    const { protocol, hostname } = window.location;

    // If on localhost or IP, use port 8081
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return `${protocol}//${hostname}:8081`;
    }

    // For production domains, use the portal subdomain
    // Example: main site = dhicreativeservices.com, portal = portal.dhicreativeservices.com
    return `${protocol}//portal.${hostname}`;
};

/**
 * Get the Backend API URL
 * Uses environment variable if set, otherwise constructs from current domain
 */
export const getBackendApiUrl = (): string => {
    // Check if environment variable is set
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;

    // For development/automatic detection
    const { protocol, hostname } = window.location;

    // If on localhost or IP, use port 8000
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return `${protocol}//${hostname}:8000`;
    }

    // For production domains, you might use a subdomain
    // Example: api.dhicreative.com
    // Uncomment and customize this if needed:
    // return `${protocol}//api.${hostname}`;

    // Default: same domain with port 8000
    return `${protocol}//${hostname}:8000`;
};

/**
 * Configuration object with all URLs
 */
export const appConfig = {
    baseUrl: getBaseUrl(),
    employeePortalUrl: getEmployeePortalUrl(),
    backendApiUrl: getBackendApiUrl(),
};

export default appConfig;
