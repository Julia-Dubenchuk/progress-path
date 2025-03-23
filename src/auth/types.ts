export interface Auth0Profile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
}

export interface Auth0User {
  accessToken: string;
  refreshToken: string;
  profile: Auth0Profile;
}
