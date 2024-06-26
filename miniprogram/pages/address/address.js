//首页-快递代取-收件地址

Page({
  /**
   * 页面的初始数据
   */
  data: {
    address: [],
    url: ''
  },

  //“收件地址”页的信息展示
  selectAddress(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const url = wx.getStorageSync('urlNow')
    const address = this.data.address[index];
    wx.setStorageSync('addressNow', address);
    wx.redirectTo({
      url: `../${url}/${url}`,
    })
  },

  //编辑
  edit(e) {
    const index = e.currentTarget.dataset.index;
    const address = this.data.address[index];
    wx.navigateTo({
      url: `../addAddress/addAddress?address=${JSON.stringify(address)}&index=${index}`,
    })
  },

  //删除
  delete(e) {
    const index = e.currentTarget.dataset.index;
    const address = this.data.address;
    address.splice(index, 1);
    wx.setStorageSync('address', address);
    wx.showToast({
      title: '删除成功',
    })
    this.onLoad();
  },

  //跳转到“添加地址”
  addAddress() { 
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const address = wx.getStorageSync('address');
    this.setData({
      address,
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
    this.setData({
      address: wx.getStorageSync('address')
    })
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
      url: '../getExpress/getExpress',
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