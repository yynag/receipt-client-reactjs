import {
  DashboardOutlined,
  DatabaseOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Dropdown, Flex, Layout, Menu, Switch, theme as antdTheme, type MenuProps } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect, useMemo, useState } from 'react';
import { userApi, type UserDetail } from './api/user';
import LoginPage from './login';
import { CDKPage } from './pages/cdk';
import { DashboardPage } from './pages/dashboard';
import { StockPage } from './pages/stock';
import { UserPage } from './pages/user';
import { StoreProvider } from './store';
import { useStore } from './store/hook';
import './styles.css';
const { Header, Footer, Content, Sider } = Layout;

function AdminEntry() {
  return (
    <StoreProvider>
      <ThemedAdminApp />
    </StoreProvider>
  );
}

const ThemedAdminApp = () => {
  const { theme } = useStore();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorBgContainer: theme === 'dark' ? '#141414' : '#ffffff',
          colorBgLayout: theme === 'dark' ? '#000000' : '#f8fafc',
          colorBgElevated: theme === 'dark' ? '#262626' : '#ffffff',
          colorBorder: theme === 'dark' ? '#434343' : '#e2e8f0',
          colorBorderSecondary: theme === 'dark' ? '#303030' : '#f1f5f9',
          colorPrimary: theme === 'dark' ? '#1890ff' : '#3b82f6',
          colorPrimaryHover: theme === 'dark' ? '#40a9ff' : '#2563eb',
          colorPrimaryActive: theme === 'dark' ? '#096dd9' : '#1d4ed8',
          colorText: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#1e293b',
          colorTextSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#64748b',
          colorTextTertiary: theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : '#94a3b8',
          colorTextQuaternary: theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : '#cbd5e1',
        },
        // components: {
        //   Layout: {
        //     headerBg: 'transparent',
        //     siderBg: 'transparent',
        //     bodyBg: 'transparent',
        //   },
        //   Menu: {
        //     itemBg: 'transparent',
        //     itemSelectedBg: 'transparent',
        //     itemHoverBg: 'transparent',
        //     itemSelectedColor: 'transparent',
        //     itemColor: 'transparent',
        //   },
        //   Button: {
        //     colorPrimary: 'transparent',
        //     colorPrimaryHover: 'transparent',
        //   },
        //   Dropdown: {
        //     colorBgElevated: 'transparent',
        //   },
        // },
      }}
    >
      <AdminPage />
    </ConfigProvider>
  );
};

const AdminPage = () => {
  const { user, isAdmin, toggleTheme, logout, theme } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [user2, setUser2] = useState<UserDetail>();
  const headerTitle = '凭证后台管理系统';
  const footerText = '凭证后台管理系统 ©2025';

  useEffect(() => {
    document.title = headerTitle;
  }, [headerTitle]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const { body } = document;
    body.classList.add('admin-domain');
    return () => {
      body.classList.remove('admin-domain');
    };
  }, []);

  const hasToken = () => localStorage.getItem('user_token') != null;

  useEffect(() => {
    if (!hasToken()) {
      return;
    }
    const fetchData = async () => {
      if (!hasToken()) {
        return;
      }
      const u = await userApi.get(user!.user_id);
      setUser2(u);
    };
    fetchData();
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const buildUserText = useMemo(() => {
    if (user2 == null) {
      return '';
    }
    return `${user2.user_id} (${user2.total_amount}/${user2.consumed_amount})`;
  }, [user2]);

  if (!hasToken() || user == null) {
    return (
      <Flex align="center" justify="center" className="h-full">
        <LoginPage />
      </Flex>
    );
  }

  type MenuItem = Required<MenuProps>['items'][number];

  const items: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'cdk',
      icon: <KeyOutlined />,
      label: 'CDK管理',
    },
    {
      key: 'stock',
      icon: <DatabaseOutlined />,
      label: '库存管理',
    },
    isAdmin
      ? {
          key: 'user',
          icon: <TeamOutlined />,
          label: '用户管理',
        }
      : null,
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrentPage(e.key);
  };

  const handleLogout = () => {
    logout();
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'userInfo',
      label: (
        <div>
          <div className="font-semibold" style={{ color: 'var(--admin-text-primary)' }}>
            {user.user_id}
          </div>
          <div className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
            {isAdmin ? 'Admin' : 'Instock'}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="admin-app w-full h-screen">
      <Header
        style={{
          padding: '0 24px',
          borderBottom: '1px solid var(--admin-border-color)',
          backgroundColor: 'var(--admin-bg-primary)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Flex align="center" justify="space-between" vertical={false} className="h-full">
          <Flex align="center" gap={8}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: 'var(--admin-text-inverse)' }}
            />
            <h1 className="text-xl font-bold m-0" style={{ color: 'var(--admin-text-inverse)' }}>
              {headerTitle}
            </h1>
          </Flex>
          <Flex align="center" gap={12}>
            <Switch
              checked={theme === 'dark'}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              onChange={toggleTheme}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {buildUserText}
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
            borderRight: '1px solid var(--admin-border-color)',
            backgroundColor: 'var(--admin-bg-primary)',
          }}
        >
          <Menu
            onClick={onClick}
            style={{ height: '100%', borderRight: 0 }}
            selectedKeys={[currentPage]}
            mode="inline"
            items={items}
            className="admin-menu"
            inlineCollapsed={collapsed}
          />
        </Sider>
        <Content
          style={{
            padding: '24px',
            overflow: 'auto',
            minHeight: 'calc(100vh - 64px - 70px)',
            backgroundColor: 'var(--admin-bg-secondary)',
          }}
        >
          <ContentPage page={currentPage} />
        </Content>
      </Layout>
      <Footer
        style={{
          textAlign: 'center',
          padding: '10px 10px',
          borderTop: '1px solid var(--admin-border-color)',
          backgroundColor: 'var(--admin-bg-tertiary)',
          color: 'var(--admin-text-secondary)',
        }}
      >
        {footerText}
      </Footer>
    </Layout>
  );
};

export default AdminEntry;

const ContentPage = ({ page }: { page: string }) => {
  if (page === 'dashboard') {
    return <DashboardPage />;
  }
  if (page === 'cdk') {
    return <CDKPage />;
  }
  if (page === 'stock') {
    return <StockPage />;
  }
  if (page === 'user') {
    return <UserPage />;
  }
  return (
    <Flex align="center" justify="center">
      <h1>Hello ContentPage!</h1>
    </Flex>
  );
};
