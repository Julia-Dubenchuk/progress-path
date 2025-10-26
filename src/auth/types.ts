export interface Auth0User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  nickname?: string;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
  ip?: string;
}
