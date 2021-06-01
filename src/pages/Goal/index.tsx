import React from 'react';
import styles from "./index.less";
import type {FormInstance} from "antd";
import {Button, message, Modal} from "antd";
import * as Dao from "@/services/Dao/index";

import {getIntl} from 'umi';
import {
  CheckSquareOutlined,
  CloseSquareOutlined,
  DeleteFilled,
  EditFilled,
  PlusOutlined
} from "@ant-design/icons";
import {CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined} from "@ant-design/icons/lib";
import moment from "moment";
import type {Goal} from "@/services/Dao/struct/goal/Goal";
import GoalAddBox from "@/pages/Goal/components/GoalAddBox";
import GoalCalendar from "@/pages/Goal/components/GoalCalendar";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";


export default class GoalPage extends React.Component {
  addGoalFrom = React.createRef<FormInstance>();
  goalAddBox?: GoalAddBox;
  goalCalendar?: GoalCalendar;

  state: any = {
    goals: [],
    historyIndex: {},
    isGoalAddShow: false,
    historyCacheStart: moment(),
    historyCacheEnd: moment(),
    selectedDate: moment()
  }

  componentDidMount() {
    this.refreshAll().catch(e => e)
    const win: any = window;
    // 全局消息通知获取
    win.insist.event.addListener("addGoalInPage", () => this.goalAddBox?.toggleAddGoalShow({
      force: true,
      day: this.goalCalendar?.nowDate()
    }))
  }

  componentWillUnmount() {
    const win: any = window;
    // 离开时,移除消息通知监听器
    win.insist.event.removeAllListeners("addGoalInPage")
  }

  get showGoals() {
    return this.getShowGoalInDay({date: this.state.selectedDate});
  }

  get showGoalHistory() {
    return this.state.historyIndex[this.getDateKey({date: this.state.selectedDate})] || [];
  }

  async refreshGoals() {
    const goals = await Dao.goal.listGoals();
    this.setState({goals})
  }


  getShowGoalInDay({date}: { date: moment.Moment }) {
    if (moment().startOf("day").isAfter(date, "day")) return [];
    return this.state.goals.reduce((p: Goal[], goal: Goal) => {
      let isVisible = false;
      let count;
      // day,week,month 计算所需变量
      let startTime = moment();
      let endTime = moment();
      switch (goal.repetition) {
        case "once":
          isVisible = date.isSame(goal.appointDate || moment(), "day");
          break;
        case "day":
        case "week":
        case "month":
          // 计算在周期内,一共的执行次数
          count = 0;
          if (goal.repetition === "day") {
            startTime = date.clone().startOf("day")
            endTime = date.clone().startOf("day")
          } else if (goal.repetition === "week") {
            startTime = date.clone().startOf("isoWeek")
            endTime = date.clone().endOf("isoWeek")
          } else if (goal.repetition === "month") {
            startTime = date.clone().startOf("month")
            endTime = date.clone().endOf("month")
          }
          while (startTime.isSameOrBefore(endTime, "day")) {
            count += (this.state.historyIndex[this.getDateKey({date: startTime})] || [])
              .filter((history: GoalHistory) => history.goal.objectId === goal.objectId).length;
            startTime.add(1, "day")
          }
          isVisible = !!goal.repetitionCount && count >= goal.repetitionCount
          break;
        case "appoint_week":
        // eslint-disable-next-line no-fallthrough
        case "appoint_month":
          if ((goal.repetition === "appoint_month" ? date.date() : date.isoWeekday()) === goal.appoint) {
            count = (this.state.historyIndex[this.getDateKey({date})] || [])
              .filter((history: GoalHistory) => history.goal.objectId === goal.objectId).length;
            isVisible = !count;
          }
          break;

        default:

      }

      if (isVisible) p.push(goal);
      return p;
    }, []);
  }

  getDateKey({date}: { date: moment.Moment }) {
    return date.format("YYYY-MM-DD")
  }


