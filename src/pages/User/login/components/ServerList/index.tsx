import React from 'react';
import styles from "./index.less";
import {Button, Divider, Form, FormInstance, Input, message, Popover, Space, Spin, Typography} from "antd";
import {buildServer, getServerData, getServerType, setServer} from "@/services/Dao/index";
import {AuditOutlined, ExclamationCircleOutlined, IdcardOutlined} from "@ant-design/icons";

import img_leancloud from '@/../public/logo/leancloud.png';
import aa from '@/../public/logo/leancloud.png';
import img_local from "@/../public/icons/icon-128x128.png";
import type {ServerData} from "@/services/Dao/Server";
import { ServerType} from "@/services/Dao/Server";
import {CloudServerOutlined} from "@ant-design/icons/lib";


export default class ServerList extends React.Component {
  LeancloudFrom = React.createRef<FormInstance>();


  state = {
    serverType: getServerType(),
    loading: false
  }

  isServerType({t}: { t: ServerType }): boolean {
    const {serverType} = this.state;
    if (!serverType && t === ServerType.Base) return true;
    return serverType === t;
  }

  async saveServer({server}: { server: ServerData }) {
    this.setState({loading: true})
    if (server.type !== ServerType.Base) {
      const tmpServer = buildServer({server});
      if (!await tmpServer?.verify()) {
        message.error("服务器验证失败");
        this.setState({loading: false});
        return;
      }
    }
    this.setState({loading: false})


    this.setState({serverType: server.type});
    setServer({server});
  }

  componentDidMount() {
  }


  render() {
    const lc = getServerData({key: ServerType.Leancloud})

    const LeancloudForm = (
      <Spin spinning={this.state.loading}>
        <Form
          ref={this.LeancloudFrom}
          size={"small"}
          initialValues={lc?.data}
        >
          <Form.Item name="appId" rules={[{required: true, message: 'Please input your AppId!'}]}>
            <Input prefix={<IdcardOutlined className="site-form-item-icon"/>} placeholder="AppId"/>
          </Form.Item>

          <Form.Item name="appKey" rules={[{required: true, message: 'Please input your AppKey!'}]}>
            <Input prefix={<AuditOutlined className="site-form-item-icon"/>} placeholder="AppKey"/>
          </Form.Item>
          <Form.Item name="serverURL" rules={[{required: true, message: 'Please input your serverURL!'}]}>
            <Input prefix={<CloudServerOutlined className="site-form-item-icon"/>} placeholder="serverURL"/>
          </Form.Item>


          <Form.Item>
            <div style={{textAlign: "center"}}>
              <Button type="primary" onClick={() => {
                this.LeancloudFrom.current?.validateFields().then(() => {
                  const data = this.LeancloudFrom.current?.getFieldsValue();
                  return this.saveServer({server: {type: ServerType.Leancloud, data}});
                })

              }}>
                确定
              </Button>
            </div>

          </Form.Item>
        </Form>
      </Spin>
    );


    return (
      <div>
        <Divider>服务器</Divider>
        <Spin spinning={this.state.loading}>
          <div className={styles.serverList}>
            <Space split={<Divider type="vertical"/>} align={"center"}>
              <Typography.Link>
                <Popover content={LeancloudForm}
                         title={<div className={styles.serverBoxTitle}>Leancloud服务器 <ExclamationCircleOutlined/></div>}
                         placement="bottom" trigger="click">
                  <img
                    className={[styles.serverItem, this.isServerType({t: ServerType.Leancloud}) && styles.active].join(" ")}
                    src={img_leancloud}/>
                </Popover>
              </Typography.Link>
              <Typography.Link onClick={() => this.saveServer({server: {type: ServerType.Base}})}>
                <img className={[styles.serverItem, this.isServerType({t: ServerType.Base}) && styles.active].join(" ")}
                     src={img_local}/>
              </Typography.Link>
            </Space>
          </div>
        </Spin>
      </div>


    )
      ;
  }
}

