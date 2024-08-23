// components/myButton/myButton.js
//我的-申请接单-这是“提交申请”的封装组件
// component的父组件：pages/applyOrder/applyOrder.json
//自定义组件(components)
Component({
  properties: { //要接收的值
      text: {
          type: String, //字符串类型的组件
          value: '确认'
      }
  }
})
