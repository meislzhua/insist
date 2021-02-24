import React from 'react';
import styles from "./index.less";
import {PlusCircleOutlined} from '@ant-design/icons';
import moment from "moment";
import {
  Drawer,
  Form,
  Button,
  Input,
  Select,
  FormInstance,
  message,
  Carousel,
  Empty,
  DatePicker,
  Card,
  Modal,
  Radio
} from "antd";
import * as Dao from "@/services/Dao";
import {DiaryItem} from "@/services/Dao";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {
  CoffeeOutlined, DislikeOutlined,
  ExclamationCircleOutlined, FireOutlined,
  FrownOutlined,
  HeartOutlined, LikeOutlined,
  MehOutlined,
  SmileOutlined
} from "@ant-design/icons/lib";

const InternalOption: any = {
  mood: {
    type: "mood",
    objectId: "internal_mood",
    title: "今日心情",
    isInternal: true
  }
}
const moodClass = [styles.internalMoodIcon, styles.moodBtnIcon, styles.moodBtnIconActive].join(" ")
const MoodIcon = {
  ant_smile: <SmileOutlined className={moodClass}/>,
  ant_meh: <MehOutlined className={moodClass}/>,
  ant_frown: <FrownOutlined className={moodClass}/>,
  ant_heart: <HeartOutlined className={moodClass}/>,
  ant_fire: <FireOutlined className={moodClass}/>,
  ant_coffee: <CoffeeOutlined className={moodClass}/>,
  ant_like: <LikeOutlined className={moodClass}/>,
  ant_dislike: <DislikeOutlined className={moodClass}/>,
}
export default class Diary extends React.Component {
  addDiaryOptionFrom = React.createRef<FormInstance>();
  writeDiaryItemFrom = React.createRef<FormInstance>();

  state = {
    isLoading: false,  // 是否正在请求网络
    date: this.getDate(),
    diary: null,
    diaryItems: [] as Dao.DiaryItem[],
    isDiaryOptionSelectShow: false,
    isAddDiaryOptionShow: false,
    diaryOption: [],
    diaryInputOption: null
  }


  get showDiaryOptions() {
    const keys: any = {}
    this.state.diaryItems.forEach((item: Dao.DiaryItem) => {
      keys[item.optionId] = 1
    })
    return this.state.diaryOption.filter((item: Dao.DiaryOption) => !keys[item.objectId])
  }

  get showDiaryItems() {
    return this.state.diaryItems.filter((option: Dao.DiaryItem) => option.type !== "mood")
  }

  get moodDiaryItem(): Dao.DiaryItem | undefined {
    return this.state.diaryItems.find((option: Dao.DiaryItem) => option.type === "mood")
  }


  constructor(props: {}, context: any) {
    super(props, context);
    this.refreshDiaryOption().catch(e => e)
    this.refreshDiary().catch(e => e)
  }

  getDate() {
    const date = moment()
    if (date.hour() < 5) date.subtract(1, "day");
    date.startOf("day")
    return date;
  }

  toggleDiaryItemSelectShow({force}: { force?: boolean } = {}) {
    if (force !== undefined) this.setState({isDiaryOptionSelectShow: force})
    else this.setState({isDiaryOptionSelectShow: !this.state.isDiaryOptionSelectShow})
  }

  toggleAddDiaryOptionShow({force}: { force?: boolean } = {}) {
    if (force !== undefined) this.setState({isAddDiaryOptionShow: force})
    else this.setState({isAddDiaryOptionShow: !this.state.isAddDiaryOptionShow})

    this.toggleDiaryItemSelectShow()
  }

  async toggleDiaryInputShow({option}: { option?: Dao.DiaryOption } = {}) {
    return new Promise(resolve => this.setState({diaryInputOption: option}, () => resolve(null)))

  }

  editDiaryItemShow({option, item}: { option?: Dao.DiaryOption, item: Dao.DiaryItem }) {
    let targetOption: Dao.DiaryOption | undefined = option || this.state.diaryOption.find((v: any) => v.objectId === item.optionId)
    console.log("发生编辑事件", targetOption, item)

    if (targetOption) {
      targetOption = {...targetOption};
      targetOption.content = item.content
      targetOption.itemId = item.objectId
    }
    this.toggleDiaryInputShow({option: targetOption})
      .then(() => this.writeDiaryItemFrom.current?.setFieldsValue({content: item.content}))

  }

  async refreshDiaryOption() {
    const list = await Dao.getDiaryOption();
    this.setState({diaryOption: list})
    console.log("更新option", list)

  }

