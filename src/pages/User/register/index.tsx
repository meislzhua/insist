import React from 'react';
import ProForm, {ProFormText} from "@ant-design/pro-form";
import styles from "@/pages/User/register/index.less";
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {getIntl, FormattedMessage, history} from 'umi';
import {message} from "antd";
import {Dao} from "@/services/Dao";

export default class Register extends React.Component {
  state = {
    isLoading: false,  // 是否正在请求网络
    error: null,  // 是否正在请求网络
  }

  async register({username, password}: { username: string, password: string }) {
    this.setState({isLoading: true});
    try {
      await Dao.user.register({username, password})
      message.success('注册成功', 2.5)
      history.push("/user/login")
    } catch (e) {
      const errorMessage = e.rawMessage || "未知错误,无法注册"
      this.setState({error: errorMessage});
    }
    this.setState({isLoading: false});

  }

  render() {
    const intl = getIntl()
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <ProForm
            initialValues={{autoLogin: true}}
            submitter={{
              searchConfig: {submitText: intl.formatMessage({id: 'pages.login.registerAccount'})},
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: this.state.isLoading,
                size: 'large',
                style: {width: '100%'},
              },
            }}
            onFinish={(value: any) => this.register(value)}
          >
            {/* 用户名输入框 */}
            <ProFormText
              name="username"
              fieldProps={{size: 'large', prefix: <UserOutlined className={styles.prefixIcon}/>}}
              placeholder={intl.formatMessage({id: 'pages.login.username.placeholder'})}
              rules={[
                {
                  required: true,
                  message: (<FormattedMessage id="pages.login.username.required" defaultMessage="请输入用户名!"/>),
                },
              ]}
            />

            {/* 用户名输入框 */}

            <ProFormText.Password
              name="password"
              fieldProps={{size: 'large', prefix: <LockOutlined className={styles.prefixIcon}/>,}}
              placeholder={intl.formatMessage({id: 'pages.login.password.placeholder', defaultMessage: '密码'})}
              rules={[
                {
                  required: true,
                  message: (<FormattedMessage id="pages.login.password.required" defaultMessage="请输入密码！"/>),
                },
              ]}
            />
          </ProForm>
        </div>
      </div>

    );
  }
}

