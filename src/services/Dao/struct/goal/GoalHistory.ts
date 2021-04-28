import {AVObject} from "@/services/Dao/struct/AVObject";

export interface GoalHistory extends AVObject {
  date: Date
  isSuccess: boolean
  title: string
}



