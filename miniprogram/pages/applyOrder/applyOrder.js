//我的-申请接单

import { getTimeNow } from '../../utils/index';
const db = wx.cloud.database(); //复用

Page({
  /**
   * 页面的初始数据
   */
  data: {
      userInfo: {},
      userIDImg: '',
      showTips: false,
      modalContent: '1、证件号指你的身份证号码；2、相关证件正面指的是身份证正面；3、需要加急请点击“微信客服”添加好友加急申请!',
      name: '',
      userID: '',
  },

  submit() {
    // 保存this指向，方便复用
    const that = this.data;
    if (!that.name || !that.userID || !that.userIDImg ) {
      wx.showToast({
        icon: 'none',
        title: '您填写的信息不全',
      })
      return;
    }

    // 提交信息
    db.collection('orderReceive').add({
        data: {
            //姓名
            name: that.name,
            //证件号
            userID: that.userID,
            //证件图片
            userIDImg: that.userIDImg,
            //用户基本信息
            userInfo: that.userInfo,
            //状态
            state: '待审核',
            time: getTimeNow(),
            allMoney: 0, //总收益
            allCount: 0, //总单数
            allOrder: [] //所我帮助过的订单
        },
        success: (res) => {
            // 清空输入内容
            this.setData({
                name: '',
                userID: '',
                userIDImg: '',
            })
            wx.navigateTo({
              url: '../receiveLoading/receiveLoading',
            })
            wx.showToast({
              title: '提交成功',
            })
        },
        fail: (res) => {
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
        }
    })
},

  getName(e) {
      this.setData({
          name: e.detail.value
      })
  },

  getUserID(e) {
      this.setData({
          userID: e.detail.value
      })
  },

  //电子协议
  toAgreement() {
      wx.navigateTo({
          url: '../agreement/agreement',
      })
  },

  //复制微信
  getAdminWX() { 
      wx.setClipboardData({
          data: 'wu-shi-qiu-shi',
          success: (res) => {
              wx.showToast({
                  title: '复制微信成功',
              })
          }
      })
  },

  //常见问题说明
  showTips() {
      this.setData({
          showTips: !this.data.showTips
      })
  },

  uploadImg() {
      wx.chooseImage({ //选择图片
          count: 1, //数量1个
          sizeType: ['compressed', 'original'], //图片尺寸类型
          sourceType: ['album', 'camera'], //要选择的图片来源
          success: (res) => { //成功回调,当选择图片成功后会被调用
              wx.showLoading({
                  title: '加载中',
              })
              const random = Math.floor(Math.random() * 1000); //生成随机数，避免命名重复
              wx.cloud.uploadFile({ //云存储API
                  cloudPath: `userIDImg/${this.data.userInfo.nickName}-${random}.png`, //上传云存储
                  filePath: res.tempFilePaths[0],
                  success: (res) => {
                      let fileID = res.fileID; //云存储的图片地址
                      this.setData({
                          userIDImg: fileID,
                      })
                      wx.hideLoading()
                  }
              })
          }
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      const userInfo = wx.getStorageSync('userInfo');
      this.setData({
          userInfo,
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