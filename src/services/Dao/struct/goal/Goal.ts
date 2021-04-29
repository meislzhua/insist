import {AVObject} from "@/services/Dao/struct/AVObject";

export interface Goal extends AVObject {
  title: string
  isFinish: boolean
  lastFinishDate?: Date
  finishCount: number
  repetition: "once" | "day" | "week" | "month" | "appoint_week" | "appoint_month"
  repetitionCount: number
  appoint?: number
  appointDate?: Date
}



