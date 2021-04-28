import AV from "@/services/Leancloud";
import moment from "moment";
import {Goal} from "@/services/Dao/struct/goal/Goal";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";

export async function listGoals({isFinish = false}: { isFinish?: boolean } = {}): Promise<Goal[]> {
  const query = new AV.Query("Goal")
  if (isFinish !== undefined) query.equalTo("isFinish", isFinish);
  return (await query.find()).map((i: any) => i.toJSON())
}

export async function listGoalsHistory({startTime, endTime}: { startTime?: Date, endTime?: Date } = {}): Promise<GoalHistory[]> {
  const query = new AV.Query("GoalHistory")
  if (startTime !== undefined) query.greaterThanOrEqualTo("date", startTime);
  if (endTime !== undefined) query.lessThanOrEqualTo("date", endTime);
  return (await query.find()).map((i: any) => i.toJSON())
}

export async function addGoal({goal}: { goal: Goal }) {
  if (!goal) throw new Error("增加goal不可为空");
  const db_diary = new AV.Object("Goal")
  db_diary.set(goal)
  db_diary.set("owner", AV.User.current())
  await db_diary.save()
  return db_diary.toJSON()
}

export async function deleteGoal({goal}: { goal: Goal }) {
  const db_option = AV.Object.createWithoutData('Goal', goal.objectId);
  await db_option.destroy();
}

export async function finishGoal({goal, isSuccess, content}: { goal: Goal, isSuccess: boolean, content?: string }) {
  const db_item = AV.Object.createWithoutData('Goal', goal.objectId);
  const edit = {...goal};
  ["owner", "updatedAt", "createdAt", "objectId"].map(key => delete edit[key])
  if (goal.repetition === "once") db_item.set("isFinish", true)
  db_item.set("lastFinishDate", new Date())
  db_item.increment('finishCount', 1);
  await db_item.save()

  const db_history = new AV.Object("GoalHistory")
  db_history.set("date", moment().startOf("day").toDate())
  db_history.set("goal", db_item)
  db_history.set("title", goal.title)
  db_history.set("isSuccess", isSuccess)
  db_history.set("owner", AV.User.current())
  if (content) db_history.set("content", content)
  await db_history.save()

  return db_history.toJSON()
}
