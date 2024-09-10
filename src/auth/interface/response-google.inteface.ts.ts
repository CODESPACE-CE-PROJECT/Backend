import { Profile } from 'passport-google-oauth20';
export interface IResponseGoogle {
  profile: Profile;
  accessToken: string;
  refreshToken: string;
}
