import React from 'react';
import {UserOutlined, ReadOutlined, FieldTimeOutlined} from '@ant-design/icons';
import {history} from "umi";


import styles from './index.less';

export default class Footer extends React.Component {
  menuItemStyle = {
    fontSize: "30px",
    color: "#aaaaaa"
  }

  getMenuItemStyle({activePath}: { activePath: string }) {
    const style = {...this.menuItemStyle}
    if (history.location.pathname === activePath) style.color = "#555555"
    return style
  }

  render() {
    console.log(history.location)
    return (
      <div className={styles.container}>
        <FieldTimeOutlined style={this.getMenuItemStyle({activePath: "/time"})} onClick={() => history.push("/time")}/>
        <ReadOutlined style={this.getMenuItemStyle({activePath: "/diary"})} onClick={() => history.push("/diary")}/>
        <UserOutlined style={this.getMenuItemStyle({activePath: "/user/info"})}
                      onClick={() => history.push("/user/info")}/>
      </div>
    )
  }
}
