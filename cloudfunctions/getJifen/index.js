// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {  
    // 查询数据库中的用户积分  
    const result = await db.collection('jifen').where({  
      _openid: wxContext.OPENID // 使用微信上下文中的OPENID作为查询条件  
    }).field({  
      jifen: true // 只返回jifen字段，减少不必要的数据传输  
    }).get()  
  
    // 检查查询结果  
    if (result.data.length === 0) {  
      return {  
        code: -1,  
        message: '用户未找到',  
        data: null  
      }  
    }  
  
    // 返回查询到的用户积分  
    return {  
      code: 0,  
      message: '成功获取用户积分',  
      data: result.data[0].jifen  
    }  
  } catch (err) {  
    // 发生错误时返回错误信息  
    return {  
      code: -2,  
      message: err.message,  
      data: null  
    }  
  }  
}