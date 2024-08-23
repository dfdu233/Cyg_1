// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log(event)
    let { id, type } = event
    if (type=== "obtained") {
      await db.collection("xianyu_goods").doc(id).update({
        data: {
          status: "pending"
        }
      })
    } else if (type === "sold"){
      await db.collection("xianyu_goods").doc(id).update({
        data: {
          status: "sold"
        }
      })
    }else {
      await db.collection("xianyu_goods").doc(id).update({
        data: {
          status: "published"
        }
      })
    }

  } catch (e) {
    console.error(e)
  }

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}