//调用获取用户的OpenId

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
//返回小程序用户的 openid、小程序 appid、小程序用户的 unionid
  return { //将获取到的字段封装成一个对象返回
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}