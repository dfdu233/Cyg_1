//审核其他人接单申请

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init() //初始化云服务的代码

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { _id, state, examinePerson } = event;
  try {
    return await db.collection('orderReceive').doc(_id).update({ //关键字等待数据库操作完成，并返回结果
      data: {
        state, //姓名
        examinePerson //审核人的openid
      }
    }) 
  } catch (error) {
    console.log(error);
  }
}