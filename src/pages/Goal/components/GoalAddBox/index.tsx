import React from 'react';
import styles from './index.less';
import {FormInstance, Radio} from "antd";
import {Button, Drawer, Form, Input, message, Select, DatePicker, Tag} from "antd";
import moment from "moment";
import type {Goal} from "@/services/Dao/struct/goal/Goal";
import {PlusOutlined} from "@ant-design/icons/lib";
import GoalTagItem from "@/pages/Goal/components/GoalTagItem";
import type {GoalTag} from '@/services/Dao/struct/goal/GoalTag';
import {Dao} from "@/services/Dao";
import {GoalPriority} from "@/services/Dao/struct/goal/Goal";

interface GoalAddBoxProps {
  onSubmit?: (goal: Goal) => void;
}

export default class GoalAddBox extends React.Component<GoalAddBoxProps> {
  addGoalFrom = React.createRef<FormInstance>();
  addTagInput = React.createRef<Input>();

  state: any = {
    day: null,
    isGoalAddShow: false,
    form: {},
    isAddTag: false,
    newTag: "",
    tags: []
  }

  componentDidMount() {
    this.refreshTags();
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
      const nowTags = (editGoal?.tags || []).map((tag: GoalTag) => tag.name);
      if (isGoalAddShow) {
        // eslint-disable-next-line no-param-reassign
        this.state.tags.forEach((tag: GoalTag) => tag.isActive = nowTags.includes(tag.name))
        this.setState({tags: this.state.tags});

        if (editGoal) {
          const data: any = {...editGoal};
          if (data.appointDate) data.appointDate = moment(data.appointDate)
          this.addGoalFrom.current?.setFieldsValue(data)
        } else {
          this.addGoalFrom.current?.resetFields();
        }

        if (moment().isBefore(day, "day")) this.addGoalFrom.current?.setFieldsValue({appointDate: day?.clone()})
        this.setState({editGoal, day, form: this.addGoalFrom.current?.getFieldsValue()})
        setTimeout(() => this.addGoalFrom.current?.getFieldInstance("title")?.focus(), 0)
      }
    })
  }

  async refreshTags() {
    this.setState({tags: await Dao.goal.listGoalTag()})
  }

  async event_addTag() {
    this.setState({newTag: "", isAddTag: true}, () => this.addTagInput?.current?.focus());
  }

  async event_submitAddTag() {
    const {tags, newTag} = this.state;
    if (tags.find((tag: GoalTag) => tag.name === newTag)) return message.error(`已存在相同的tag: ${newTag}`);
    const tag: any = {name: this.addTagInput?.current?.input.value || ""};
    return Dao.goal.addGoalTag({tag})
      .then(newTags => this.setState({tags: [...tags, newTags]}))
      .then(() => message.success("成功添加"))
      .catch(err => message.error(`添加失败: ${err.message}`))
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
      data.tags = this.state.tags.map((tag: GoalTag) => tag.isActive && tag).filter((name: GoalTag) => !!name)
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
    const {isAddTag, tags} = this.state;
    return (
      <Drawer
        placement="bottom" closable={false}
        onClose={() => this.toggleAddGoalShow()}
        visible={this.state.isGoalAddShow}
        bodyStyle={{padding: "5px"}}
        height={"400px"}
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
          <Form.Item label={"优先级"} name={'priority'}>
            <Radio.Group
              style={{width: "100%"}}
              size={"small"}
              options={[
                {label: "不重要", value: GoalPriority.Optional},
                {label: "普通", value: GoalPriority.Normal},
                {label: "高优先", value: GoalPriority.High},
              ]}
              defaultValue={GoalPriority.Normal}
            />
          </Form.Item>

          <Form.Item label="Tag">
            {tags.map((tag: GoalTag) => <GoalTagItem key={tag.name} tag={tag}/>)}
            {isAddTag && (
              <Input
                ref={this.addTagInput}
                type="text"
                size="small"
                style={{width: 78}}
                onChange={e => this.setState({newTag: e.target.value})}
                onBlur={() => this.setState({newTag: "", isAddTag: false})}
                onPressEnter={() => this.event_submitAddTag()}
                onKeyPress={event => event.stopPropagation()}
              />
            )}
            {!isAddTag && (

              <Tag onClick={() => this.event_addTag()} className={styles.addTag}><PlusOutlined/></Tag>
            )}
          </Form.Item>

        </Form>
      </Drawer>
    )
  }
}
