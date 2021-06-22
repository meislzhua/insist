import {AVObject} from "@/services/Dao/struct/AVObject";

export interface GoalTag extends AVObject {
  name: string,
  colorName: string,
  isActive?: boolean
}



