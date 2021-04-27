import {AVObject} from "@/services/Dao/struct/AVObject";
import {DiaryItem} from "./DiaryItem";

export interface Diary extends AVObject {
  items: DiaryItem[]
}
