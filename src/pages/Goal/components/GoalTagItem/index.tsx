import React from 'react';
import styles from './index.less';
import {message, Select, Tag} from "antd";
import {Dao} from "@/services/Dao";
import type {GoalTag} from "@/services/Dao/struct/goal/GoalTag";


interface GoalTagProps {
  tag: GoalTag
  showModel?: boolean
  onDelete?: (tag: GoalTag) => void
}

export default class GoalTagItem extends React.Component<GoalTagProps> {
  static colors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"]
  state: any = {
    isActive: false,
    isEdit: false,
  }


  event_changeColor(name: string | undefined) {
    this.props.tag.colorName = name || "";
    Dao.goal.editGoalTag({tag: this.props.tag, id: this.props.tag.objectId})
      .then(() => message.success(`修改成功`))
      .catch(err => message.error(`添加失败: ${err.message}`))
  }

  async event_onClose(tag: GoalTag) {
    if (this.props.showModel) return;
    Dao.goal.deleteGoalTag({tag})
      .then(() => message.success(`删除成功: ${tag.name}`))
      .then(() => Promise.resolve(() => this.props.onDelete?.(tag)).catch(() => null))
      .catch(err => message.error(`删除失败: ${err.message}`))
  }

  async event_click() {
    if (this.state.isEdit || this.props.showModel) return;
    const {tag} = this.props;
    tag.isActive = !tag.isActive
    this.setState({isActive: tag.isActive})
  }

  async event_edit() {
    if (this.props.showModel) return;
    this.setState({isEdit: !this.state.isEdit})
  }

  render() {
    const {tag} = this.props;
    this.state.isActive = this.props.tag.isActive;
    let {isActive} = this.state;
    const {isEdit} = this.state;
    isActive = isActive || isEdit;
    return (<Tag className={styles.tag} color={isActive && tag.colorName} closable={isEdit}
                 onClick={() => this.event_click()}
                 onClose={() => this.event_onClose(tag)}
                 onContextMenu={() => this.event_edit()}
                 onDoubleClick={() => this.event_edit()}>
        {!isEdit && tag.name}
        {isEdit && (
          <div style={{display: "inline-block", minWidth: "80px"}}>
            <Select defaultValue={tag.colorName} bordered={false} size={"small"}
                    onChange={colorName => this.event_changeColor(colorName)}>
              {GoalTagItem.colors.map(color =>
                <Select.Option value={color}>
                  <Tag color={color}>{color}</Tag>
                </Select.Option>)}
            </Select>
          </div>

        )}
      </Tag>
    )
  }
}
