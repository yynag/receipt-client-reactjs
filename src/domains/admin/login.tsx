import { Button, notification, Form, Input, type FormProps } from "antd";
import { UserApiMock } from "./api/user";
import { useStore } from "./store/hook";

const LoginPage: React.FC = () => {
  const { setUser } = useStore();
  const [api, contextHolder] = notification.useNotification();

  type FieldType = {
    username: string;
    password: string;
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    UserApiMock.login(values.username!.trim(), values.password!.trim())
      .then((user) => {
        setUser(user);
      })
      .catch((err: Error) => {
        api.error({
          message: "用户登录失败",
          description: err.message
        });
      });
  };

  return (
    <Form
      name="login"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ width: 500 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      {contextHolder}
      <Form.Item<FieldType> label="用户名" name="username" rules={[{ required: true, message: "请填写用户名" }]}>
        <Input />
      </Form.Item>

      <Form.Item<FieldType> label="密码" name="password" rules={[{ required: true, message: "请填写密码" }]}>
        <Input.Password />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginPage;
