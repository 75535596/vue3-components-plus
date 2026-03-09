// 动态表单配置文件
export const formConfig = {
  // 表单数据初始值
  formData: {
    name: "",
    email: "",
    age: null,
    gender: "",
    hobbies: [],
    isVip: false,
    score: 0,
    birthday: null,
    city: [],
    description: "",
    customField: "",
    province: "",
    citySelect: "",
    district: "",
    category: "",
    subcategory: "",
  },

  // 表单配置项
  formItems: [
    {
      label: "输入框",
      prop: "name",
      component: "input",
      span: 12,
      required: true,
      placeholder: "请输入输入框",
      props: {
        clearable: true,
      },
    },
    {
      label: "邮箱",
      prop: "email",
      component: "input",
      span: 12,
      required: true,
      props: {
        clearable: true,
      },
      rules: [
        { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
      ],
    },
    {
      label: "数值输入",
      prop: "age",
      component: "number",
      span: 12,
      props: {
        min: 1,
        max: 120,
        controlsPosition: "right",
      },
    },
    {
      label: "单选",
      prop: "gender",
      component: "radio-group",
      span: 12,
      options: [
        { label: "AAA", value: "male" },
        { label: "BBB", value: "female" },
      ],
    },
    {
      label: "多选",
      prop: "hobbies",
      component: "checkbox-group",
      span: 24,
      options: [
        { label: "读书", value: "reading" },
        { label: "运动", value: "sports" },
        { label: "音乐", value: "music" },
        { label: "旅行", value: "travel" },
      ],
    },
    {
      label: "滑块",
      prop: "isVip",
      component: "switch",
      span: 12,
    },
    {
      label: "评分",
      prop: "score",
      component: "el-slider",
      span: 12,
      props: {
        min: 0,
        max: 100,
        showStops: true,
        showTooltip: false,
      },
    },
    {
      label: "日期选择",
      prop: "birthday",
      component: "date-picker",
      span: 12,
      props: {
        type: "date",
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD",
      },
    },
    {
      label: "城市",
      prop: "city",
      component: "cascader",
      span: 12,
      options: [
        {
          value: "jiangsu",
          label: "江苏省",
          children: [
            { value: "nanjing", label: "南京市" },
            { value: "suzhou", label: "苏州市" },
          ],
        },
        {
          value: "zhejiang",
          label: "浙江省",
          children: [
            { value: "hangzhou", label: "杭州市" },
            { value: "ningbo", label: "宁波市" },
          ],
        },
      ],
      props: {
        clearable: true,
        filterable: true,
      },
    },
    {
      label: "长文本",
      prop: "description",
      component: "textarea",
      span: 24,
      props: {
        rows: 4,
        maxlength: 200,
        showWordLimit: true,
      },
    },
    {
      label: "关联字段",
      prop: "customField",
      component: "input",
      span: 24,
      slot: "customSlot",
    },
    {
      label: "级联A",
      prop: "province",
      component: "select",
      span: 8,
      optionsKey: "provinces",
      props: {
        clearable: true,
      },
    },
    {
      label: "城市",
      prop: "citySelect",
      component: "select",
      span: 8,
      dependsOn: {
        field: "province",
        optionsKey: "cities",
      },
      props: {
        clearable: true,
      },
    },
    {
      label: "区县",
      prop: "district",
      component: "select",
      span: 8,
      dependsOn: {
        field: "citySelect",
        optionsKey: "districts",
      },
      props: {
        clearable: true,
      },
    },
  ],

  // 表单验证规则
  formRules: {
    name: [
      { required: true, message: "请输入输入框", trigger: "blur" },
      { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
    ],
    email: [{ required: true, message: "请输入邮箱地址", trigger: "blur" }],
  },

  // 下拉框选项数据源
  optionsData: {
    provinces: [
      { label: "江苏省", value: "jiangsu" },
      { label: "浙江省", value: "zhejiang" },
      { label: "上海市", value: "shanghai" },
    ],
    cities: {
      jiangsu: [
        { label: "南京市", value: "nanjing" },
        { label: "苏州市", value: "suzhou" },
        { label: "无锡市", value: "wuxi" },
      ],
      zhejiang: [
        { label: "杭州市", value: "hangzhou" },
        { label: "宁波市", value: "ningbo" },
        { label: "温州市", value: "wenzhou" },
      ],
      shanghai: [
        { label: "黄浦区", value: "huangpu" },
        { label: "徐汇区", value: "xuhui" },
        { label: "长宁区", value: "changning" },
      ],
    },
    districts: {
      nanjing: [
        { label: "玄武区", value: "xuanwu" },
        { label: "秦淮区", value: "qinhuai" },
        { label: "建邺区", value: "jianye" },
      ],
      suzhou: [
        { label: "姑苏区", value: "gusu" },
        { label: "虎丘区", value: "huqiu" },
        { label: "吴中区", value: "wuzhong" },
      ],
      hangzhou: [
        { label: "西湖区", value: "xihu" },
        { label: "拱墅区", value: "gongshu" },
        { label: "江干区", value: "jianggan" },
      ],
    },
    categories: [
      { label: "电子产品", value: "electronics" },
      { label: "服装鞋帽", value: "clothing" },
      { label: "图书音像", value: "books" },
    ],
    subcategories: {
      electronics: [
        { label: "手机", value: "phone" },
        { label: "电脑", value: "computer" },
        { label: "平板", value: "tablet" },
      ],
      clothing: [
        { label: "男装", value: "mens" },
        { label: "女装", value: "womens" },
        { label: "童装", value: "kids" },
      ],
      books: [
        { label: "小说", value: "novel" },
        { label: "技术书籍", value: "tech" },
        { label: "教育", value: "education" },
      ],
    },
  },
};

export default formConfig;
