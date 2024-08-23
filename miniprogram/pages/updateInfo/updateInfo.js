//我的-点击个人信息栏

const db = wx.cloud.database(); //调用获取默认环境的数据库的引用

Page({
  /**
   * 页面的初始数据
   */
  data: {
      userInfo: {},
      address: '',
  },

  saveChange() { //保存修改
      wx.setStorageSync('userInfo', this.data.userInfo); //存缓存
      wx.setStorageSync('phone', this.data.phone);
        wx.switchTab({
          url: '../person/person',
        })
        wx.showToast({
          title: '发布成功',
        })
  },

  // 默认地址
  updateAddress() {
    wx.setStorageSync('urlNow', 'updateInfo')
    wx.redirectTo({
      url: '../address/address',
    })
  },
  
  // 更换手机号
  // updatePhone(e) {
  //     wx.cloud.callFunction({
  //         name: 'getUserPhone',
  //         data: {
  //             cloudID: e.detail.cloudID,
  //         },
  //         success: (res) => {
  //             this.setData({
  //                 phone: res.result.list[0].data.phoneNumber,
  //             })
  //         }
  //     })
  // },

  updateNickName(e) { //改名字
     let userInfo = this.data.userInfo;
     userInfo.nickName = e.detail.value;
     this.setData({
         userInfo,
     })
     wx.setStorageSync('userInfo', this.data.userInfo); //实时更新昵称

     db.collection("users").where({
      _openid:wx.getStorageSync('openid')
    }).update({
      data:{
        nickName:wx.getStorageSync('userInfo').nickName
      }
    }).then(res=>{
      console.log(res)
    });

  },

  //换头像
  updateAvatar() {
      let userInfo = this.data.userInfo;
      wx.chooseImage({
        count: 1, //只能换一张
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          wx.showLoading({
            title: '加载中',
          })
          const random = Math.floor(Math.random() * 1000); //获取0~1000的整数，用来命名
          wx.cloud.uploadFile({ //上传到云存储
              cloudPath: `avatar/${this.data.userInfo.nickName}-${random}.png`,
              filePath: res.tempFilePaths[0],
              success: (res) => {
                  let fileID = res.fileID;
                  userInfo.avatarUrl = fileID;
                  this.setData({
                      userInfo,
                  })
                  wx.setStorageSync('userInfo', this.data.userInfo); //实时更新头像
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
    const address = wx.getStorageSync('addressNow');
    const userInfo = wx.getStorageSync('userInfo');
    if (address) {
      const {
        build,
        houseNumber,
        phone
      } = address;
      this.setData({
        address: `${build}-${houseNumber}`
      })
      this.setData({
        phone: `${phone}`
      })
    }
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
    this.onLoad();
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
