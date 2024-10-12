// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  
  const wxContext =await cloud.getWXContext()

  const res=await cloud.cloudPay.unifiedOrder({
    "body":"test",
    "outTradeNo":event.outTradeNo,
    "spbillCreateIp":"127.0.0.1",
    "subMchId":"1660040609",
    "totalFee":100*event.price,
    "envId":"cloud1-2gbbi0ro1c0f2dff",
    "functionName":"pay_cb",
    "tradeType":"JSAPI"
  })
  return res
}