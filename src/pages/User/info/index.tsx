import React from 'react';
import {Button} from "antd";
import {history} from "@@/core/history";
import {stringify} from "querystring";
import {Dao} from "@/services/Dao";

export default class UserInfo extends React.Component {

  async loginOut() {
    await Dao.user.logout();
    const {query = {}, pathname} = history.location;
    const {redirect} = query;
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({redirect: pathname}),
      });
    }
  };

  render() {
    return (
      <div style={{textAlign: "center", margin: "10px"}}>
        <Button danger onClick={() => this.loginOut()}>退出登录</Button>
      </div>
    );
  }
}
