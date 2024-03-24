// pages/jiedanyuan_zhongxin/jiedanyuan_zhongxin.js
const db = wx.cloud.database(); //复用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedOrder: {}, // 初始化selectedOrder对象，用于存储选择的记录  
    helpTotalNum: 0,
    helpTotalMoeny: 0,
    dayCount:0,
    now : new Date("2023-12-12").toLocaleDateString()
  },

  getHelpTotalNum() {
    db.collection('order').where({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成'
    }).count({
      success: (res) => {
        console.log(res);
        this.setData({
          helpTotalNum: res.total
        })
      }
    })
  },
  getdayCount() {
    const _=db.command
    console.log(this.data.now)
    db.collection('order').where({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成',
      time: _.and(_.gte(new Date(this.data.now+"00:00:00")),_.lte(new Date(this.data.now+"23:59:59"))),
    }).count({
      success: (res) => {

        console.log(res);
        this.setData({
          dayCount: res.total
        })
      }
    })
  },
  // 我帮助的订单金额总和
  getHelpTotalMoney() {
    const $ = db.command.aggregate;
    db.collection('order').aggregate().match({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成',
    }).group({
      _id: null,
      totalNum: $.sum('$money'),
    }).end({
      success: (res) => {
        console.log(res);
        this.setData({
          helpTotalMoeny: res.list[0].totalNum
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
     // 初始化云环境  
    wx.cloud.init({  
      env: 'cloud1-2gbbi0ro1c0f2dff', // 请替换为你的云环境ID  
    });  
  
    // 从云数据库获取数据，并只取最后一条记录  
    this.getHelpTotalMoney()
    this.getHelpTotalNum()
    this.getdayCount()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})