import type { Language } from './types';

export const supportedLanguages: Language[] = ['zh', 'en'];
export const fallbackLanguage: Language = 'zh';

export interface QueryTranslations {
  title: string;
  subTitle: string;
  inputs: {
    label: string;
    placeholder: string;
    hintEmpty: string;
  };
  buttons: {
    query: string;
    clear: string;
    copyAll: string;
    copyUsed: string;
    copyUnused: string;
  };
  progress: {
    querying: string;
  };
  stats: {
    total: string;
    used: string;
    unused: string;
  };
  tabs: {
    all: string;
    used: string;
    unused: string;
  };
  empty: {
    title: string;
    desc: string;
  };
  status: {
    used: string;
    unused: string;
    invalid: string;
  };
}

const zh: QueryTranslations = {
  title: 'CDK批量查询工具',
  subTitle: '批量查询多个CDK的权限信息',
  inputs: {
    label: '请输入CDK字段',
    placeholder: '请输入CDK，每行一个',
    hintEmpty: '等待输入',
  },
  buttons: {
    query: '开始查询',
    clear: '清空输入',
    copyAll: '复制全部',
    copyUsed: '复制已使用',
    copyUnused: '复制未使用',
  },
  progress: {
    querying: '查询中…',
  },
  stats: {
    total: '总数量',
    used: '已使用',
    unused: '未使用',
  },
  tabs: {
    all: '全部',
    used: '已使用',
    unused: '未使用',
  },
  empty: {
    title: '暂无数据',
    desc: '输入CDK后点击开始查询，结果会显示在这里',
  },
  status: {
    used: '已使用',
    unused: '未使用',
    invalid: '无效',
  },
};

const en: QueryTranslations = {
  title: 'CDK Batch Query Tool',
  subTitle: 'Batch check permissions for multiple CDKs',
  inputs: {
    label: 'Enter CDKs',
    placeholder: 'Enter CDKs, one per line',
    hintEmpty: 'Waiting for input',
  },
  buttons: {
    query: 'Start Query',
    clear: 'Clear',
    copyAll: 'Copy All',
    copyUsed: 'Copy Used',
    copyUnused: 'Copy Unused',
  },
  progress: {
    querying: 'Querying…',
  },
  stats: {
    total: 'Total',
    used: 'Used',
    unused: 'Unused',
  },
  tabs: {
    all: 'All',
    used: 'Used',
    unused: 'Unused',
  },
  empty: {
    title: 'No data yet',
    desc: 'Paste CDKs and click Start Query. Results will appear here.',
  },
  status: {
    used: 'Used',
    unused: 'Unused',
    invalid: 'Invalid',
  },
};

export function getTranslation(lang: Language): QueryTranslations {
  return lang === 'en' ? en : zh;
}
