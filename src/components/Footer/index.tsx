import React from 'react';
import {UserOutlined, ReadOutlined, ScheduleOutlined} from '@ant-design/icons';
import {history} from "umi";


import styles from './index.less';

export default class Footer extends React.Component {

  itemClassName({path}: { path: string }) {
    return [styles.FooterItem, history.location.pathname === path && styles.FooterItemActive].join(" ")
  }

  render() {
    return (
      <div className={styles.container}>
        <ScheduleOutlined className={this.itemClassName({path: "/goal"})} onClick={() => history.push("/goal")}/>
        <ReadOutlined className={this.itemClassName({path: "/diary"})} onClick={() => history.push("/diary")}/>
        <UserOutlined className={this.itemClassName({path: "/user/info"})} onClick={() => history.push("/user/info")}/>
      </div>
    )
  }
}
