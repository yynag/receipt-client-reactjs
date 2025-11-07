import type { DeepPartial } from "./types";

export type Language = "zh" | "en";

export const supportedLanguages: Language[] = ["zh", "en"];

export const fallbackLanguage: Language = "zh";

export interface AdminTranslationContent {
  common: {
    app: string;
    product: string;
    role: string;
    admin: string;
    instock: string;
    user: string;
    dashboard: string;
    cdk: string;
    stock: string;
    management: string;
    list: string;
    create: string;
    edit: string;
    delete: string;
    export: string;
    import: string;
    copy: string;
    batch: string;
    confirm: string;
    cancel: string;
    ok: string;
    close: string;
    save: string;
    search: string;
    filter: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    selected: string;
    cancelSelection: string;
  };
  login: {
    title: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    submit: string;
    loginFailed: string;
    usernameRequired: string;
    passwordRequired: string;
  };
  layout: {
    headerTitle: string;
    footer: string;
    dashboard: string;
    cdkManagement: string;
    stockManagement: string;
    userManagement: string;
    logout: string;
  };
  dashboard: {
    title: string;
    trendTab: string;
    cdkStatsTab: string;
    stockStatsTab: string;
    trend: {
      labels: {
        dimension: string;
        user: string;
        app: string;
        product: string;
      };
      placeholders: {
        allUsers: string;
        allApps: string;
        allProducts: string;
      };
      buttons: {
        refresh: string;
      };
      dimensions: {
        year: string;
        month: string;
        today: string;
      };
      units: {
        month: string;
        day: string;
        hour: string;
      };
      chart: {
        titlePrefix: string;
        countLabel: string;
      };
    };
    cdkStats: {
      labels: {
        app: string;
        product: string;
        uploader: string;
      };
      placeholders: {
        allApps: string;
        allProducts: string;
        allUploaders: string;
      };
      buttons: {
        reset: string;
        refresh: string;
      };
      chart: {
        title: string;
        seriesName: string;
        used: string;
        unused: string;
      };
      stats: {
        total: string;
        used: string;
        unused: string;
      };
    };
    stockStats: {
      labels: {
        app: string;
        product: string;
        user: string;
      };
      placeholders: {
        allApps: string;
        allProducts: string;
        allUsers: string;
      };
      buttons: {
        reset: string;
        refresh: string;
      };
      chart: {
        title: string;
        seriesName: string;
        used: string;
        unused: string;
      };
      stats: {
        total: string;
        used: string;
        unused: string;
      };
    };
  };
  cdk: {
    listTitle: string;
    createTitle: string;
    columns: {
      id: string;
      createdAt: string;
      code: string;
      status: string;
      usedUser: string;
      creator: string;
      app: string;
      appProduct: string;
      actions: string;
    };
    status: {
      used: string;
      unused: string;
    };
    actions: {
      delete: string;
      deleteConfirm: string;
      create: string;
      batchCopy: string;
      batchDelete: string;
      copySuccess: string;
      copySuccessDesc: string;
      copyError: string;
      copyErrorDesc: string;
      deleteSuccess: string;
      deleteError: string;
      batchDeleteSuccess: string;
      batchDeleteError: string;
    };
    form: {
      app: string;
      appPlaceholder: string;
      appRequired: string;
      appProduct: string;
      appProductPlaceholder: string;
      appProductRequired: string;
      quantity: string;
      quantityPlaceholder: string;
      quantityRequired: string;
      quantityRange: string;
      createSuccess: string;
      createError: string;
    };
    messages: {
      selectToCopy: string;
      selectToDelete: string;
      notFound: string;
      getFilterOptionsError: string;
    };
  };
  stock: {
    listTitle: string;
    importTitle: string;
    columns: {
      id: string;
      createdAt: string;
      dateRange: string;
      app: string;
      appProduct: string;
      status: string;
      creator: string;
      actions: string;
    };
    status: {
      used: string;
      unused: string;
    };
    actions: {
      delete: string;
      deleteConfirm: string;
      exportJson: string;
      batchExport: string;
      batchDelete: string;
      importJson: string;
      exportSuccess: string;
      exportError: string;
      batchExportSuccess: string;
      batchExportSuccessDesc: string;
      batchExportError: string;
      deleteSuccess: string;
      deleteError: string;
      batchDeleteSuccess: string;
      batchDeleteError: string;
      importSuccess: string;
      importSuccessDesc: string;
      importError: string;
      importErrorDesc: string;
    };
    upload: {
      dragTitle: string;
      dragText: string;
      dragHint: string;
      formatInfo: string;
    };
    messages: {
      selectToExport: string;
      selectToDelete: string;
      getFilterOptionsError: string;
    };
  };
  user: {
    listTitle: string;
    createTitle: string;
    editTitle: string;
    columns: {
      id: string;
      createdAt: string;
      user: string;
      role: string;
      actions: string;
    };
    roles: {
      admin: string;
      instock: string;
    };
    actions: {
      edit: string;
      delete: string;
      deleteConfirm: string;
      create: string;
      batchCopy: string;
      batchDelete: string;
      copySuccess: string;
      copySuccessDesc: string;
      copyError: string;
      copyErrorDesc: string;
      deleteSuccess: string;
      deleteError: string;
      batchDeleteSuccess: string;
      batchDeleteError: string;
    };
    form: {
      user: string;
      userPlaceholder: string;
      userRequired: string;
      userPattern: string;
      password: string;
      passwordPlaceholder: string;
      passwordRequired: string;
      role: string;
      rolePlaceholder: string;
      roleRequired: string;
      createSuccess: string;
      createError: string;
      updateSuccess: string;
      updateError: string;
    };
    messages: {
      selectToCopy: string;
      selectToDelete: string;
      notFound: string;
      getFilterOptionsError: string;
    };
  };
}

