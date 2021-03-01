import AV from '@/services/Leancloud'
import moment from "moment";
import config from "@/config";

export interface AVObject {
  objectId: string,
  updatedAt?: Date,
  createdAt?: Date,
}

export interface DiaryOption extends AVObject {
  title: string,
  type: "text" | "date" | "file" | "mood",
  content?: string,
  itemId?: string,
  isInternal?: boolean,
  // operation?: (a: number, b: number) => number,
}

export interface DiaryItem extends DiaryOption {
  optionId: string
}

export interface Diary extends AVObject {
  items: DiaryItem[]
}

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


export interface Goal extends AVObject {
  title: string
  isFinish: boolean
  nextDay: Date
  repetition: "once" | "day" | "week" | "month" | "appoint_week"

  // operation?: (a: number, b: number) => number,
}

export async function listGoals({isFinish = false, hideDone = true}: { isFinish?: boolean, hideDone?: boolean } = {}): Promise<Goal[]> {
  const query = new AV.Query("Goal")
  if (isFinish !== undefined) query.equalTo("isFinish", isFinish);
  if (isFinish === false && hideDone) query.lessThan("nextDay", moment().subtract(config.dayDelayHour, "hour").toDate());
  return (await query.find()).map((i: any) => i.toJSON())
}

export async function addGoal({goal}: { goal: Goal }) {
  if (!goal) throw new Error("增加goal不可为空");
  const db_diary = new AV.Object("Goal")
  db_diary.set(goal)
  db_diary.set("owner", AV.User.current())
  db_diary.set("nextDay", moment().subtract(1, "day").startOf("day").toDate())
  await db_diary.save()
  return db_diary.toJSON()
}

export async function deleteGoal({goal}: { goal: Goal }) {
  const db_option = AV.Object.createWithoutData('Goal', goal.objectId);
  await db_option.destroy();
}

export async function finishGoal({goal, nextDay, isSuccess, content}: { goal: Goal, nextDay?: Date, isSuccess: boolean, content?: string }) {
  const db_item = AV.Object.createWithoutData('Goal', goal.objectId);
  const edit = {...goal};
  ["owner", "updatedAt", "createdAt", "objectId"].map(key => delete edit[key])
  if (nextDay) db_item.set("nextDay", nextDay)
  else db_item.set("isFinish", true)
  await db_item.save()

  const db_history = new AV.Object("GoalHistory")
  db_history.set("date", moment().startOf("day").toDate())
  db_history.set("goal", db_item)
  db_history.set("title", goal.title)
  db_history.set("isSuccess", isSuccess)
  if (content) db_history.set("content", content)
  await db_history.save()

  return db_history.toJSON()
}
