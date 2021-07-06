import type {DiaryOption} from "@/services/Dao/struct/diary/DiaryOption";
import type {Diary} from "@/services/Dao/struct/diary/Diary";
// @ts-ignore
import {DiaryItem} from "@/services/Dao/struct/diary/DiaryItem";

export abstract class DiaryInterface {
  abstract saveDiaryOption(data: DiaryOption): Promise<DiaryOption>;

  abstract getDiaryOption(): Promise<DiaryOption[]>;

  abstract deleteDiaryOption({option}: { option: DiaryOption }): Promise<void>;

  abstract getDiary({date}: { date: Date }): Promise<Diary>;

  abstract addDiaryItem({date, item}: { date: Date, item: DiaryItem }): Promise<DiaryItem>;

  abstract editDiaryItem({item}: { item: DiaryItem }): Promise<DiaryItem>;

  abstract removeDiaryItem({item}: { date: Date, item: DiaryItem }): Promise<void>;
}
