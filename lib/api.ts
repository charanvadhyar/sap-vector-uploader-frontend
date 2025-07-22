// API service functions for SAP FICO Uploader

// Ensure API_BASE_URL is a proper URL with protocol
let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Add protocol if missing
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = `https://${API_BASE_URL}`;
  console.log('Added https:// protocol to API_BASE_URL:', API_BASE_URL);
}

// General API utility function
export async function fetchWithError<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Debug authentication state
  console.log(`API request to: ${url}`);
  console.log(`Token exists: ${token ? 'Yes' : 'No'}`);
  
  // Merge any existing headers
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Added Authorization header with Bearer token');
  } else {
    console.warn('No authentication token available in localStorage!');
  }
  
  // Special handling for FormData - don't set Content-Type
  const isFormData = options.body instanceof FormData;
  
  // Add Content-Type for POST requests if not specified and not FormData
  if (options.method === 'POST' && !headers['Content-Type'] && !isFormData) {
    headers['Content-Type'] = 'application/json';
    console.log('Added default Content-Type: application/json');
  }
  
  if (isFormData) {
    console.log('FormData detected - letting browser set Content-Type');
  }
  
  const updatedOptions = {
    ...options,
    headers,
  };

  console.log('Request headers:', headers);

  try {
    const response = await fetch(url, updatedOptions);
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed - invalid or expired token');
        // Clear invalid token from storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
      
      let errorMsg;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || JSON.stringify(errorData);
        console.error('API error response:', errorData);
      } catch {
        errorMsg = `${response.status} ${response.statusText}`;
        console.error('Failed to parse error response');
      }
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Files API
export interface FileResponse {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  upload_date: string;
  total_chunks: number;
}

export interface FileDetailResponse extends FileResponse {
  chunks: ChunkResponse[];
}

export interface ChunkResponse {
  id: string;
  chunk_number: number;
  text: string;
  token_count: number;
  file_id: string;
  created_at: string;
}

export interface ProcessingResponse {
  id: string;
  filename: string;
  status: string;
  message: string;
}

export const filesApi = {
  getFiles: () => fetchWithError<FileResponse[]>(`${API_BASE_URL}/files/`),
  
  getFileDetails: (fileId: string) => 
    fetchWithError<FileDetailResponse>(`${API_BASE_URL}/files/${fileId}`),
  
  deleteFile: (fileId: string) => 
    fetchWithError<{message: string}>(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
    }),
  
  processFile: (fileId: string) => 
    fetchWithError<ProcessingResponse>(`${API_BASE_URL}/process/${fileId}`, {
      method: 'POST',
    }),
};

// Upload API
export const uploadApi = {
  uploadFile: async (file: File) => {
    console.log('Starting file upload for:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Get the auth token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.error('Cannot upload file: No authentication token found');
      throw new Error('Authentication required. Please log in again.');
    }
    
    try {
      // Use direct fetch for more control
      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData,
      });
      
      console.log(`Upload response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Upload authorization failed - invalid or expired token');
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          throw new Error('Authentication expired. Please log in again.');
        }
        
        // Handle other errors
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || JSON.stringify(errorData);
          console.error('Upload error response:', errorData);
        } catch (e) {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Upload successful');
      return data as FileResponse;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
};

// Query API
export interface QueryRequest {
  query: string;
  limit?: number;
}

export interface QueryResultChunk {
  id: string;
  text: string;
  token_count: number;
  chunk_number: number;
  file_id: string;
  filename: string;
  similarity: number;
}

export interface QueryResponse {
  query: string;
  chunks: QueryResultChunk[];
}

export const queryApi = {
  search: (request: QueryRequest) => 
    fetchWithError<QueryResponse>(`${API_BASE_URL}/query/`, {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

// Auth API
export interface LoginRequest {
  email: string; // Used as username for OAuth2
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export const authApi = {
  login: async (request: LoginRequest) => {
    console.log('Login attempt for email:', request.email);
    
    // Create URLSearchParams object for OAuth2 form data compatibility
    const formData = new URLSearchParams();
    
    // OAuth2 in FastAPI expects 'username', not 'email'
    formData.append('username', request.email);
    formData.append('password', request.password);
    
    console.log('Sending auth request with form data');
    
    try {
      // Direct fetch implementation for better control
      // Safely construct the auth URL
      let authUrl;
      try {
        // Attempt to use URL constructor
        authUrl = new URL('/auth/token', API_BASE_URL).toString();
        console.log('Using absolute auth URL:', authUrl);
      } catch (error) {
        // Fallback to string concatenation if URL construction fails
        console.error('URL construction failed, falling back to string concatenation:', error);
        authUrl = `${API_BASE_URL}/auth/token`;
        console.log('Using fallback auth URL:', authUrl);
      }
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      console.log(`Auth response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Try to parse error message
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || JSON.stringify(errorData);
          console.error('Auth error response:', errorData);
        } catch {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Auth success, token received');
      return data as TokenResponse;
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  },
  
  getCurrentUser: (token?: string) => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!authToken) {
      throw new Error('No authentication token available');
    }
    return fetchWithError<UserResponse>(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  },
};

// Export getCurrentUser as a standalone function for convenience
export const getCurrentUser = (token?: string) => authApi.getCurrentUser(token);
