export abstract class UserInterface {
  abstract logout(): Promise<void>;

  abstract register({username, password}: { username: string, password: string }): Promise<any>;

  abstract login({username, password}: { username: string, password: string }): Promise<any>;

  // todo 抽象User
  abstract current(): Promise<any>;
}
