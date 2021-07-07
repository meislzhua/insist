import { AVObject } from '@/services/Dao/struct/AVObject';
import { Goal } from '@/services/Dao/struct/goal/Goal';

export interface GoalHistory extends AVObject {
  date: Date;
  isSuccess: boolean;
  goalSnapshoot: Goal;
}
