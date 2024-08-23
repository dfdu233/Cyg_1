// 我的-审核接单申请（只有当前用户是管理员时才会显示）

const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    receiveList: [],
  },

  // 审核结果
  toExamine(e) {
    wx.showLoading({
      title: '加载中',
    })
    const { item: { _id }, name } = e.currentTarget.dataset;
    wx.cloud.callFunction({
      name: 'toExamine',
      data: {
        _id,
        state: name,
        examinePerson: wx.getStorageSync('openid') //审核人的openid
      },
      success: (res) => {
        wx.showToast({
          title: '审核完成',
        })
        this.onLoad(); //成功时刷新当前页面
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('orderReceive').where({
      state: '待审核'
    }).get({
      success: (res) => {
        this.setData({
          receiveList: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})