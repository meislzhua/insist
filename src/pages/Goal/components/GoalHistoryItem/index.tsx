import React from 'react';
import styles from './index.less';

import {CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons/lib";
import {GoalHistory} from "@/services/Dao/struct/goal/GoalHistory";

interface GoalAddBoxProps {
  history: GoalHistory;

}

export default class GoalHistoryItem extends React.Component<GoalAddBoxProps> {

  state: any = {}

  render() {
    const {history} = this.props;
    const classNames = [styles.GoalHistoryItem];
    if (history.isSuccess) {
      classNames.push(styles.success)
    } else {
      classNames.push(styles.fail)
    }
    return (
      <div className={classNames.join(" ")}>
        {history.isSuccess ?
          <CheckCircleOutlined className={styles.icon}/> :
          <CloseCircleOutlined className={styles.icon}/>
        }
        <div className={styles.title}>{history.title}</div>
      </div>
    )
  }
}