const baseTranslations: Record<Language, AdminTranslationContent> = {
  zh: {
    common: {
      app: "应用",
      product: "商品",
      role: "角色",
      admin: "Admin",
      instock: "Instock",
      user: "用户",
      dashboard: "仪表盘",
      cdk: "CDK",
      stock: "库存",
      management: "管理",
      list: "列表",
      create: "新建",
      edit: "编辑",
      delete: "删除",
      export: "导出",
      import: "导入",
      copy: "复制",
      batch: "批量",
      confirm: "确定",
      cancel: "取消",
      ok: "知道了",
      close: "关闭",
      save: "保存",
      search: "搜索",
      filter: "筛选",
      loading: "加载中",
      success: "成功",
      error: "失败",
      warning: "警告",
      info: "信息",
      selected: "已选择",
      cancelSelection: "取消选择"
    },
    login: {
      title: "用户登录",
      username: "用户名",
      usernamePlaceholder: "请填写用户名",
      password: "密码",
      passwordPlaceholder: "请填写密码",
      submit: "登录",
      loginFailed: "用户登录失败",
      usernameRequired: "请填写用户名",
      passwordRequired: "请填写密码"
    },
    layout: {
      headerTitle: "凭证后台管理系统",
      footer: "凭证后台管理系统 ©2025",
      dashboard: "仪表盘",
      cdkManagement: "CDK管理",
      stockManagement: "库存管理",
      userManagement: "用户管理",
      logout: "退出登录"
    },
    dashboard: {
      title: "数据仪表盘",
      trendTab: "兑换趋势",
      cdkStatsTab: "CDK统计",
      stockStatsTab: "库存统计",
      trend: {
        labels: {
          dimension: "时间维度",
          user: "用户",
          app: "应用",
          product: "应用商品"
        },
        placeholders: {
          allUsers: "全部用户",
          allApps: "全部应用",
          allProducts: "全部商品"
        },
        buttons: {
          refresh: "刷新数据"
        },
        dimensions: {
          year: "今年",
          month: "当月",
          today: "今日"
        },
        units: {
          month: "M",
          day: "D",
          hour: "H"
        },
        chart: {
          titlePrefix: "CDK Redemption Trend - ",
          countLabel: "兑换量"
        }
      },
      cdkStats: {
        labels: {
          app: "应用筛选",
          product: "商品筛选",
          uploader: "归属人筛选"
        },
        placeholders: {
          allApps: "全部应用",
          allProducts: "全部商品",
          allUploaders: "全部归属人"
        },
        buttons: {
          reset: "重置",
          refresh: "刷新数据"
        },
        chart: {
          title: "CDK使用情况分布",
          seriesName: "CDK状态",
          used: "已使用",
          unused: "未使用"
        },
        stats: {
          total: "CDK总量",
          used: "已使用",
          unused: "未使用"
        }
      },
      stockStats: {
        labels: {
          app: "应用筛选",
          product: "商品筛选",
          user: "用户筛选"
        },
        placeholders: {
          allApps: "全部应用",
          allProducts: "全部商品",
          allUsers: "全部用户"
        },
        buttons: {
          reset: "重置",
          refresh: "刷新数据"
        },
        chart: {
          title: "库存状态分布",
          seriesName: "库存状态",
          used: "已兑换",
          unused: "未兑换"
        },
        stats: {
          total: "库存总量",
          used: "已出库",
          unused: "库存中"
        }
      }
    },
    cdk: {
      listTitle: "CDK 列表",
      createTitle: "新建CDK",
      columns: {
        id: "ID",
        createdAt: "创建时间",
        code: "CDK Code",
        status: "使用状态",
        usedUser: "使用用户",
        creator: "创建人",
        app: "应用",
        appProduct: "应用商品",
        actions: "操作"
      },
      status: {
        used: "已使用",
        unused: "未使用"
      },
      actions: {
        delete: "删除",
        deleteConfirm: "确定删除这个CDK吗？",
        create: "新建",
        batchCopy: "复制到剪切板",
        batchDelete: "批量删除",
        copySuccess: "复制成功",
        copySuccessDesc: "已复制 {{count}} 个CDK到剪切板",
        copyError: "复制失败",
        copyErrorDesc: "请重试",
        deleteSuccess: "删除成功",
        deleteError: "删除失败",
        batchDeleteSuccess: "成功删除 {{count}} 个CDK",
        batchDeleteError: "批量删除失败"
      },
      form: {
        app: "应用",
        appPlaceholder: "请选择应用",
        appRequired: "请选择应用",
        appProduct: "应用商品",
        appProductPlaceholder: "请选择应用商品",
        appProductRequired: "请选择应用商品",
        quantity: "添加数量",
        quantityPlaceholder: "请输入添加数量",
        quantityRequired: "请输入添加数量",
        quantityRange: "数量必须在1-1000之间",
        createSuccess: "成功创建 {{count}} 个CDK，并复制到剪切板",
        createError: "创建CDK失败"
      },
      messages: {
        selectToCopy: "请选择要复制的CDK",
        selectToDelete: "请选择要删除的CDK",
        notFound: "未找到选中的CDK数据",
        getFilterOptionsError: "获取筛选选项失败"
      }
    },
    stock: {
      listTitle: "库存列表",
      importTitle: "导入JSON文件",
      columns: {
        id: "ID",
        createdAt: "创建日期时间",
        dateRange: "日期范围",
        app: "应用",
        appProduct: "应用商品",
        status: "使用状态",
        creator: "创建人",
        actions: "操作"
      },
      status: {
        used: "已使用",
        unused: "未使用"
      },
      actions: {
        delete: "删除",
        deleteConfirm: "确定删除这个库存项吗？",
        exportJson: "导出JSON",
        batchExport: "批量导出",
        batchDelete: "批量删除",
        importJson: "导入JSON",
        exportSuccess: "导出成功",
        exportError: "导出失败",
        batchExportSuccess: "批量导出成功",
        batchExportSuccessDesc: "已导出 {{count}} 个库存项",
        batchExportError: "批量导出失败",
        deleteSuccess: "删除成功",
        deleteError: "删除失败",
        batchDeleteSuccess: "成功删除 {{count}} 个库存项",
        batchDeleteError: "批量删除失败",
        importSuccess: "导入成功",
        importSuccessDesc: "成功导入数据",
        importError: "导入失败，请检查文件格式",
        importErrorDesc: "请重试"
      },
      upload: {
        dragTitle: "点击或拖拽文件到此区域上传",
        dragText: "点击或拖拽文件到此区域上传",
        dragHint: "仅支持犁牛插件序列化的JSON格式文件",
        formatInfo: "请上传JSON格式的库存文件，支持单个对象或数组格式。"
      },
      messages: {
        selectToExport: "请选择要导出的库存项",
        selectToDelete: "请选择要删除的库存项",
        getFilterOptionsError: "获取筛选选项失败"
      }
    },
    user: {
      listTitle: "用户列表",
      createTitle: "新建用户",
      editTitle: "编辑用户",
      columns: {
        id: "id",
        createdAt: "创建时间",
        user: "用户",
        role: "角色",
        actions: "操作"
      },
      roles: {
        admin: "Admin",
        instock: "Instock"
      },
      actions: {
        edit: "编辑",
        delete: "删除",
        deleteConfirm: "确定删除这个用户吗？",
        create: "新建",
        batchCopy: "复制到剪切板",
        batchDelete: "批量删除",
        copySuccess: "复制成功",
        copySuccessDesc: "已复制 {{count}} 个用户信息到剪切板",
        copyError: "复制失败",
        copyErrorDesc: "请重试",
        deleteSuccess: "删除成功",
        deleteError: "删除失败",
        batchDeleteSuccess: "成功删除 {{count}} 个用户",
        batchDeleteError: "批量删除失败"
      },
      form: {
        user: "用户",
        userPlaceholder: "请输入用户ID（邮箱或手机号）",
        userRequired: "请输入用户ID",
        userPattern: "用户ID只能包含字母、数字、@、.、_、-",
        password: "密码",
        passwordPlaceholder: "请输入用户密码",
        passwordRequired: "请输入用户密码",
        role: "角色",
        rolePlaceholder: "请选择角色",
        roleRequired: "请选择角色",
        createSuccess: "创建用户成功",
        createError: "创建用户失败",
        updateSuccess: "更新用户成功",
        updateError: "更新用户失败"
      },
      messages: {
        selectToCopy: "请选择要复制的用户",
        selectToDelete: "请选择要删除的用户",
        notFound: "未找到选中的用户数据",
        getFilterOptionsError: "获取筛选选项失败"
      }
    }
  },
  en: {
    common: {
      app: "App",
      product: "Product",
      role: "Role",
      admin: "Admin",
      instock: "Instock",
      user: "User",
      dashboard: "Dashboard",
      cdk: "CDK",
      stock: "Stock",
      management: "Management",
      list: "List",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      export: "Export",
      import: "Import",
      copy: "Copy",
      batch: "Batch",
      confirm: "Confirm",
      cancel: "Cancel",
      ok: "Got it",
      close: "Close",
      save: "Save",
      search: "Search",
      filter: "Filter",
      loading: "Loading",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
      selected: "Selected",
      cancelSelection: "Cancel Selection"
    },
    login: {
      title: "User Login",
      username: "Username",
      usernamePlaceholder: "Please enter username",
      password: "Password",
      passwordPlaceholder: "Please enter password",
      submit: "Login",
      loginFailed: "User login failed",
      usernameRequired: "Please enter username",
      passwordRequired: "Please enter password"
    },
    layout: {
      headerTitle: "Receipt Admin System",
      footer: "Receipt Admin System ©2025",
      dashboard: "Dashboard",
      cdkManagement: "CDK Management",
      stockManagement: "Stock Management",
      userManagement: "User Management",
      logout: "Logout"
    },
    dashboard: {
      title: "Data Dashboard",
      trendTab: "Redemption Trend",
      cdkStatsTab: "CDK Statistics",
      stockStatsTab: "Stock Statistics",
      trend: {
        labels: {
          dimension: "Dimension",
          user: "User",
          app: "App",
          product: "Product"
        },
        placeholders: {
          allUsers: "All Users",
          allApps: "All Apps",
          allProducts: "All Products"
        },
        buttons: {
          refresh: "Refresh"
        },
        dimensions: {
          year: "This Year",
          month: "This Month",
          today: "Today"
        },
        units: {
          month: "M",
          day: "D",
          hour: "H"
        },
        chart: {
          titlePrefix: "CDK Redemption Trend - ",
          countLabel: "Count"
        }
      },
      cdkStats: {
        labels: {
          app: "App Filter",
          product: "Product Filter",
          uploader: "Uploader Filter"
        },
        placeholders: {
          allApps: "All Apps",
          allProducts: "All Products",
          allUploaders: "All Uploaders"
        },
        buttons: {
          reset: "Reset",
          refresh: "Refresh"
        },
        chart: {
          title: "CDK Usage Distribution",
          seriesName: "CDK Status",
          used: "Used",
          unused: "Unused"
        },
        stats: {
          total: "Total CDKs",
          used: "Used",
          unused: "Unused"
        }
      },
      stockStats: {
        labels: {
          app: "App Filter",
          product: "Product Filter",
          user: "User Filter"
        },
        placeholders: {
          allApps: "All Apps",
          allProducts: "All Products",
          allUsers: "All Users"
        },
        buttons: {
          reset: "Reset",
          refresh: "Refresh"
        },
        chart: {
          title: "Stock Status Distribution",
          seriesName: "Stock Status",
          used: "Redeemed",
          unused: "Unredeemed"
        },
        stats: {
          total: "Total Stock",
          used: "Checked Out",
          unused: "In Stock"
        }
      }
    },
    cdk: {
      listTitle: "CDK List",
      createTitle: "Create CDK",
      columns: {
        id: "ID",
        createdAt: "Created At",
        code: "CDK Code",
        status: "Status",
        usedUser: "Used By",
        creator: "Creator",
        app: "App",
        appProduct: "App Product",
        actions: "Actions"
      },
      status: {
        used: "Used",
        unused: "Unused"
      },
      actions: {
        delete: "Delete",
        deleteConfirm: "Are you sure you want to delete this CDK?",
        create: "Create",
        batchCopy: "Copy to Clipboard",
        batchDelete: "Batch Delete",
        copySuccess: "Copy Success",
        copySuccessDesc: "Copied {{count}} CDKs to clipboard",
        copyError: "Copy Failed",
        copyErrorDesc: "Please try again",
        deleteSuccess: "Delete Success",
        deleteError: "Delete Failed",
        batchDeleteSuccess: "Successfully deleted {{count}} CDKs",
        batchDeleteError: "Batch delete failed"
      },
      form: {
        app: "App",
        appPlaceholder: "Please select an app",
        appRequired: "Please select an app",
        appProduct: "App Product",
        appProductPlaceholder: "Please select an app product",
        appProductRequired: "Please select an app product",
        quantity: "Quantity",
        quantityPlaceholder: "Please enter quantity",
        quantityRequired: "Please enter quantity",
        quantityRange: "Quantity must be between 1-1000",
        createSuccess: "Successfully created {{count}} CDKs and copied to clipboard",
        createError: "Failed to create CDK"
      },
      messages: {
        selectToCopy: "Please select CDKs to copy",
        selectToDelete: "Please select CDKs to delete",
        notFound: "Selected CDK data not found",
        getFilterOptionsError: "Failed to get filter options"
      }
    },
    stock: {
      listTitle: "Stock List",
      importTitle: "Import JSON File",
      columns: {
        id: "ID",
        createdAt: "Created At",
        dateRange: "Date Range",
        app: "App",
        appProduct: "App Product",
        status: "Status",
        creator: "Creator",
        actions: "Actions"
      },
      status: {
        used: "Used",
        unused: "Unused"
      },
      actions: {
        delete: "Delete",
        deleteConfirm: "Are you sure you want to delete this stock item?",
        exportJson: "Export JSON",
        batchExport: "Batch Export",
        batchDelete: "Batch Delete",
        importJson: "Import JSON",
        exportSuccess: "Export Success",
        exportError: "Export Failed",
        batchExportSuccess: "Batch Export Success",
        batchExportSuccessDesc: "Exported {{count}} stock items",
        batchExportError: "Batch export failed",
        deleteSuccess: "Delete Success",
        deleteError: "Delete Failed",
        batchDeleteSuccess: "Successfully deleted {{count}} stock items",
        batchDeleteError: "Batch delete failed",
        importSuccess: "Import Success",
        importSuccessDesc: "Data imported successfully",
        importError: "Import failed, please check file format",
        importErrorDesc: "Please try again"
      },
      upload: {
        dragTitle: "Click or drag file to this area to upload",
        dragText: "Click or drag file to this area to upload",
        dragHint: "Only JSON format files serialized by LiNiu plugin are supported",
        formatInfo: "Please upload JSON format stock files, supporting single object or array format."
      },
      messages: {
        selectToExport: "Please select stock items to export",
        selectToDelete: "Please select stock items to delete",
        getFilterOptionsError: "Failed to get filter options"
      }
    },
    user: {
      listTitle: "User List",
      createTitle: "Create User",
      editTitle: "Edit User",
      columns: {
        id: "ID",
        createdAt: "Created At",
        user: "User",
        role: "Role",
        actions: "Actions"
      },
      roles: {
        admin: "Admin",
        instock: "Instock"
      },
      actions: {
        edit: "Edit",
        delete: "Delete",
        deleteConfirm: "Are you sure you want to delete this user?",
        create: "Create",
        batchCopy: "Copy to Clipboard",
        batchDelete: "Batch Delete",
        copySuccess: "Copy Success",
        copySuccessDesc: "Copied {{count}} user information to clipboard",
        copyError: "Copy Failed",
        copyErrorDesc: "Please try again",
        deleteSuccess: "Delete Success",
        deleteError: "Delete Failed",
        batchDeleteSuccess: "Successfully deleted {{count}} users",
        batchDeleteError: "Batch delete failed"
      },
      form: {
        user: "User",
        userPlaceholder: "Please enter user ID (email or phone)",
        userRequired: "Please enter user ID",
        userPattern: "User ID can only contain letters, numbers, @, ., _, -",
        password: "Password",
        passwordPlaceholder: "Please enter user password",
        passwordRequired: "Please enter user password",
        role: "Role",
        rolePlaceholder: "Please select a role",
        roleRequired: "Please select a role",
        createSuccess: "User created successfully",
        createError: "Failed to create user",
        updateSuccess: "User updated successfully",
        updateError: "Failed to update user"
      },
      messages: {
        selectToCopy: "Please select users to copy",
        selectToDelete: "Please select users to delete",
        notFound: "Selected user data not found",
        getFilterOptionsError: "Failed to get filter options"
      }
    }
  }
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) {
    return base;
  }

  const result = Array.isArray(base) ? [...(base as unknown[])] : { ...(base as Record<string, unknown>) };

  const target = result as Record<keyof T, unknown>;
  const source = base as Record<keyof T, unknown>;
  const overrideSource = override as Record<keyof T, unknown>;

  (Object.keys(overrideSource) as Array<keyof T>).forEach((key) => {
    const baseValue = source[key];
    const overrideValue = overrideSource[key];

    if (overrideValue === undefined) {
      return;
    }

    if (Array.isArray(baseValue) && Array.isArray(overrideValue)) {
      target[key] = overrideValue;
      return;
    }

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      target[key] = deepMerge(
        JSON.parse(JSON.stringify(baseValue)) as typeof baseValue,
        overrideValue as DeepPartial<typeof baseValue>
      );
      return;
    }

    target[key] = overrideValue;
  });

  return result as T;
}

export function getTranslation(
  language: Language,
  override?: DeepPartial<AdminTranslationContent>
): AdminTranslationContent {
  const base = baseTranslations[language] ?? baseTranslations[fallbackLanguage];
  const clonedBase = JSON.parse(JSON.stringify(base)) as AdminTranslationContent;
  return deepMerge(clonedBase, override);
}

export function formatMessage(template: string, values: Record<string, string | number> = {}): string {
  return Object.keys(values).reduce((acc, key) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    return acc.replace(pattern, String(values[key]));
  }, template);
}
