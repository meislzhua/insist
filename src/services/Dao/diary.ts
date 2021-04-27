import type {DiaryOption} from "@/services/Dao/struct/diary/DiaryOption";
import AV from "@/services/Leancloud";
import type {Diary} from "@/services/Dao/struct/diary/Diary";
// @ts-ignore
import {DiaryItem} from "@/services/Dao/struct/diary/DiaryItem";

export async function saveDiaryOption(data: DiaryOption) {
  console.log("准备保存", data)
  const db_option = new AV.Object('DiaryOption');
  db_option.set(data)
  db_option.set("owner", AV.User.current())
  console.log("保存option", await db_option.save());


}

export async function getDiaryOption(): Promise<DiaryOption[]> {
  const query = new AV.Query('DiaryOption');
  return query.find().then(datas => datas.map(data => data.toJSON()))
}

export async function deleteDiaryOption({option}: { option: DiaryOption }) {
  const db_option = AV.Object.createWithoutData('DiaryOption', option.objectId);
  await db_option.destroy();
}

export async function getDiary({date}: { date: Date }): Promise<Diary> {
  const query = new AV.Query("Diary")
  console.log("准备获取日记", date)
  const [db_diary] = await query.equalTo("date", date).limit(1).find()
  // console.log("获取到日记", db_diary.toJSON())
  const data = db_diary && db_diary.toJSON() as Diary;
  if (data) data.items = (await (new AV.Query("DiaryItem")).equalTo("date", date).find()).map(item => item.toJSON())
  return data;
}

export async function addDiaryItem({date, item}: { date: Date, item: DiaryItem }) {
  const query = new AV.Query("Diary")
  let [db_diary] = await query.equalTo("date", date).limit(1).find()
  if (!db_diary) {
    db_diary = new AV.Object("Diary")
    db_diary.set("date", date)
    db_diary.set("owner", AV.User.current())
    await db_diary.save()
  }
  const db_item = new AV.Object("DiaryItem")
  db_item.set(item)
  db_item.set("date", date)
  db_item.set("diary", db_diary);
  await db_item.save()
  return db_item.toJSON()
}

export async function editDiaryItem({item}: { item: DiaryItem }) {
  const db_item = AV.Object.createWithoutData('DiaryItem', item.objectId);
  db_item.set("content", item.content)
  await db_item.save()
  return db_item.toJSON()
}

export async function removeDiaryItem({item}: { date: Date, item: DiaryItem }) {
  const db_item = AV.Object.createWithoutData('DiaryItem', item.objectId);
  await db_item.destroy();
}
