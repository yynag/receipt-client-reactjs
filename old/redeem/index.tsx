import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { Route, Routes } from 'react-router-dom';
import { RedeemPage } from './pages/RedeemPages';
import { useI18n } from '@/common/hooks/useI18n';

const RedeemModule = () => {
  const { currentLanguage } = useI18n();
  const locale = currentLanguage === 'zh' ? zhCN : enUS;

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 16,
          fontFamily: 'Inter, system-ui',
        },
      }}
    >
      <Routes>
        <Route index element={<RedeemPage />} />
      </Routes>
    </ConfigProvider>
  );
};

export default RedeemModule;
