import React from 'react';
import styles from './index.less';
import type {FormInstance} from 'antd';
import {Button} from 'antd';
import {Dao} from '@/services/Dao';

import {PlusOutlined,} from '@ant-design/icons';

import moment from 'moment';
import GoalAddBox from '@/pages/Goal/components/GoalAddBox';
import GoalCalendar from '@/pages/Goal/components/GoalCalendar';
import GoalHistoryItem from '@/pages/Goal/components/GoalHistoryItem';
import GoalItem from '@/pages/Goal/components/GoalItem';
import {GoalLogic} from "@/services/logic/goal";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";

export default class GoalPage extends React.Component {
  addGoalFrom = React.createRef<FormInstance>();
  goalAddBox?: GoalAddBox;
  goalCalendar?: GoalCalendar;
  cacheMonth = 5;

  state: any = {
    goals: [],
    historyIndex: {},
    calendarData: {},
    isGoalAddShow: false,
    historyCacheStart: moment(),
    historyCacheEnd: moment(),
    selectedDate: moment(),
    cacheGoalStart: moment().startOf('month').subtract(this.cacheMonth, 'month'),
    cacheGoalEnd: moment().startOf('month').add(this.cacheMonth, 'month'),
  };

  componentDidMount() {
    this.refreshAll().catch((e) => e);
    const win: any = window;
    // 全局消息通知获取
    win.insist.event.addListener('addGoalInPage', () =>
      this.goalAddBox?.toggleAddGoalShow({
        force: true,
        day: this.state.selectedDate,
      }),
    );
  }

  componentWillUnmount() {
    const win: any = window;
    // 离开时,移除消息通知监听器
    win.insist.event.removeAllListeners('addGoalInPage');
  }

  get showGoals() {
    return GoalLogic.getShowGoalInDay({
      goals: this.state.goals,
      historyIndex: this.state.historyIndex,
      date: this.state.selectedDate
    })
  }

  get showGoalHistory() {
    return this.state.historyIndex[GoalLogic.getDateKey({date: this.state.selectedDate})] || [];
  }

  async updateCacheDate() {
    return new Promise<void>(resolve => this.setState({
      cacheGoalStart: this.state.selectedDate.clone().startOf('month').subtract(this.cacheMonth, 'month'),
      cacheGoalEnd: this.state.selectedDate.clone().startOf('month').add(this.cacheMonth, 'month'),
    }, () => resolve()))
  }

  async updateCalendarData() {
    const data = {};
    const date = this.state.cacheGoalStart.clone();
    while (this.state.cacheGoalEnd.isAfter(date)) {
      data[GoalLogic.getDateKey({date})] = {
        goals: GoalLogic.getShowGoalInDay({
          goals: this.state.goals,
          historyIndex: this.state.historyIndex,
          date
        }).length,
        success: (this.state.historyIndex[GoalLogic.getDateKey({date})] || [])
          .filter((history: GoalHistory) => history.isSuccess).length,
        fail: (this.state.historyIndex[GoalLogic.getDateKey({date})] || [])
          .filter((history: GoalHistory) => !history.isSuccess).length
      }
      date.add(1, "day")
    }
    this.setState({calendarData: data})
    return data
  }

  async refreshGoals() {
    const goals = await Dao.goal.listGoals();
    this.setState({goals});

  }


  async refreshGoalHistory() {
    const historyList = await Dao.goal.listGoalsHistory({
      startTime: this.state.cacheGoalStart.toDate(),
      endTime: this.state.cacheGoalEnd.toDate()
    })
    const historyIndex = historyList.reduce((p: any, v) => {
        // 按照日期建立数组
        const key = GoalLogic.getDateKey({date: moment(v.date)});
        // eslint-disable-next-line no-param-reassign
        (p[key] = p[key] || []).push(v);
        return p;
      },
      {},
    );
    this.setState({historyIndex});
  }

  async refreshAll() {
    await this.updateCacheDate()
    await Promise.all([this.refreshGoalHistory(), this.refreshGoals()]);
    await this.updateCalendarData()
  }


  event_selectDay({date}: { date: moment.Moment; last: moment.Moment }) {
    let isUpdate = this.state.cacheGoalStart.isAfter(date.clone().subtract(1, "month"))
    isUpdate = isUpdate || this.state.cacheGoalEnd.isBefore(date.clone().add(1, "month"))
    this.setState({selectedDate: date}, async () => {
      if (isUpdate) {
        await this.updateCacheDate();
        this.refreshGoalHistory().catch(() => null);
        this.updateCalendarData().catch(() => null);
      }
    });

  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <div className={styles.container}>
          <GoalCalendar
            ref={(box) => (box ? (this.goalCalendar = box) : null)}
            onChange={(data) => this.event_selectDay(data)}
            calendarData={this.state.calendarData}
          />

          <div className={styles.GoalItemBox}>
            {this.showGoals.map((goal: any) =>
              <GoalItem goal={goal}
                        key={goal.objectId}
                        afterOperation={() => this.refreshAll()}
                        onEdit={() =>
                          this.goalAddBox?.toggleAddGoalShow({
                            force: true,
                            day: this.state.selectedDate,
                            editGoal: goal,
                          })}
              />
            )}
            {this.showGoalHistory.map((history: any) =>
              <GoalHistoryItem key={history.objectId} history={history}/>
            )}
          </div>
          <div className={styles.addItemBox}>
            <Button
              type="dashed"
              className={styles.addItemBtn}
              onClick={() =>
                this.goalAddBox?.toggleAddGoalShow({day: this.state.selectedDate})
              }
            >
              <PlusOutlined/>
            </Button>
          </div>
        </div>
        <GoalAddBox
          ref={(box) => (box ? (this.goalAddBox = box) : null)}
          onSubmit={() => this.refreshAll()}
        />
      </div>
    );
  }
}
