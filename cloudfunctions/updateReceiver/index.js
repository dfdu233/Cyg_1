//管理“我帮助的”所有订单以及总单数、总收益

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  const { _id, allMoney, allCount, allOrder ,dayCount} = event;

  try {
    return await db.collection('orderReceive').doc(_id).update({
      data: {
        allMoney,
        allCount,

        allOrder,
        dayCount,

      }
    }) 
  } catch (error) {
    console.log(error);
  }
}