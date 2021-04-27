import {AVObject} from "@/services/Dao/struct/AVObject";

export interface DiaryOption extends AVObject {
  title: string,
  type: "text" | "date" | "file" | "mood",
  content?: string,
  itemId?: string,
  isInternal?: boolean,
  // operation?: (a: number, b: number) => number,
}
