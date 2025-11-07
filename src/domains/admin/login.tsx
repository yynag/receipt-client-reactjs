import {
  Button,
  notification,
  Form,
  Input,
  type FormProps,
  Card,
  Flex,
  ConfigProvider,
  theme as antdTheme
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { userApi } from "./api/user";
import { useStore } from "./store/hook";
import { getTranslation, type Language } from "./translation";

export const LoginPage: React.FC<{ language?: Language }> = ({ language = "zh" }) => {
  const { setUser, theme } = useStore();
  const [api, contextHolder] = notification.useNotification();
  const t = getTranslation(language);

  type FieldType = {
    username: string;
    password: string;
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    userApi
      .login(values.username!.trim(), values.password!.trim())
      .then((user) => {
        setUser(user);
      })
      .catch((err: Error) => {
        api.error({
          message: t.login.loginFailed,
          description: err.message
        });
      });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
      }}
    >
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Card
          title={
            <Flex align="center" gap="small">
              <UserOutlined />
              {t.login.title}
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
            <Form.Item<FieldType> label={t.login.username} name="username" rules={[{ required: true, message: t.login.usernameRequired }]}>
              <Input />
            </Form.Item>

            <Form.Item<FieldType> label={t.login.password} name="password" rules={[{ required: true, message: t.login.passwordRequired }]}>
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                {t.login.submit}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Flex>
    </ConfigProvider>
  );
};

export default LoginPage;
