export interface Auth0Profile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
  };
}

export interface Auth0User {
  accessToken: string;
  refreshToken: string;
  profile: Auth0Profile;
}
