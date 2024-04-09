// 封装的小提示的组件
//我的-申请接单-点击申请接单常见问题说明
// component的父组件：pages/applyOrder/applyOrder.json

Component({
  properties: {
      title: { //标题
          type: String,
          value: '提示',
      },
      content: { //内容
          type: String,
          value: '',
      }
  },
  methods: {
      cancel() { //取消操作
          this.triggerEvent('cancel');
      },
      submit() { //以下用来测试“确定”按钮的，会有返回值，没实际用处
          this.triggerEvent('submit', '阅读提示自我');
      }
  }
})
