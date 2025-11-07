import { Flex, Layout, Menu, type MenuProps, Dropdown, Button, Switch, ConfigProvider, theme as antdTheme } from "antd";
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
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined
} from "@ant-design/icons";
const { Header, Footer, Content, Sider } = Layout;
import { useEffect, useState } from "react";
import { CDKPage } from "./pages/cdk";
import { StockPage } from "./pages/stock";
import { DashboardPage } from "./pages/dashboard";
import { UserPage } from "./pages/user";
import { getTranslation, type Language } from "./translation";
import "./styles.css";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";

function AdminEntry() {
  return (
    <StoreProvider>
      <ThemedAdminApp />
    </StoreProvider>
  );
}

const ThemedAdminApp = () => {
  const { theme, language } = useStore();

  return (
    <ConfigProvider
      locale={language == "zh" ? zhCN : enUS}
      theme={{
        algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorBgContainer: theme === "dark" ? "#141414" : "#ffffff",
          colorBgLayout: theme === "dark" ? "#000000" : "#f8fafc",
          colorBgElevated: theme === "dark" ? "#262626" : "#ffffff",
          colorBorder: theme === "dark" ? "#434343" : "#e2e8f0",
          colorBorderSecondary: theme === "dark" ? "#303030" : "#f1f5f9",
          colorPrimary: theme === "dark" ? "#1890ff" : "#3b82f6",
          colorPrimaryHover: theme === "dark" ? "#40a9ff" : "#2563eb",
          colorPrimaryActive: theme === "dark" ? "#096dd9" : "#1d4ed8",
          colorText: theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "#1e293b",
          colorTextSecondary: theme === "dark" ? "rgba(255, 255, 255, 0.65)" : "#64748b",
          colorTextTertiary: theme === "dark" ? "rgba(255, 255, 255, 0.45)" : "#94a3b8",
          colorTextQuaternary: theme === "dark" ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1"
        },
        components: {
          Layout: {
            headerBg: "transparent",
            siderBg: "transparent",
            bodyBg: "transparent"
          },
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "transparent",
            itemHoverBg: "transparent",
            itemSelectedColor: "transparent",
            itemColor: "transparent"
          },
          Button: {
            colorPrimary: "transparent",
            colorPrimaryHover: "transparent"
          },
          Dropdown: {
            colorBgElevated: "transparent"
          }
        }
      }}
    >
      <AdminPage />
    </ConfigProvider>
  );
};

const AdminPage = () => {
  const { user, isAdmin, toggleTheme, logout, theme, language, toggleLanguage } = useStore();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const t = getTranslation(language);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const { body } = document;
    body.classList.add("admin-domain");
    return () => {
      body.classList.remove("admin-domain");
    };
  }, []);

  if (localStorage.getItem("user_token") == null || user == null) {
    return (
      <Flex align="center" justify="center" className="h-full">
        <LoginPage language={language} />
      </Flex>
    );
  }

  type MenuItem = Required<MenuProps>["items"][number];

  const items: MenuItem[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: t.layout.dashboard
    },
    {
      key: "cdk",
      icon: <KeyOutlined />,
      label: t.layout.cdkManagement
    },
    {
      key: "stock",
      icon: <DatabaseOutlined />,
      label: t.layout.stockManagement
    },
    isAdmin
      ? {
          key: "user",
          icon: <TeamOutlined />,
          label: t.layout.userManagement
        }
      : null
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
          <div className="font-semibold" style={{ color: "var(--admin-text-primary)" }}>
            {user.user_id}
          </div>
          <div className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>
            {isAdmin ? t.common.admin : t.common.instock}
          </div>
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
      label: t.layout.logout,
      onClick: handleLogout
    }
  ];

  return (
    <Layout className="admin-app w-full h-screen">
      <Header
        style={{
          padding: "0 24px",
          borderBottom: "1px solid var(--admin-border-color)",
          backgroundColor: "var(--admin-bg-primary)",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
        }}
      >
        <Flex align="center" justify="space-between" vertical={false} className="h-full">
          <Flex align="center" gap={8}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: "var(--admin-text-inverse)" }}
            />
            <h1 className="text-xl font-bold m-0" style={{ color: "var(--admin-text-inverse)" }}>
              {t.layout.headerTitle}
            </h1>
          </Flex>
          <Flex align="center" gap={12}>
            <Switch
              checked={language === "en"}
              checkedChildren={<GlobalOutlined />}
              unCheckedChildren={<GlobalOutlined />}
              onChange={toggleLanguage}
            />
            <Switch
              checked={theme === "dark"}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              onChange={toggleTheme}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user.user_id}
              </Button>
            </Dropdown>
          </Flex>
        </Flex>
      </Header>
      <Layout className="flex-1">
        <Sider
          collapsed={collapsed}
          collapsedWidth={80}
          width={250}
          style={{
            borderRight: "1px solid var(--admin-border-color)",
            backgroundColor: "var(--admin-bg-primary)"
          }}
        >
          <Menu
            onClick={onClick}
            style={{ height: "100%", borderRight: 0 }}
            selectedKeys={[currentPage]}
            mode="inline"
            items={items}
            className="admin-menu"
            inlineCollapsed={collapsed}
          />
        </Sider>
        <Content
          style={{
            padding: "24px",
            overflow: "auto",
            minHeight: "calc(100vh - 64px - 70px)",
            backgroundColor: "var(--admin-bg-secondary)"
          }}
        >
          <ContentPage page={currentPage} language={language} />
        </Content>
      </Layout>
      <Footer
        style={{
          textAlign: "center",
          padding: "10px 10px",
          borderTop: "1px solid var(--admin-border-color)",
          backgroundColor: "var(--admin-bg-tertiary)",
          color: "var(--admin-text-secondary)"
        }}
      >
        {t.layout.footer}
      </Footer>
    </Layout>
  );
};

export default AdminEntry;

const ContentPage = ({ page, language }: { page: string; language: Language }) => {
  if (page === "dashboard") {
    return <DashboardPage language={language} />;
  }
  if (page === "cdk") {
    return <CDKPage language={language} />;
  }
  if (page === "stock") {
    return <StockPage language={language} />;
  }
  if (page === "user") {
    return <UserPage language={language} />;
  }
  return (
    <Flex align="center" justify="center">
      <h1>Hello ContentPage!</h1>
    </Flex>
  );
};
