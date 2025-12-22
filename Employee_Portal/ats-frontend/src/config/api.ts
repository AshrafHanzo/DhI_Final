// src/config/api.ts
// Centralized API configuration with dynamic URL detection

/**
 * Get the Backend API URL dynamically
 * Works with localhost, IP addresses, and domain names
 */
const getApiBaseUrl = (): string => {
  // Check if environment variable is set (for production deployments)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // For development/automatic detection
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;

    // If on localhost or IP, use port 8000
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `${protocol}//${hostname}:8000`;
    }

    // For dhicreativeservices.com production domain, use api subdomain
    if (hostname.includes('dhicreativeservices.com')) {
      return `${protocol}//api.dhicreativeservices.com`;
    }

    // For other production domains, use api subdomain
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const mainDomain = domainParts.slice(-2).join('.');
      return `${protocol}//api.${mainDomain}`;
    }

    // Default fallback
    return `${protocol}//${hostname}:8000`;
  }

  // Fallback for SSR or non-browser environments
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/users/login`,

  // Users
  USERS: `${API_BASE_URL}/api/users/`,

  // Companies
  COMPANIES: `${API_BASE_URL}/api/companies/`,

  // Jobs
  JOBS: `${API_BASE_URL}/api/jobs/`,

  // Candidates
  CANDIDATES: `${API_BASE_URL}/api/candidates/`,

  // Applications
  APPLICATIONS: `${API_BASE_URL}/api/applications/`,

  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/dashboard/`,

  // Masters
  MASTERS_SOURCED_FROM: `${API_BASE_URL}/api/masters/sourced-from/`,

  // Uploads
  UPLOADS: `${API_BASE_URL}/uploads/`,
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, id?: string | number) => {
  return id ? `${endpoint}${id}/` : endpoint;
};
