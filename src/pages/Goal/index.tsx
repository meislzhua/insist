import React from 'react';
import styles from './index.less';
import type {FormInstance} from 'antd';
import {Button, message, Modal} from 'antd';
import * as Dao from '@/services/Dao/index';

import {getIntl} from 'umi';
import {
  CheckSquareOutlined,
  CloseSquareOutlined,
  DeleteFilled,
  EditFilled,
  PlusOutlined,
} from '@ant-design/icons';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons/lib';
import moment from 'moment';
import type {Goal} from '@/services/Dao/struct/goal/Goal';
import GoalAddBox from '@/pages/Goal/components/GoalAddBox';
import GoalCalendar from '@/pages/Goal/components/GoalCalendar';
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

  event_deleteGoal({goal}: { goal: Goal }) {
    if (goal === undefined) return null;
    return Modal.confirm({
      title: '是否删除你的小目标?',
      icon: <ExclamationCircleOutlined/>,
      content: `正在准备删除: ${goal.title}`,
      okText: '这个目标我不需要了',
      okType: 'danger',
      cancelText: '还是坚持一下吧',
      maskClosable: true,
      centered: true,
      onOk: async () => {
        await Dao.goal
          .deleteGoal({goal})
          .then(() => this.setState({goals: this.state.goals.filter((f: any) => f !== goal)}))
          .catch((err) => message.error(`移除失败: ${err.message}`));
        await this.refreshAll();
      }
    });
  }

  event_finishGoal({
                     isSuccess,
                     goal,
                     content,
                   }: {
    isSuccess: boolean;
    goal: Goal;
    content?: string;
  }) {
    return Modal.confirm({
      title: isSuccess ? '已经完成了吗' : '失败了吗',
      icon: isSuccess ? (
        <CheckCircleOutlined style={{color: '#93DD1A'}}/>
      ) : (
        <CloseCircleOutlined style={{color: '#C0223B'}}/>
      ),
      content: `${goal.title}`,
      okText: 'yes',
      okType: 'danger',
      cancelText: 'no',
      maskClosable: true,
      centered: true,
      onOk: async () => {
        const appointDate = goal.repetition === "once" && goal.appointDate && moment(goal.appointDate).startOf("day").toDate();
        await Dao.goal
          .finishGoal({
            goal,
            isSuccess,
            content,
            appointDate: appointDate || undefined
          })
          .then(() => this.setState({goals: this.state.goals.filter((f: any) => f !== goal)}))
          .catch((err) => message.error(`操作失败: ${err.message}`));

        await this.refreshAll();
      },
    });
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
    const intl = getIntl();
    return (
      <div style={{height: '100%'}}>
        <div className={styles.container}>
          <GoalCalendar
            ref={(box) => (box ? (this.goalCalendar = box) : null)}
            onChange={(data) => this.event_selectDay(data)}
            calendarData={this.state.calendarData}
          />

          <div className={styles.GoalItemBox}>
            {this.showGoals.map((goal: any) => {
              // @ts-ignore
              return (
                <div tabIndex="0" key={goal.objectId} className={styles.GoalItem}>
                  <div className={styles.GoalItemTitle}>{goal.title}</div>
                  <div className={styles.GoalItemContent}>{goal.content}</div>
                  <div className={styles.GoalItemInfo}>
                    <div className={styles.GoalItemInfoRepetition}>
                      {intl.formatMessage({id: `goal.${goal.repetition}`})}
                    </div>
                  </div>
                  <div className={styles.GoalItemOperation}>
                    <DeleteFilled
                      onClick={() => this.event_deleteGoal({goal})}
                      style={{color: '#990033'}}
                    />

                    <EditFilled
                      onClick={() =>
                        this.goalAddBox?.toggleAddGoalShow({
                          force: true,
                          day: this.state.selectedDate,
                          editGoal: goal,
                        })
                      }
                    />
                    <CloseSquareOutlined
                      onClick={() => this.event_finishGoal({isSuccess: false, goal})}
                      style={{color: '#CC0033'}}
                    />
                    <CheckSquareOutlined
                      onClick={() => this.event_finishGoal({isSuccess: true, goal})}
                      style={{color: '#99CC00'}}
                    />
                  </div>
                </div>
              );
            })}
            {this.showGoalHistory.map((history: any) => {
              // @ts-ignore
              return (
                <div tabIndex="0" key={history.objectId} className={styles.GoalItem}>
                  <div className={styles.GoalItemTitle}>{history.title}</div>
                  <div className={styles.GoalItemContent}>{history.content}</div>
                  <div className={styles.goals}>{history.content}</div>
                </div>
              );
            })}
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
