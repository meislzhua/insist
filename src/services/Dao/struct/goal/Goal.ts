import {AVObject} from "@/services/Dao/struct/AVObject";
import {GoalTag} from "@/services/Dao/struct/goal/GoalTag";

export interface Goal extends AVObject {
  title: string
  isFinish: boolean
  lastFinishDate?: Date
  finishCount: number
  repetition: "once" | "day" | "week" | "month" | "appoint_week" | "appoint_month"
  repetitionCount: number
  appoint?: number
  appointDate?: Date,
  tags: GoalTag[]
}



