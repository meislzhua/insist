import moment from 'moment';
import { Goal } from '@/services/Dao/struct/goal/Goal';
import { GoalHistory } from '@/services/Dao/struct/goal/GoalHistory';

export class GoalLogic {
  static getShowGoalInDay({
    goals,
    date,
    historyIndex,
  }: {
    goals: Goal[];
    date: moment.Moment;
    historyIndex: any;
  }) {
    if (moment().startOf('day').isAfter(date, 'day')) return [];

    return GoalLogic.goalOrder({
      goals: goals.reduce((p: Goal[], goal: Goal) => {
        let isVisible = false;
        let count;
        // day,week,month 计算所需变量
        let startTime = moment();
        let endTime = moment();
        switch (goal.repetition) {
          case 'once':
            isVisible = date.isSame(moment(), 'day');
            if (isVisible && goal.appointDate)
              isVisible = date.isSameOrAfter(goal.appointDate, 'day');
            isVisible = isVisible || date.isSame(goal.appointDate, 'day');
            break;
          case 'day':
          case 'week':
          case 'month':
            // 计算在周期内,一共的执行次数
            count = 0;
            if (goal.repetition === 'day') {
              startTime = date.clone().startOf('day');
              endTime = date.clone().startOf('day');
            } else if (goal.repetition === 'week') {
              startTime = date.clone().startOf('isoWeek');
              endTime = date.clone().endOf('isoWeek');
            } else if (goal.repetition === 'month') {
              startTime = date.clone().startOf('month');
              endTime = date.clone().endOf('month');
            }
            while (startTime.isSameOrBefore(endTime, 'day')) {
              count += (historyIndex[this.getDateKey({ date: startTime })] || []).filter(
                (history: GoalHistory) => history.goalSnapshoot.objectId === goal.objectId,
              ).length;
              startTime.add(1, 'day');
            }
            isVisible = !!goal.repetitionCount && count < goal.repetitionCount;
            break;
          case 'appoint_week':
          // eslint-disable-next-line no-fallthrough
          case 'appoint_month':
            // 处理指定每周几 或 每月N号的情况
            // eslint-disable-next-line no-case-declarations
            const targetAppoint =
              goal.repetition === 'appoint_month' ? date.date() : date.isoWeekday();
            if (targetAppoint === goal.appoint) {
              count = (historyIndex[this.getDateKey({ date })] || []).filter(
                (history: GoalHistory) => history.goalSnapshoot.objectId === goal.objectId,
              ).length;
              isVisible = !count;
            }
            break;

          default:
        }

        if (isVisible) p.push(goal);
        return p;
      }, []),
    });
  }

  static getDateKey({ date }: { date: moment.Moment }) {
    return date.format('YYYY-MM-DD');
  }

  static goalOrder({ goals }: { goals: Goal[] }): Goal[] {
    const repetitionOrder = {
      once: 1,
      day: 2,
      week: 3,
      appoint_week: 4,
      month: 5,
      appoint_month: 6,
      appoint: 7,
      delayed: 8,
    };
    const getOrder = (g: Goal) => {
      if (g.repetition === 'once' && g.appointDate) {
        if (moment().startOf('day').isAfter(g.appointDate, 'day')) return repetitionOrder.delayed;
        return repetitionOrder.appoint;
      }
      return repetitionOrder[g.repetition];
    };
    const orderScoreIndex = goals.reduce((p: any, v) => {
      // eslint-disable-next-line no-param-reassign
      p[v.objectId] = getOrder(v);
      return p;
    }, {});
    // @ts-ignore
    goals.sort((a, b) => {
      const a_order = orderScoreIndex[a.objectId];
      const b_order = orderScoreIndex[b.objectId];
      if (a_order === b_order) {
        // @ts-ignore
        if (a_order === repetitionOrder.delayed) return a.appointDate > b.appointDate ? 1 : -1;
        // @ts-ignore
        return a.createdAt > b.createdAt ? 1 : -1;
      }
      return b_order - a_order;
    });
    return goals;
  }
}
