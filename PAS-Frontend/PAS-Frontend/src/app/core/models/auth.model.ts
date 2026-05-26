export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  department: string;
  password: string;
  confirmPassword: string;
  employeeCode?: string;
  phoneNumber?: string;
}

export interface AuthResult {
  succeeded: boolean;
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  email: string;
  employeeCode: string;
  department: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}