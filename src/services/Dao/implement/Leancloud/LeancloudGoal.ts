import AV from 'leancloud-storage'
import moment from "moment";
import {Goal} from "@/services/Dao/struct/goal/Goal";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";
import {GoalTag} from "@/services/Dao/struct/goal/GoalTag";
import {GoalInterface} from "@/services/Dao/GoalInterface";
import {Objects} from "@/services/Dao/implement/Leancloud/Objects";

export class LeancloudGoal extends GoalInterface {


  async listGoals(): Promise<Goal[]> {
    const query = new AV.Query(Objects.Goal)
    return (await query.find()).map((i: any) => i.toJSON())
  }

  async listGoalsHistory({startTime, endTime}: { startTime?: Date, endTime?: Date } = {}): Promise<GoalHistory[]> {
    const query = new AV.Query(Objects.GoalHistory)
    if (startTime !== undefined) query.greaterThanOrEqualTo("date", startTime);
    if (endTime !== undefined) query.lessThanOrEqualTo("date", endTime);
    return (await query.find()).map((i: any) => i.toJSON())
  }

  async addGoal({goal}: { goal: Goal }) {
    if (!goal) throw new Error("增加goal不可为空");
    const db_goal = new AV.Object(Objects.Goal)
    db_goal.set(goal)
    db_goal.set("owner", AV.User.current())
    await db_goal.save()
    return db_goal.toJSON()
  }

  async editGoal({goal, id}: { goal: Goal, id: any }) {
    if (!goal || !id) throw new Error("增加goal不可为空");
    const db_goal = AV.Object.createWithoutData(Objects.Goal, id);
    db_goal.set(goal)
    db_goal.set("owner", AV.User.current())
    await db_goal.save()
    return db_goal.toJSON()
  }

  async deleteGoal({goal}: { goal: Goal }) {
    const db_option = AV.Object.createWithoutData(Objects.Goal, goal.objectId);
    await db_option.destroy();
  }

  async finishGoal({goal, isSuccess, content, appointDate}: { goal: Goal, isSuccess: boolean, content?: string, appointDate?: Date }) {
    const db_item = AV.Object.createWithoutData(Objects.Goal, goal.objectId);
    const edit = {...goal};
    ["owner", "updatedAt", "createdAt", "objectId"].map(key => delete edit[key])
    if (goal.repetition === "once") db_item.set("isFinish", true)
    db_item.set("lastFinishDate", appointDate || new Date())
    db_item.increment('finishCount', 1);
    await db_item.save()
    await db_item.fetch()

    const db_history = new AV.Object(Objects.GoalHistory)
    db_history.set("date", moment(appointDate || new Date()).startOf("day").toDate())
    db_history.set("goalSnapshoot", db_item.toJSON())
    db_history.set("isSuccess", isSuccess)
    db_history.set("owner", AV.User.current())
    if (content) db_history.set("content", content)
    await db_history.save()
    if (db_item.toJSON().isFinish) await db_item.destroy()
    return db_history.toJSON()
  }


  async addGoalTag({tag}: { tag: GoalTag }) {
    if (!tag) throw new Error("增加goal不可为空");
    const db_tag = new AV.Object(Objects.GoalTag)
    db_tag.set(tag)
    db_tag.set("owner", AV.User.current())
    await db_tag.save()
    return db_tag.toJSON()
  }

  async deleteGoalTag({tag}: { tag: GoalTag }) {
    const db_option = AV.Object.createWithoutData(Objects.GoalTag, tag.objectId);
    await db_option.destroy();
  }

  async listGoalTag(): Promise<GoalTag[]> {
    const query = new AV.Query(Objects.GoalTag)
    return (await query.find()).map((i: any) => i.toJSON())
  }

  async editGoalTag({tag, id}: { tag: GoalTag, id: any }) {
    if (!tag || !id) throw new Error("增加tag不可为空");
    const {colorName, name} = tag;
    const db_tag = AV.Object.createWithoutData(Objects.GoalTag, id);
    db_tag.set({colorName, name})
    db_tag.set("owner", AV.User.current())
    await db_tag.save()
    return db_tag.toJSON()
  }
}
