export interface UserProfile {
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface AuthValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}
