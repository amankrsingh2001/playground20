export interface UserInfo {
    id?: string,
    email?: string,
    fullName?: string,
    profileImage?: string,
}

interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  profileImage?: string;
  username: string;
}