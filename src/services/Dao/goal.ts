import AV from "@/services/Leancloud";
import moment from "moment";
import config from "@/config";
import {Goal} from "@/services/Dao/struct/goal/Goal";

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
