import {Goal} from "@/services/Dao/struct/goal/Goal";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";
import {GoalTag} from "@/services/Dao/struct/goal/GoalTag";


export abstract class GoalInterface {
  abstract listGoals(): Promise<Goal[]>;

  abstract listGoalsHistory({startTime, endTime}: { startTime?: Date, endTime?: Date }): Promise<GoalHistory[]>;

  abstract addGoal({goal}: { goal: Goal }): Promise<Goal>;

  abstract editGoal({goal, id}: { goal: Goal, id: any }): Promise<Goal>;

  abstract deleteGoal({goal}: { goal: Goal }): Promise<void>;

  abstract finishGoal({goal, isSuccess, content, appointDate}: { goal: Goal, isSuccess: boolean, content?: string, appointDate?: Date }): Promise<void>;

  abstract addGoalTag({tag}: { tag: GoalTag }): Promise<GoalTag>;

  abstract deleteGoalTag({tag}: { tag: GoalTag }): Promise<void>;

  abstract listGoalTag(): Promise<GoalTag[]>;

  abstract editGoalTag({tag, id}: { tag: GoalTag, id: any }): Promise<GoalTag>;


}
