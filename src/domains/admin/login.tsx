import { UserOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  ConfigProvider,
  Flex,
  Form,
  Input,
  theme as antdTheme,
  notification,
  type FormProps,
} from 'antd';
import { userApi } from './api/user';
import { useStore } from './store/hook';

export const LoginPage: React.FC = () => {
  const { setUser, theme } = useStore();
  const [api, contextHolder] = notification.useNotification();

  type FieldType = {
    username: string;
    password: string;
  };

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    userApi
      .login(values.username!.trim(), values.password!.trim())
      .then((user) => {
        setUser(user);
      })
      .catch((err: Error) => {
        api.error({
          message: '用户登录失败',
          description: err.message,
        });
      });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Card
          title={
            <Flex align="center" gap="small">
              <UserOutlined />
              用户登录
            </Flex>
          }
          style={{ width: 400 }}
        >
          <Form
            name="login"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            {contextHolder}
            <Form.Item<FieldType> label="用户名" name="username" rules={[{ required: true, message: '请填写用户名' }]}>
              <Input />
            </Form.Item>

            <Form.Item<FieldType> label="密码" name="password" rules={[{ required: true, message: '请填写密码' }]}>
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Flex>
    </ConfigProvider>
  );
};

export default LoginPage;
