import React from 'react';
import styles from "./index.less";
import {Button, FormInstance, message, Modal} from "antd";
import * as Dao from "@/services/Dao/index";
import {Calendar} from 'antd';

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
import {Goal} from "@/services/Dao/struct/goal/Goal";
import GoalAddBox from "@/pages/Goal/components/GoalAddBox";


export default class GoalPage extends React.Component {
  addGoalFrom = React.createRef<FormInstance>();
  goalAddBox?: GoalAddBox;

  state: any = {
    goals: [],
    history: {},
    isGoalAddShow: false,
    selectedDate: moment()
  }

  componentDidMount() {
    this.setState({selectedDate: moment().startOf("day")})
    this.refreshAll().catch(e => e)
    const win: any = window;
    win.insist.event.addListener("addGoalInPage", () => this.goalAddBox?.toggleAddGoalShow({
      force: true,
      day: this.state.selectedDate
    }))
  }

  componentWillUnmount() {
    const win: any = window;
    win.insist.event.removeAllListeners("addGoalInPage")
  }

  get showGoals() {
    if (moment().startOf("day").isAfter(this.state.selectedDate, "day")) return [];
    return this.state.goals;
  }

  get showGoalHistory() {
    return this.state.history[this.state.selectedDate.format("YYYY-MM-DD")] || [];
  }

  async refreshGoals() {
    const goals = await Dao.goal.listGoals();
    this.setState({goals})
  }

  async refreshGoalHistory() {
    const startTime = this.state.selectedDate.clone().startOf("month").subtract(1, "month").toDate()
    const endTime = this.state.selectedDate.clone().startOf("month").add(1, "month").toDate()
    const history = (await Dao.goal.listGoalsHistory({startTime, endTime})).reduce((p: any, v) => {
      // 按照日期建立数组
      const key = moment(v.date).format("YYYY-MM-DD");
      // eslint-disable-next-line no-param-reassign
      (p[key] = p[key] || []).push(v);
      return p
    }, {})
    this.setState({history})
  }

  async refreshAll() {
    return Promise.all([
      this.refreshGoalHistory(),
      this.refreshGoals(),
    ])
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

  event_selectDay({date}: { date: any }) {
    const isUpdate = this.state.selectedDate.isSame(date, "month");
    this.setState({selectedDate: date.startOf("day")});
    if (isUpdate) this.refreshGoalHistory().catch(() => null)
  }


  render() {
    const intl = getIntl()
    return (
      <div style={{height: "100%"}}>
        <div className={styles.container}>
          <Calendar fullscreen={false} value={this.state.selectedDate} className={styles.calendar}
                    onChange={date => this.event_selectDay({date})}/>

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
                    day: this.state.selectedDate,
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
                    onClick={() => this.goalAddBox?.toggleAddGoalShow({day: this.state.selectedDate})}>
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

