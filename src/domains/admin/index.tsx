import { Flex, Layout, Menu, type MenuProps, type MenuTheme } from "antd";
import { useStore } from "./store/hook";
import LoginPage from "./login";
import { StoreProvider } from "./store";
const { Header, Footer, Content, Sider } = Layout;
import { useState, type JSX } from "react";
import { CDKPage } from "./pages/cdk";

function AdminEntry() {
  return (
    <StoreProvider>
      <AdminPage />
    </StoreProvider>
  );
}

const AdminPage = () => {
  const { user } = useStore();
  const [theme] = useState<MenuTheme>("light");
  const [currentPage, setCurrentPage] = useState("");

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
      key: "cdk",
      label: "CDK管理"
    },
    {
      key: "stock",
      label: "库存管理"
    },
    {
      key: "user",
      label: "用户管理"
    }
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrentPage(e.key);
  };

  return (
    <Layout className="w-full h-full">
      <Header style={{ backgroundColor: "skyblue" }}>
        <Flex align="center" justify="space-between" vertical={false} className="h-full">
          <p className="text-2xl font-semibold">后台管理</p>
        </Flex>
      </Header>
      <Layout>
        <Sider width="30%" style={{ backgroundColor: "#f5f5f5" }}>
          <Menu
            theme={theme}
            onClick={onClick}
            style={{ height: "100%" }}
            defaultOpenKeys={["sub1"]}
            selectedKeys={[currentPage]}
            mode="inline"
            items={items}
          />
        </Sider>
        <Content>
          <ContentPage page={currentPage} />
        </Content>
      </Layout>
      <Footer style={{ backgroundColor: "white" }}>Footer</Footer>
    </Layout>
  );
};

export default AdminEntry;

const ContentPage = ({ page }: { page: string }) => {
  if (page === "cdk") {
    return <CDKPage />;
  }
  if (page === "stock") {
    return <h1>库存管理</h1>;
  }
  return (
    <Flex align="center" justify="center">
      <h1>Hello ContentPage!</h1>
    </Flex>
  );
};
