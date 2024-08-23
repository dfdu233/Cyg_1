//删除订单

// 云函数入口文件
const cloud = require('wx-server-sdk') //引入了 wx-server-sdk 模块

cloud.init() //初始化云服务的代码，需要在每个小程序项目中都进行初始化

const db = cloud.database(); //定义了一个 database 对象，用于操作数据库

// 云函数入口函数
exports.main = async (event, context) => {
  const { _id } = event; //用于获取事件对象中的 _id 字段
  try {
    return await db.collection('order').doc(_id).remove() //使用 await 关键字等待数据库操作完成，并返回结果
  } catch (error) { //在 catch 块中处理异常情况，避免出现错误时程序崩溃
    console.log(error);
  }
}