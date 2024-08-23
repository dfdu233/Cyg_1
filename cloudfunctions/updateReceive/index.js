//管理接单的云函数，接了别人的单，则“订单”页相应订单显示应发生变化，相当于修改别人的订单

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { _id, receivePerson, state,phonenow } = event;
  try {
    //使用 await 关键字等待数据库操作完成，并返回结果
    return await db.collection('order').doc(_id).update({
      data: {
        receivePerson,
        state,
        phonenow
      }
    }) 
  } catch (error) {
    console.log(error);
  }
}