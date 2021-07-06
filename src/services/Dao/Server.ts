import type {DiaryInterface} from "@/services/Dao/DiaryInterface";
import type {GoalInterface} from "@/services/Dao/GoalInterface";
import type {UserInterface} from "@/services/Dao/UserInterface";

export enum ServerType {
  Base = "base",
  Leancloud = "leancloud"
}

export interface ServerData {
  type: ServerType
  data?: any
}

export abstract class Server implements ServerData {
  abstract type: ServerType
  abstract data?: any

  abstract diary: DiaryInterface;
  abstract goal: GoalInterface;
  abstract user: UserInterface;


  abstract verify(): Promise<boolean>

}
