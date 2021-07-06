import {UserInterface} from "@/services/Dao/UserInterface";
import AV from 'leancloud-storage'

export class LeancloudUser extends UserInterface {
  async current(): Promise<any> {
    return AV.User.current();
  }

  async login({username, password}: { username: string; password: string }): Promise<any> {
    await AV.User.logIn(username, password);
  }

  async logout(): Promise<void> {
    await AV.User.logOut();
  }

  async register({username, password}: { username: string; password: string }): Promise<any> {
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    await user.signUp()
    return user;
  }
}