  async refreshDiary() {
    const diary = await Dao.getDiary({date: this.state.date.toDate()});
    this.setState({diaryItems: diary?.items || []})
    this.setState({diary})
  }

  event_saveDiaryInput() {
    const option: Dao.DiaryOption | null = this.state.diaryInputOption;
    const father = option || {} as Dao.DiaryOption
    const item: Dao.DiaryItem = {
      title: father.title,
      type: father.type,
      optionId: father.objectId,
      isInternal: father.isInternal,
      ...(this.writeDiaryItemFrom.current?.getFieldsValue() || {}),
    }
    console.log("准备添加,表格内容:", this.writeDiaryItemFrom.current?.getFieldsValue(), item)

    if (father.itemId) {
      item.objectId = father.itemId;
      Dao.editDiaryItem({item})
        .then(() => {
          const index = this.state.diaryItems.findIndex((v: Dao.DiaryItem) => v.objectId === item.objectId)
          console.log("修改前", this.state.diaryItems, index)
          if (index !== undefined && index !== null) this.state.diaryItems.splice(index, 1, item)
          else this.state.diaryItems.push(item)
          console.log("修改后", this.state.diaryItems)

          this.setState({diaryItems: this.state.diaryItems})
        })
        .then(() => this.writeDiaryItemFrom.current?.resetFields())
        .then(() => this.toggleDiaryInputShow())
    } else {
      this.addDiaryItem({date: this.state.date.toDate(), item})
        .then(() => this.toggleDiaryInputShow())
        .catch(err => message.error(`添加失败: ${err.message}`))
    }


  }

  async addDiaryOption(data: any): Promise<any> {
    if (data === undefined) return null;
    return Dao.saveDiaryOption(data)
      .then(() => data)
  }

  async addDiaryItem({date, item}: { date: Date, item: DiaryItem }): Promise<any> {
    if (date === undefined || item === undefined) return null;

    return Dao.addDiaryItem({date, item})
      .then(data => this.setState({diaryItems: [...this.state.diaryItems, data]}))
      .then(() => this.writeDiaryItemFrom.current?.resetFields())

  }

  async removeDiaryItem({date, item}: { date: Date, item: DiaryItem }): Promise<any> {
    if (date === undefined || item === undefined) return null;

    return Dao.removeDiaryItem({date, item})
      .then(() => this.setState({diaryItems: this.state.diaryItems.filter(f => f !== item)}))

  }


  module_DiaryItemSelectBox() {
    let content = <div className={styles.diaryOptionBox}><Empty description={"已经完成记录!"}/></div>
    if (this.showDiaryOptions.length) content = <div className={styles.diaryOptionBox}>
      {
        this.showDiaryOptions.map((option: Dao.DiaryOption) => {
          return (
            <div className={styles.diaryOption} key={option.objectId}>
              <Carousel dots={false} effect={"scrollx"}>
                <div className={styles.diaryOptionTitle}
                     onClick={() => {
                       this.toggleDiaryInputShow({option})
                       this.writeDiaryItemFrom.current?.resetFields();
                     }}>
                  {option.title}
                </div>
                <div className={styles.diaryOptionOperationBox}>
                  <div className={styles.delete} onClick={() => {
                    Dao.deleteDiaryOption({option})
                      .then(() => this.refreshDiaryOption())
                  }}>删除
                  </div>
                </div>
              </Carousel>
            </div>
          )
        })
      }
    </div>
    return (
      <Drawer
        placement="bottom"
        closable={false}
        onClose={() => this.toggleDiaryItemSelectShow()}
        visible={this.state.isDiaryOptionSelectShow}
        bodyStyle={{padding: "0", height: "100%"}}
        height={"50%"}
        footer={
          <Button type="dashed" block
                  onClick={() => this.toggleAddDiaryOptionShow()}
                  style={{width: "100%"}}>
            新增
          </Button>
        }
      >
        {content}
      </Drawer>
    )
  }

