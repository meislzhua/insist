import React from "react";
import {Calendar} from "antd";
import styles from "@/pages/Goal/components/GoalCalendar/index.less";
import moment from "moment";
import {
  DoubleLeftOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleRightOutlined
} from "@ant-design/icons";
import {GoalLogic} from "@/services/logic/goal";

interface GoalCalendarProps {
  onChange?: ({date, last}: { date: moment.Moment, last: moment.Moment }) => void;
  calendarData?: any;
}

interface GoalCalendarStates {
  selectedDate: moment.Moment
}

export default class GoalCalendar extends React.Component<GoalCalendarProps, GoalCalendarStates> {

  state: any = {
    selectedDate: moment().startOf("day"),
  }

  nowDate() {
    return this.state.selectedDate.clone();
  }

  onDateChange(date: moment.Moment) {
    this.props.onChange?.({date, last: this.state.selectedDate.clone()});
    this.setState({selectedDate: date});
  }

  header() {
    return (
      <div className={styles.calendarHeader}>
        <DoubleLeftOutlined className={styles.HeaderIcon}
                            onClick={() => this.onDateChange(this.state.selectedDate.subtract(1, "month"))}/>

        <LeftOutlined className={styles.HeaderIcon}
                      onClick={() => this.onDateChange(this.state.selectedDate.subtract(1, "day"))}/>
        <div className={styles.calendarHeaderDate}
             onClick={() => this.onDateChange(moment().startOf("day"))}>
          {this.state.selectedDate.format("YYYY年MM月DD日")}</div>
        <RightOutlined className={styles.HeaderIcon}
                       onClick={() => this.onDateChange(this.state.selectedDate.add(1, "day"))}/>
        <DoubleRightOutlined className={styles.HeaderIcon}
                             onClick={() => this.onDateChange(this.state.selectedDate.add(1, "month"))}/>
      </div>
    )
  }

  getCellData({date}: { date: moment.Moment }): { success: number, fail: number, goals: number, } {
    return this.props.calendarData[GoalLogic.getDateKey({date})] || {
      success: 0,
      fail: 0,
      goals: 0,
    }
  }

  dateCell({date}: { date: moment.Moment }) {
    const data = this.getCellData({date});
    const classNames = [styles.dateCell];
    if (this.state.selectedDate.isSame(date, "day")) classNames.push(styles.active);
    if (data.success) {
      classNames.push(styles.success);
      if (data.success >= 5) classNames.push("s-5")
      else classNames.push(styles[`s-${data.success}`])
    }
    if (data.fail) {
      classNames.push(styles.fail);
      if (data.fail >= 5) classNames.push("f-5")
      else classNames.push(styles[`f-${data.fail}`])
    }
    return (
      <div className={classNames.join(" ")}>
        <div className={styles.date}>{date.date()}</div>
        {data.goals ? (<div className={styles.goals}>{data.goals}</div>) : ""}
      </div>
    )
  }

  render() {
    return (
      <Calendar fullscreen={false}
                value={this.state.selectedDate} className={styles.calendar}
                onChange={date => this.onDateChange(date)}
                headerRender={() => this.header()}
                dateFullCellRender={(date) => this.dateCell({date})}
      />

    )
  }
}

