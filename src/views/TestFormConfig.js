// 测试表单配置文件 - 用于验证默认值加载功能
export const formConfig = {
  // 表单数据初始值
  formData: {
    testName: "默认姓名",
    testEmail: "default@example.com",
    testAge: 25,
    testGender: "male",
    testHobbies: ["reading", "music"],
    testIsVip: true,
    testScore: 80,
    testBirthday: "1998-01-01",
    testDescription: "这是默认的描述信息",
  },

  // 表单配置项
  formItems: [
    {
      label: "姓名",
      prop: "testName",
      component: "input",
      span: 12,
      required: true,
      placeholder: "请输入姓名",
      props: {
        clearable: true,
      },
    },
    {
      label: "邮箱",
      prop: "testEmail",
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
      label: "年龄",
      prop: "testAge",
      component: "number",
      span: 12,
      props: {
        min: 1,
        max: 120,
        controlsPosition: "right",
      },
    },
    {
      label: "性别",
      prop: "testGender",
      component: "radio-group",
      span: 12,
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
    },
    {
      label: "爱好",
      prop: "testHobbies",
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
      label: "VIP用户",
      prop: "testIsVip",
      component: "switch",
      span: 12,
    },
    {
      label: "评分",
      prop: "testScore",
      component: "slider",
      span: 12,
      props: {
        min: 0,
        max: 100,
        showStops: true,
        showTooltip: false,
      },
    },
    {
      label: "生日",
      prop: "testBirthday",
      component: "date-picker",
      span: 12,
      props: {
        type: "date",
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD",
      },
    },
    {
      label: "描述",
      prop: "testDescription",
      component: "textarea",
      span: 24,
      props: {
        rows: 4,
        maxlength: 200,
        showWordLimit: true,
      },
    },
  ],

  // 表单验证规则
  formRules: {
    testName: [
      { required: true, message: "请输入姓名"},
    ],
    testEmail: [{ required: true, message: "请输入邮箱地址"}],
  },

  // 下拉框选项数据源
  optionsData: {},
};

export default formConfig;
