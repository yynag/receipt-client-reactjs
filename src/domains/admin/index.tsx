import { Flex, Layout, Menu, type MenuProps, Dropdown, Button, Switch } from "antd";
import { useStore } from "./store/hook";
import LoginPage from "./login";
import { StoreProvider } from "./store";
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  KeyOutlined,
  TeamOutlined,
  DatabaseOutlined,
  SunOutlined,
  MoonOutlined
} from "@ant-design/icons";
const { Header, Footer, Content, Sider } = Layout;
import { useState } from "react";
import { CDKPage } from "./pages/cdk";
import { StockPage } from "./pages/stock";
import { DashboardPage } from "./pages/dashboard";
import { UserPage } from "./pages/user";

function AdminEntry() {
  return (
    <StoreProvider>
      <AdminPage />
    </StoreProvider>
  );
}

const AdminPage = () => {
  const { user, theme, toggleTheme, logout } = useStore();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (user == null || user.role !== "admin") {
    return (
      <Flex align="center" justify="center" className="h-full">
        <LoginPage />
      </Flex>
    );
  }

  type MenuItem = Required<MenuProps>["items"][number];

  const items: MenuItem[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "仪表盘"
    },
    {
      key: "cdk",
      icon: <KeyOutlined />,
      label: "CDK管理"
    },
    {
      key: "stock",
      icon: <DatabaseOutlined />,
      label: "库存管理"
    },
    {
      key: "user",
      icon: <TeamOutlined />,
      label: "用户管理"
    }
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrentPage(e.key);
  };

  const handleLogout = () => {
    logout();
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "userInfo",
      label: (
        <div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs text-gray-500">管理员</div>
        </div>
      ),
      disabled: true
    },
    {
      type: "divider"
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout
    }
  ];

  return (
    <Layout className="w-full h-full">
      <Header
        style={{
          backgroundColor: theme === "dark" ? "#001529" : "#fff",
          padding: "0 24px",
          borderBottom: theme === "dark" ? "none" : "1px solid #f0f0f0"
        }}
      >
        <Flex align="center" justify="space-between" vertical={false} className="h-full">
          <h1 className={`text-xl font-bold m-0 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            凭证后台管理系统
          </h1>
          <Flex align="center" gap={12}>
            <Switch
              checked={theme === "dark"}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button
                type="text"
                icon={<UserOutlined />}
                className={theme === "dark" ? "text-white hover:text-blue-300" : "text-gray-600 hover:text-blue-500"}
              >
                {user.name}
              </Button>
            </Dropdown>
          </Flex>
        </Flex>
      </Header>
      <Layout>
        <Sider
          width={250}
          style={{
            backgroundColor: theme === "dark" ? "#001529" : "#fff",
            borderRight: theme === "dark" ? "none" : "1px solid #f0f0f0"
          }}
        >
          <Menu
            theme={theme}
            onClick={onClick}
            style={{ height: "100%", borderRight: 0 }}
            selectedKeys={[currentPage]}
            mode="inline"
            items={items}
          />
        </Sider>
        <Content
          style={{
            padding: "24px",
            backgroundColor: theme === "dark" ? "#141414" : "#f0f2f5",
            overflow: "auto",
            height: "calc(100vh - 64px - 54px)" // 减去Header和Footer的高度
          }}
        >
          <ContentPage page={currentPage} theme={theme} />
        </Content>
      </Layout>
      <Footer
        style={{
          backgroundColor: theme === "dark" ? "#001529" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
          textAlign: "center",
          padding: "10px 10px",
          borderTop: theme === "dark" ? "none" : "1px solid #f0f0f0"
        }}
      >
        凭证后台管理系统 ©2025
      </Footer>
    </Layout>
  );
};

export default AdminEntry;

const ContentPage = ({ page, theme }: { page: string; theme: "light" | "dark" }) => {
  if (page === "dashboard") {
    return <DashboardPage />;
  }
  if (page === "cdk") {
    return <CDKPage />;
  }
  if (page === "stock") {
    return <StockPage />;
  }
  if (page === "voucher") {
    return (
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : ""}`}>凭证管理</h2>
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow`}>
          <p className={theme === "dark" ? "text-gray-300" : ""}>凭证管理功能开发中...</p>
        </div>
      </div>
    );
  }
  if (page === "user") {
    return <UserPage />;
  }
  return (
    <Flex align="center" justify="center">
      <h1>Hello ContentPage!</h1>
    </Flex>
  );
};
