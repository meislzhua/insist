import React from 'react';
import styles from './index.less';

import {CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons/lib";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";

interface GoalAddBoxProps {
  history: GoalHistory;

}

export default class GoalAddBox extends React.Component<GoalAddBoxProps> {

  state: any = {}

  render() {
    const {history} = this.props;
    const classNames = [styles.GoalHistoryItem];
    const tag = [<div className={styles.title}>{history.title}</div>];
    if (history.isSuccess) {
      classNames.push(styles.success)
      tag.unshift(<CheckCircleOutlined className={styles.icon}/>)
    } else {
      tag.unshift(<CloseCircleOutlined  className={styles.icon} />)
      classNames.push(styles.fail)
    }
    return (
      <div className={classNames.join(" ")}>
        {tag}
      </div>
    )
  }
}
