import type {DiaryOption} from "@/services/Dao/struct/diary/DiaryOption";
import AV from 'leancloud-storage'
import type {Diary} from "@/services/Dao/struct/diary/Diary";
// @ts-ignore
import {DiaryItem} from "@/services/Dao/struct/diary/DiaryItem";
import {DiaryInterface} from "@/services/Dao/DiaryInterface";
import {Objects} from "@/services/Dao/implement/Leancloud/Objects";

export class LeancloudDiary extends DiaryInterface {

  async saveDiaryOption(data: DiaryOption) {
    const db_option = new AV.Object(Objects.DiaryOption);
    db_option.set(data)
    db_option.set("owner", AV.User.current())
    await db_option.save()
    return db_option.toJSON()
  }

  async getDiaryOption(): Promise<DiaryOption[]> {
    const query = new AV.Query(Objects.DiaryOption);
    return query.find().then(datas => datas.map(data => data.toJSON()))
  }

  async deleteDiaryOption({option}: { option: DiaryOption }) {
    const db_option = AV.Object.createWithoutData(Objects.DiaryOption, option.objectId);
    await db_option.destroy();
  }

  async getDiary({date}: { date: Date }): Promise<Diary> {
    const query = new AV.Query(Objects.Diary)
    const [db_diary] = await query.equalTo("date", date).limit(1).find()
    const data = db_diary && db_diary.toJSON() as Diary;
    if (data) data.items = (await (new AV.Query(Objects.DiaryItem)).equalTo("date", date).find()).map(item => item.toJSON())
    return data;
  }


  async addDiaryItem({date, item}: { date: Date, item: DiaryItem }) {
    const query = new AV.Query(Objects.Diary)
    let [db_diary] = await query.equalTo("date", date).limit(1).find()
    if (!db_diary) {
      db_diary = new AV.Object(Objects.Diary)
      db_diary.set("date", date)
      db_diary.set("owner", AV.User.current())
      await db_diary.save()
    }
    const db_item = new AV.Object(Objects.DiaryItem)
    db_item.set(item)
    db_item.set("date", date)
    db_item.set("diary", db_diary);
    await db_item.save()
    return db_item.toJSON()
  }

  async editDiaryItem({item}: { item: DiaryItem }) {
    const db_item = AV.Object.createWithoutData(Objects.DiaryItem, item.objectId);
    db_item.set("content", item.content)
    await db_item.save()
    return db_item.toJSON()
  }


  async removeDiaryItem({item}: { date: Date, item: DiaryItem }) {
    const db_item = AV.Object.createWithoutData(Objects.DiaryItem, item.objectId);
    await db_item.destroy();
  }


}

