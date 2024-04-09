// 首页-快递代取-收件地址-添加地址-选择楼栋

Page({
  /**
   * 页面的初始数据
   */
  data: {
      tabList: ['松林园', '珙桐园', '银杏园','芙蓉园','香樟园',],
      tabNow: 0
    },

    selectBuild(e) {
        const index = e.currentTarget.dataset.index;
        const that = this.data;
        const build = `${that.tabList[that.tabNow]}-${index + 1}栋`;
        wx.navigateTo({
          url: `../addAddress/addAddress?build=${build}`
        })
    },

    selectTab(e) {
        const id = e.currentTarget.dataset.id;
        this.setData({
            tabNow: id,
        })
    },

/**
 * 生命周期函数--监听页面加载
 */
onLoad: function (options) {

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
  wx.switchTab({
    url: '../addAddress/addAddress',
  })
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