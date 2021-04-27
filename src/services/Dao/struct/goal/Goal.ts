import {AVObject} from "@/services/Dao/struct/AVObject";

export interface Goal extends AVObject {
  title: string
  isFinish: boolean
  nextDay: Date
  repetition: "once" | "day" | "week" | "month" | "appoint_week"

  // operation?: (a: number, b: number) => number,
}
