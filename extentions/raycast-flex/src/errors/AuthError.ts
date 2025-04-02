export class AuthError extends Error {
  status: number;
  
  constructor(message = "인증에 실패했습니다. 쿠키가 만료되었습니다.", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}