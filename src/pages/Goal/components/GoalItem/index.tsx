import React from 'react';
import { promisify } from 'util';
import styles from './index.less';
import { message, Modal, Tag, DatePicker } from 'antd';
import {Dao} from '@/services/Dao';
import moment from 'moment';
import {
  CheckSquareOutlined,
  CloseSquareOutlined,
  DeleteFilled,
  EditFilled,
} from '@ant-design/icons';

import type { Goal } from '@/services/Dao/struct/goal/Goal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons/lib';
import GoalTagItem from '@/pages/Goal/components/GoalTagItem';

interface GoalAddBoxProps {
  goal: Goal;
  afterOperation?: () => void;
  onEdit?: (goal: Goal) => void;
}

export default class GoalItem extends React.Component<GoalAddBoxProps> {
  state: any = {
    isActive: false,
    finishDate: moment().startOf('day'),
  };

  getGoalDefaultFinishDate() {}

  event_deleteGoal({ goal }: { goal: Goal }) {
    if (goal === undefined) return null;
    return Modal.confirm({
      title: '是否删除你的小目标?',
      icon: <ExclamationCircleOutlined />,
      content: `正在准备删除: ${goal.title}`,
      okText: '这个目标我不需要了',
      okType: 'danger',
      cancelText: '还是坚持一下吧',
      maskClosable: true,
      centered: true,
      onOk: async () => {
        await Dao.goal
          .deleteGoal({ goal })
          .catch((err) => message.error(`移除失败: ${err.message}`));
        await this.props.afterOperation?.();
      },
    });
  }

  async event_finishGoal({
    isSuccess,
    goal,
    content,
  }: {
    isSuccess: boolean;
    goal: Goal;
    content?: string;
  }) {
    const appointDate =
      goal.repetition === 'once' && goal.appointDate && moment(goal.appointDate).startOf('day');
    await promisify(this.setState).bind(this)({ finishDate: appointDate || moment() });
    return Modal.confirm({
      title: isSuccess ? '已经完成了吗' : '失败了吗',
      icon: isSuccess ? (
        <CheckCircleOutlined style={{ color: '#93DD1A' }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#C0223B' }} />
      ),
      content: (
        <div>
          <div> {`${goal.title}`}</div>
          <br />
          <div>
            {' '}
            完成时间:{' '}
            <DatePicker
              size={'small'}
              defaultValue={this.state.finishDate}
              onChange={(date) => this.setState({ finishDate: (date || moment()).startOf('day') })}
            />
          </div>
        </div>
      ),
      okText: 'yes',
      okType: 'danger',
      cancelText: 'no',
      maskClosable: true,
      centered: true,
      onOk: async () => {
        await Dao.goal
          .finishGoal({ goal, isSuccess, content, appointDate: this.state.finishDate?.toDate() })
          .catch((err) => message.error(`操作失败: ${err.message}`));

        await this.props.afterOperation?.();
      },
    });
  }

  render() {
    const { goal } = this.props;
    const infos = [];
    if (goal.repetition === 'once') {
      infos.push(<Tag color="#2db7f5">单次</Tag>);
      if (goal.appointDate) {
        const date = `目标日期: ${moment(goal.appointDate).startOf('day').format('YYYY-MM-DD')}`;
        if (moment().isAfter(goal.appointDate)) infos.push(<Tag color="red">{date}</Tag>);
        else infos.push(<Tag color="green">{date}</Tag>);
      }
    } else if (goal.repetition === 'day')
      infos.push(<Tag color="#d48806">每日{goal.repetitionCount}次</Tag>);
    else if (goal.repetition === 'week')
      infos.push(<Tag color="#08979c">每周{goal.repetitionCount}次</Tag>);
    else if (goal.repetition === 'month')
      infos.push(<Tag color="#7cb305">每月{goal.repetitionCount}次</Tag>);
    else if (goal.repetition === 'appoint_week')
      infos.push(<Tag color="#9e1068">每周{goal.appoint}</Tag>);
    else if (goal.repetition === 'appoint_month')
      infos.push(<Tag color="#391085">每月{goal.appoint}号</Tag>);

    goal.tags.forEach((tag) => infos.push(<GoalTagItem tag={tag} showModel={true} />));

    return (
      <div
        key={goal.objectId}
        className={[styles.GoalItem, this.state.isActive ? styles.active : ''].join(' ')}
        onClick={() => this.setState({ isActive: !this.state.isActive })}
      >
        <div className={styles.GoalItemTitle}>{goal.title}</div>
        <div className={styles.GoalItemInfo}>
          <div className={styles.GoalItemInfoRepetition}>{infos}</div>
        </div>
        <div className={styles.GoalItemOperation}>
          <DeleteFilled
            style={{ color: '#990033' }}
            onClick={() => this.event_deleteGoal({ goal })}
          />

          <EditFilled onClick={() => this.props.onEdit?.(goal)} />
          <CloseSquareOutlined
            style={{ color: '#CC0033' }}
            onClick={() => this.event_finishGoal({ isSuccess: false, goal })}
          />
          <CheckSquareOutlined
            style={{ color: '#99CC00' }}
            onClick={() => this.event_finishGoal({ isSuccess: true, goal })}
          />
        </div>
      </div>
    );
  }
}
