import React from 'react';
import styles from './index.less';
import {Button, Drawer, Form, FormInstance, Input, message, Select, DatePicker} from "antd";
import * as Dao from "@/services/Dao";
import moment from "moment";
import {Goal} from "@/services/Dao/struct/goal/Goal";

interface GoalAddBoxProps {
  onSubmit?: (goal: Goal) => void;
}

export default class GoalAddBox extends React.Component<GoalAddBoxProps> {
  addGoalFrom = React.createRef<FormInstance>();

  state: any = {
    day: null,
    isGoalAddShow: false,
    form: {}
  }

  get isNumberRepetition() {
    return ["day", "week", "month"].includes(this.state.form.repetition)
  }

  get isAppointRepetition() {
    return ["appoint_week", "appoint_month"].includes(this.state.form.repetition)
  }

  // 重复任务是否需要缩进
  get isRetract() {
    return this.isNumberRepetition || this.isAppointRepetition;
  }

  toggleAddGoalShow({force, day, editGoal}: { force?: boolean, day?: moment.Moment, editGoal?: Goal } = {}) {
    const isGoalAddShow = force ?? !this.state.isGoalAddShow
    this.setState({isGoalAddShow}, () => {
      // 设置弹出添加框
      if (isGoalAddShow) {
        if (editGoal) {
          const data: any = {...editGoal};
          if (data.appointDate) data.appointDate = moment(data.appointDate)
          this.addGoalFrom.current?.setFieldsValue(data)
        } else this.addGoalFrom.current?.resetFields();
        this.setState({editGoal, day, form: this.addGoalFrom.current?.getFieldsValue()})
        setTimeout(() => this.addGoalFrom.current?.getFieldInstance("title")?.focus(), 0)
      }
    })
  }

  async submit() {
    // 校验表单是否正常,并设置焦点
    try {
      await this.addGoalFrom.current?.validateFields()
    } catch (err) {
      try {
        this.addGoalFrom.current?.getFieldInstance(err.errorFields[0].name).focus();
      } catch (e) {
      }
      return;
    }
    // 提交增加目标
    try {
      const data = this.addGoalFrom.current?.getFieldsValue();
      if (data.appointDate) data.appointDate = data.appointDate.startOf("day").toDate();
      if (data.repetitionCount) data.repetitionCount *= 1;

      const goal = this.state.editGoal ? await Dao.goal.editGoal({
        goal: data,
        id: this.state.editGoal.objectId
      }) : await Dao.goal.addGoal({goal: data});
      if (this.props.onSubmit) this.props.onSubmit(goal);
      this.toggleAddGoalShow()
    } catch (err) {
      message.error(`增加目标失败: ${err.message}`)
    }
  }

  render() {
    return (
      <Drawer
        placement="bottom" closable={false}
        onClose={() => this.toggleAddGoalShow()}
        visible={this.state.isGoalAddShow}
        bodyStyle={{padding: "5px"}}
        // height={"50%"}
        className={styles.addBox}
        footer={
          <Button block
                  type="primary"
                  style={{width: "100%"}}
                  onClick={() => this.submit()}
          >
            确定
          </Button>
        }>
        <Form
          onKeyPress={event => (event.keyCode || event.which || event.charCode) === 13 && this.submit()}
          ref={this.addGoalFrom}
          layout={"vertical"}
          initialValues={{repetition: "once", repetitionCount: 1}}
          onValuesChange={(_, values) => this.setState({form: values})}>

          <Form.Item label="Repetition">
            <Input.Group compact>
              <Form.Item name={'repetition'} noStyle>
                <Select style={{width: "70%"}} onSelect={value => {
                  if (value === "appoint_week") this.addGoalFrom.current?.setFieldsValue({appoint: (this.state.day || moment()).isoWeekday()})
                  if (value === "appoint_month") this.addGoalFrom.current?.setFieldsValue({appoint: (this.state.day || moment()).date()})
                }}>
                  <Select.Option value="once">单次</Select.Option>
                  <Select.Option value="day">每日N次</Select.Option>
                  <Select.Option value="week">每周N次</Select.Option>
                  <Select.Option value="month">每月N次</Select.Option>
                  <Select.Option value="appoint_week">每周几号(周几)</Select.Option>
                  <Select.Option value="appoint_month">每月N号</Select.Option>
                </Select>
              </Form.Item>
              {this.isNumberRepetition &&
              <Form.Item name={'repetitionCount'} noStyle>
                <Input type={"number"} style={{width: "30%"}} min={1} suffix="次"/>
              </Form.Item>
              }
              {this.isAppointRepetition &&
              <Form.Item name={'appoint'} noStyle>
                <Input type={"number"} style={{width: "30%"}}
                       suffix={this.state.form.repetition === "appoint_month" && "号"}
                       addonBefore={this.state.form.repetition === "appoint_week" && "每周"}
                       min={1}
                       max={this.state.form.repetition === "appoint_week" ? 7 : 31}
                />
              </Form.Item>
              }
              {!this.isRetract &&
              <Form.Item name={'appointDate'} noStyle>
                <DatePicker style={{width: "30%"}} placeholder={"指定日期"}/>
              </Form.Item>
              }
            </Input.Group>
          </Form.Item>

          <Form.Item label="Title" name={'title'} rules={[
            {
              required: true,
              message: '连目标都没有,这样和咸鱼有什么区别!',
            },
          ]}><Input placeholder="你的目标是?"/></Form.Item>
        </Form>
      </Drawer>
    )
  }
}