  async refreshGoalHistory() {
    const startTime = this.goalCalendar?.nowDate().startOf("month").subtract(3, "month").toDate()
    const endTime = this.goalCalendar?.nowDate().startOf("month").add(3, "month").toDate()
    const historyIndex = (await Dao.goal.listGoalsHistory({startTime, endTime})).reduce((p: any, v) => {
      // 按照日期建立数组
      const key = this.getDateKey({date: moment(v.date)});
      // eslint-disable-next-line no-param-reassign
      (p[key] = p[key] || []).push(v);
      return p
    }, {})
    this.setState({historyIndex})
  }

  async refreshAll() {
    return Promise.all([this.refreshGoalHistory(), this.refreshGoals(),])
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
      onOk: () => Dao.goal.deleteGoal({goal})
        .then(() => this.setState({goals: this.state.goals.filter((f: any) => f !== goal)}))
        .catch(err => message.error(`移除失败: ${err.message}`))
    })

  }

  event_finishGoal({isSuccess, goal, content}: { isSuccess: boolean, goal: Goal, content?: string }) {
    return Modal.confirm({
      title: isSuccess ? "已经完成了吗" : '失败了吗',
      icon: isSuccess ?
        <CheckCircleOutlined style={{color: "#93DD1A"}}/> :
        <CloseCircleOutlined style={{color: "#C0223B"}}/>,
      content: `${goal.title}`,
      okText: 'yes',
      okType: 'danger',
      cancelText: 'no',
      maskClosable: true,
      centered: true,
      onOk: async () => {
        await Dao.goal.finishGoal({goal, isSuccess, content})
          .then(() => this.setState({goals: this.state.goals.filter((f: any) => f !== goal)}))
          .catch(err => message.error(`操作失败: ${err.message}`))

        await this.refreshAll()
      }
    })
  }

  event_selectDay({date, last}: { date: moment.Moment, last: moment.Moment }) {
    const isUpdate = last.isSame(date, "month");
    if (isUpdate) this.refreshGoalHistory().catch(() => null)
    this.setState({selectedDate: date})
  }


  render() {
    const intl = getIntl()
    return (
      <div style={{height: "100%"}}>
        <div className={styles.container}>
          <GoalCalendar
            ref={box => box ? this.goalCalendar = box : null}
            onChange={data => this.event_selectDay(data)}/>

          <div className={styles.GoalItemBox}>
            {this.showGoals.map((goal: any) => {
              // @ts-ignore
              return <div tabIndex="0" key={goal.objectId} className={styles.GoalItem}>
                <div className={styles.GoalItemTitle}>{goal.title}</div>
                <div className={styles.GoalItemContent}>{goal.content}</div>
                <div className={styles.GoalItemInfo}>
                  <div
                    className={styles.GoalItemInfoRepetition}>{intl.formatMessage({id: `goal.${goal.repetition}`})}</div>
                </div>
                <div className={styles.GoalItemOperation}>
                  <DeleteFilled onClick={() => this.event_deleteGoal({goal})} style={{color: "#990033"}}/>

                  <EditFilled onClick={() => this.goalAddBox?.toggleAddGoalShow({
                    force: true,
                    day: this.goalCalendar?.nowDate(),
                    editGoal: goal
                  })}/>
                  <CloseSquareOutlined onClick={() => this.event_finishGoal({isSuccess: false, goal})}
                                       style={{color: "#CC0033"}}/>
                  <CheckSquareOutlined onClick={() => this.event_finishGoal({isSuccess: true, goal})}
                                       style={{color: "#99CC00"}}/>
                </div>

              </div>
            })}
            {this.showGoalHistory.map((history: any) => {
              // @ts-ignore
              return <div tabIndex="0" key={history.objectId} className={styles.GoalItem}>
                <div className={styles.GoalItemTitle}>{history.title}</div>
                <div className={styles.GoalItemContent}>{history.content}</div>


              </div>
            })}
          </div>
          <div className={styles.addItemBox}>
            <Button type="dashed" className={styles.addItemBtn}
                    onClick={() => this.goalAddBox?.toggleAddGoalShow({day: this.goalCalendar?.nowDate()})}>
              <PlusOutlined/>
            </Button>
          </div>
        </div>
        <GoalAddBox
          ref={box => box ? this.goalAddBox = box : null}
          onSubmit={() => this.refreshAll()}
        />
      </div>
    );
  }
}

