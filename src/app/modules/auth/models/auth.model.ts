export class AuthModel {
  authToken: string;
  refreshToken: string;
  expiresIn: Date;
  JWToken:string;

  setAuth(auth: AuthModel) {
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
  }
}
