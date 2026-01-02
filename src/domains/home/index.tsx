import { Card, Flex, Layout, Switch } from 'antd';
import { useNavigate } from 'react-router';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import './styles.css';
const { Meta } = Card;
const { Header, Content } = Layout;

const THEME_STORAGE_KEY = 'home_theme';
const isBrowser = typeof window !== 'undefined';

function getDeviceTheme(): 'light' | 'dark' {
  if (!isBrowser) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function HomeEntry() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(getDeviceTheme());

  useEffect(() => {
    document.title = 'Home';
  }, []);

  // Reset theme to device theme on page load
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const deviceTheme = getDeviceTheme();
    setTheme(deviceTheme);
  }, []);

  // Listen for device theme changes
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', syncTheme);
    return () => media.removeEventListener('change', syncTheme);
  }, []);

  // Apply theme class to body and store theme
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const apps = [
    {
      name: 'Discord充值入口',
      description: '使用CDK兑换',
      url: '/redeem/discord',
    },
    {
      name: 'ChatGPT充值入口',
      description: '使用CDK兑换',
      url: '/redeem/chatgpt',
    },
    {
      name: '后台管理入口',
      description: '凭证系统的后台管理页面',
      url: '/admin-1an3m',
    },
    {
      name: '查询CDK（公共）',
      description: '查询CDK的公共服务',
      url: '/public/query-cdk',
    },
  ];

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Header
        style={{
          backgroundColor: theme === 'dark' ? '#001529' : '#fff',
          borderBottom: theme === 'dark' ? 'none' : '1px solid #f0f0f0',
          height: 64,
        }}
      >
        <Flex vertical={false} justify="space-between" align="center" style={{ height: '100%' }} gap="middle">
          <div className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>凭证系统导航页面</div>
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </Flex>
      </Header>
      <Content
        style={{
          backgroundColor: theme === 'dark' ? '#141414' : '#f0f2f5',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}
      >
        <Flex vertical={false} justify="center" align="center" style={{ height: '100%' }} gap="middle">
          {apps.map((app) => (
            <Card
              key={app.name}
              hoverable
              style={{
                width: 240,
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                borderColor: theme === 'dark' ? '#303030' : '#d9d9d9',
              }}
              onClick={() => navigate(app.url)}
            >
              <Meta
                title={<span className={theme === 'dark' ? 'text-white' : ''}>{app.name}</span>}
                description={<span className={theme === 'dark' ? 'text-gray-400' : ''}>{app.description}</span>}
              />
            </Card>
          ))}
        </Flex>
      </Content>
    </Layout>
  );
}

export default HomeEntry;
