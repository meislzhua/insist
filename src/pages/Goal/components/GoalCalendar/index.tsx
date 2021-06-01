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

interface GoalCalendarProps {
  onChange?: ({date, last}: { date: moment.Moment, last: moment.Moment }) => void;
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
    console.log("日历改变了日期")
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

  render() {
    return (
      <Calendar fullscreen={false}
                value={this.state.selectedDate} className={styles.calendar}
                onChange={date => this.onDateChange(date)}
                headerRender={() => this.header()}
      />

    )
  }
}

