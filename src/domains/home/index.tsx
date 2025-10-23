import { Card, Flex, Layout } from "antd";
import { useNavigate } from "react-router";
const { Meta } = Card;
const { Header, Content } = Layout;

function HomeEntry() {
  const navigate = useNavigate();

  const apps = [
    {
      name: "Discord充值入口",
      description: "使用CDK兑换",
      url: "/admin"
    },
    {
      name: "后台管理入口",
      description: "凭证系统的后台管理页面",
      url: "/admin"
    },
    {
      name: "工具集入口",
      description: "包含实用工具",
      url: "/admin"
    }
  ];

  return (
    <Layout className="w-full h-full">
      <Header>
        <Flex
          vertical={false}
          justify="center"
          align="center"
          className="h-full"
          gap="middle"
        >
          <div className="text-white text-2xl">凭证系统导航页面</div>
        </Flex>
      </Header>
      <Content>
        <Flex
          vertical={false}
          justify="center"
          align="center"
          className="h-full"
          gap="middle"
        >
          {apps.map((app) => (
            <Card
              hoverable
              style={{ width: 240 }}
              onClick={() => navigate(app.url)}
            >
              <Meta title={app.name} description={app.description} />
            </Card>
          ))}
        </Flex>
      </Content>
    </Layout>
  );
}

export default HomeEntry;
