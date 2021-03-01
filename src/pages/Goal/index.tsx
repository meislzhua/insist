import React from 'react';
import styles from "./index.less";
import {Button, Drawer, Form, FormInstance, Input, message, Modal, Select} from "antd";
import * as Dao from "@/services/Dao";

import {getIntl} from 'umi';
import {
  CheckSquareOutlined,
  CloseSquareOutlined,
  DeleteFilled,
  EditFilled, PlusCircleOutlined,
} from "@ant-design/icons";
import {CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined} from "@ant-design/icons/lib";
import moment from "moment";


export default class Diary extends React.Component {
  addGoalFrom = React.createRef<FormInstance>();

  state: any = {
    goals: [],
    isGoalAddShow: false
  }

  constructor(props: {}, context: any) {
    super(props, context);
    this.refreshGoals().catch(e => e)
  }

  get showGoals() {
    return this.state.goals
  }

  async refreshGoals() {
    const goals = await Dao.listGoals();
    console.log("获取到的goals", goals)
    this.setState({goals})
  }

  toggleAddGoalShow({force}: { force?: boolean } = {}) {
    if (force !== undefined) this.setState({isGoalAddShow: force})
    else this.setState({isGoalAddShow: !this.state.isGoalAddShow})
  }

  event_deleteGoal({goal}: { goal: Dao.Goal }) {
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
      onOk: () => Dao.deleteGoal({goal})
        .then(() => this.setState({goals: this.state.goals.filter((f: any) => f !== goal)}))
        .catch(err => message.error(`移除失败: ${err.message}`))
    })

  }

  event_finishGoal({isSuccess, goal, content}: { isSuccess: boolean, goal: Dao.Goal, content?: string }) {
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
      onOk: () => {
        let task: Promise<any> = Promise.reject();
        if (goal.repetition === "once") {
          task = Dao.finishGoal({goal, isSuccess})
        } else {
          let nextDay;
          if (goal.repetition === "day") nextDay = moment().startOf("day").add(1, "day").toDate()
          if (goal.repetition === "week") nextDay = moment().startOf("isoWeek").add(1, "week").toDate()
          if (goal.repetition === "month") nextDay = moment().startOf("month").add(1, "month").toDate()
          if (goal.repetition === "appoint_week") nextDay = moment().startOf("day").add(1, "day").toDate()

          task = Dao.finishGoal({goal, isSuccess, nextDay, content})
        }

        task
          .then(() => this.setState({goals: this.state.goals.filter((f: any) => f !== goal)}))
          .catch(err => message.error(`操作失败: ${err.message}`))

      }
    })
  }

  module_goalAddBox() {
    return (
      <Drawer
        placement="bottom" closable={false}
        onClose={() => this.toggleAddGoalShow()}
        visible={this.state.isGoalAddShow}
        bodyStyle={{padding: "5px"}}
        height={"50%"}
        footer={
          <Button block
                  type="primary"
                  style={{width: "100%"}}
                  onClick={() => {
                    Dao.addGoal({goal: this.addGoalFrom.current?.getFieldsValue()})
                      .then(data => this.setState({goals: [...this.state.goals, data]}))
                      .then(() => this.toggleAddGoalShow())
                      .catch(err => message.error(`增加目标失败: ${err.message}`))
                  }}
          >
            确定
          </Button>
        }>
        <Form ref={this.addGoalFrom} initialValues={{repetition: "once"}}>
          <Form.Item label="重复类型" name={'repetition'}>
            <Select>
              <Select.Option value="once">单次</Select.Option>
              <Select.Option value="day">每日</Select.Option>
              <Select.Option value="week">每周</Select.Option>
              <Select.Option value="month">每月</Select.Option>
              <Select.Option value="appoint_week">指定星期几</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="选项标题" name={'title'}><Input placeholder="请输入你想要记录的类型的名字"/></Form.Item>
        </Form>
      </Drawer>
    )
  }


  render() {
    const intl = getIntl()
    return (
      <div className={styles.container}>

        {this.showGoals.map((goal: any) => {
          // @ts-ignore
          return <div tabIndex="0" key={goal.objectId} className={styles.GoalItemBox}>
            <div className={styles.GoalItemTitle}>{goal.title}</div>
            <div className={styles.GoalItemContent}>{goal.content}</div>
            <div className={styles.GoalItemInfo}>
              <div className={styles.GoalItemInfoRepetition}>{intl.formatMessage({id: `goal.${goal.repetition}`})}</div>
            </div>
            <div className={styles.GoalItemOperation}>
              <DeleteFilled onClick={() => this.event_deleteGoal({goal})} style={{color: "#990033"}}/>

              <EditFilled/>
              <CloseSquareOutlined onClick={() => this.event_finishGoal({isSuccess: false, goal})}
                                   style={{color: "#CC0033"}}/>
              <CheckSquareOutlined onClick={() => this.event_finishGoal({isSuccess: true, goal})}
                                   style={{color: "#99CC00"}}/>
            </div>

          </div>
        })}
        <PlusCircleOutlined className={styles.addItemBtn} onClick={() => this.toggleAddGoalShow()}/>
        {this.module_goalAddBox()}

      </div>
    );
  }
}

