// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {

  const { OPENID } = cloud.getWXContext()
  const time=new Date().toLocaleDateString()
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      templateId: 'CPQXB8sEqpwK1BMIIr753xyFOE4gg3UT1AS1vg_N8HE',
      page: 'pages/index/index',
      data: {
        // 模板消息的参数
        "thing13":{
          "value":"张三"
        },
        "time6":{
          "value":time
        },
        "number17":{
          "value":123
        },
      }
    })
 
    return result
  } catch (err) {
    console.error(err)
    return err
  }


}