  module_DiaryAddBox() {
    return (
      <Drawer
        placement="bottom"
        closable={false}
        onClose={() => this.toggleAddDiaryOptionShow()}
        visible={this.state.isAddDiaryOptionShow}
        bodyStyle={{padding: "5px"}}
        height={"50%"}
        footer={
          <Button block
                  type="primary"
                  style={{width: "100%"}}
                  onClick={() => {
                    this.addDiaryOption(this.addDiaryOptionFrom.current?.getFieldsValue())
                      .catch(e => {
                        message.error("保存失败");
                        throw e;
                      })
                      .then(() => this.refreshDiaryOption())
                      .then(() => this.toggleAddDiaryOptionShow())
                      .then(() => this.addDiaryOptionFrom.current?.resetFields())

                  }}
          >
            确定
          </Button>
        }>
        <Form ref={this.addDiaryOptionFrom} initialValues={{type: "text"}}>
          <Form.Item label="输入类型" name={'type'}>
            <Select>
              <Select.Option value="text">文本</Select.Option>
              <Select.Option value="time">时间</Select.Option>
              <Select.Option value="file" disabled={true}>文件</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="选项标题" name={'title'}><Input placeholder="请输入你想要记录的类型的名字"/></Form.Item>
        </Form>
      </Drawer>
    )
  }

  module_DiaryInput() {
    // @ts-ignore
    const option: Dao.DiaryOption = this.state.diaryInputOption;
    let content = null;
    if (option) {
      content = option?.type === "text" && <Input.TextArea style={{height: "100%"}}/>
      content = content || option?.type === "mood" && (
        <Radio.Group name={"content"} className={styles.moodInput}>
          {Object.keys(MoodIcon).map(iconKey => {
            return <Radio.Button value={iconKey} key={iconKey} className={styles.moodInputItem}>
              {MoodIcon[iconKey]}
            </Radio.Button>
          })}
        </Radio.Group>)
    }
    return <Drawer
      placement="bottom"
      closable={false}
      onClose={() => this.toggleDiaryInputShow()}
      visible={!!option}
      title={option?.title}
      bodyStyle={{padding: "5px"}}
      height={"50%"}
      zIndex={10000}
      footer={
        <Button block type="primary" style={{width: "100%"}}
                onClick={() => this.event_saveDiaryInput()}>
          确定
        </Button>
      }>
      <Form initialValues={{content: ""}} ref={this.writeDiaryItemFrom} className={styles.diaryInputForm}>
        <Form.Item name={"content"}>
          {content}
        </Form.Item>
      </Form>
    </Drawer>
  }


  render() {
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
      <div className={styles.container}>
        <div className={styles.date}>
          <DatePicker size="large" allowClear={false} dropdownClassName={styles.dateBox}
                      defaultValue={this.state.date} style={{width: "100%"}}
                      onChange={date => {
                        console.log("选择的日期", date)
                        this.setState({date: date?.startOf("day")},
                          () => this.refreshDiary()
                        )
                      }}
          />
        </div>
        {this.showDiaryItems.map((item: Dao.DiaryItem) => {
          return (
            <div key={item.objectId}>
              <Card size="small" title={item.title} className={styles.diaryItem}
                    extra={(
                      <>
                        <EditOutlined className={styles.editBtn} onClick={() => this.editDiaryItemShow({item})}/>
                        <DeleteOutlined className={styles.deleteBtn} onClick={() => {
                          Modal.confirm({
                            title: '删除记录项?',
                            icon: <ExclamationCircleOutlined/>,
                            content: `正在删除:${item.title}`,
                            okText: 'Yes',
                            okType: 'danger',
                            cancelText: 'No',
                            maskClosable: true,
                            centered: true,
                            onOk: () => this.removeDiaryItem({date: this.state.date.toDate(), item})
                              .then(() => this.toggleDiaryInputShow())
                              .catch(err => message.error(`移除失败: ${err.message}`))
                          })

                        }}/>
                      </>
                    )}
                    headStyle={{backgroundColor: "#eeeeee"}}>
                <div style={{whiteSpace: "pre-wrap"}}>{item.content}</div>
              </Card>

            </div>
          )
        })}
        {!this.showDiaryItems.length &&
        <Empty description={"开始记录你的日常吧!"} style={{marginTop: "50px", color: "#999999"}}/>}


        <PlusCircleOutlined className={styles.addItemBtn} onClick={() => this.toggleDiaryItemSelectShow()}/>
        <div className={styles.moodBtnBox} onClick={() => {
          if (this.moodDiaryItem) this.editDiaryItemShow({
            option: InternalOption.mood,
            item: this.moodDiaryItem
          })
          else this.toggleDiaryInputShow({option: InternalOption.mood})
        }}>
          {MoodIcon[this.moodDiaryItem?.content || ""] || <SmileOutlined className={styles.moodBtnIcon}/>}

        </div>
        {this.module_DiaryItemSelectBox()}
        {this.module_DiaryAddBox()}
        {this.module_DiaryInput()}

      </div>
    );
  }
}

