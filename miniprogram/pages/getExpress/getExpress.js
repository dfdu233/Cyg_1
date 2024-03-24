// 首页-快递代取
const app=getApp()
import {  getTimeNow } from '../../utils/index'; //获取当前最新时间
const db = wx.cloud.database(); //调用获取默认环境的数据库的引用

Page({
  /**
   * 页面的初始数据
   */
  data: {
    discount:app.globalData.discount,
    typeList: [{
        name: '小件',
        tips: '小件: 0-2kg，体积<鞋盒, 价格3.3元',
        money: 3.3,
      },
      {
        name: '中件',
        tips: '中件: 2-3kg，体积=鞋盒, 价格5.5元',
        money: 5.5,
      },
      {
        name: '大件',
        tips: '大件: 3-5kg，体积=纸箱, 价格7.7元',
        money: 7.7,
			},
			{
        name: '超大件',
        tips: '大件: >5kg，体积=棉被, 价格9.9元',
        money: 9.9,
			}
    ],
    typeNow: 0, //默认是第一个
    showMore: false,
    businessIndex: 0,
    businessArray: ['韵达快递', '圆通速递', '中通快递', '申通快递', '百世快递', '顺丰快递','京东快递'],
    arriveIndex: 0,
    arriveArray: ['不限制', '尽快送达', '今天中午', '今天晚上'],
    genderIndex: 0,
    genderArray: ['不限制性别', '仅限男生', '仅限女生'],
    numIndex: 1,
    numArray: [0,1, 2, 3, 4, 5, 6, 7],
    selectBusiness: false,
    address: '',
    business: '',
    expressCode: '',
    codeImg: '',
    remark: '',
    addMoney: 0,
    money: 3.3,
    phone: '',
    finalMoney:''
  },

  /*选择小中大件时的tip*/
  selectType(e) {
    const {
      id,
      tip
    } = e.currentTarget.dataset;
    this.setData({
      typeNow: id, 
      money: this.data.typeList[id].money,}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
    wx.showToast({
      icon: 'none',
      title: this.data.typeList[id].tips,
    })
  },

  //计算最后支付金额
  calculateAndSetFinalMoney: function() {
    const { addMoney, discount, typeList, typeNow,numIndex } = this.data;
    const money = typeList[typeNow].money;
    const finalMoney = (money*numIndex*discount * 0.1+addMoney).toFixed(2);
    this.setData({
        finalMoney: finalMoney,
    });
},

  submit() {
    // 保存this指向
    const that = this.data;
    // 判断必填值有没有填
    // 收件地址、快递单家、收件码或者截图
    if (!that.address || !that.business || !(that.expressCode || that.codeImg)) {
      wx.showToast({
        icon: 'none',
        title: '您填写的信息不全',
      })
      return;
    }
    db.collection('order').add({ //在云数据库中新增记录
      data: {
        // 模块的名字
        name: '快递代取',
        // 当前时间
        time: getTimeNow(),
        // 订单金额
        money:Number(that.money+that.addMoney),
        // 订单状态
        state: '待帮助',
        // 收件地址
        address: that.address,
        // 订单信息
        info: {
          //  快递大小
          size: that.typeList[that.typeNow].name,
          // 快递商家
          business: that.business,
          // 取件码
          expressCode: that.expressCode,
          // 取件码截图
          codeImg: that.codeImg,
          // 备注
          remark: that.remark,
          // 期望送达
          expectTime: that.arriveArray[that.arriveIndex],
          // 性别限制
          expectGender: that.genderArray[that.genderIndex],
          // 快递数量
          number: that.numArray[that.numIndex],
        },
        // 用户信息
        userInfo: that.userInfo,
        // 用户手机号
        phone: that.phone,
        createTime: db.serverDate() //取当前时间，用作订单倒序的依据
      },
      success: (res) => {
        wx.cloud.callFunction({  
          name: 'addPoint',  
          // 传给云函数的参数  
          data: { 
            num:1
          },  
          // 成功回调  
          success: function(res) {  
            console.log(res.result); 
            if (res.result.code === 0) {  
              wx.showToast({  
                title: '积分更新成功',
                icon: 'success'  
              });  
            } else {  
              wx.showModal({
                title: '错误',  
                content: res.result.message,
                showCancel: false  
              });  
            }  
          },  
          fail: function(err) {  
            console.error(err); // 打印调用失败的信息  
            wx.showModal({  
              title: '调用失败',  
              content: '请稍后再试',  
              showCancel: false  
            });  
          }  
        })
        wx.switchTab({
          url: '../index/index',
        })
        wx.showToast({
          title: '发布成功',
        })
      }
    })
  },


  // 额外赏金
  getAddMoney(e) {
    // e.detail.value取到的是字符串, 需要转成数值类型再进行计算
    this.setData({
      addMoney: Number(e.detail.value),
      money:Number(e.detail.value),} ,() => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  // 备注信息
  getRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  //上传取件码截图
  getCode() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showLoading({
          title: '加载中',
        })
        const random = Math.floor(Math.random() * 1000);
        wx.cloud.uploadFile({
          cloudPath: `expressCode/${random}.png`,
          filePath: res.tempFilePaths[0],
          success: (res) => {
            let fileID = res.fileID;
            wx.cloud.getTempFileURL({ //将cloud开头的url转换成https开头的url
              fileList: [fileID],
              success: (res) => {
                this.setData({
                  codeImg: res.fileList[0].tempFileURL,
                })
                wx.hideLoading();
              }
            })
          }
        })
      },
    })
  },

  getExpressCode(e) {
    this.setData({
      expressCode: e.detail.value
    })
  },

  // 快递数量
  bindExpressNumChange(e) {
    this.setData({
      numIndex: e.detail.value}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  // 性别限制
  bindGenderChange(e) {
    this.setData({
      genderIndex: e.detail.value
    })
  },

  // 期望送达
  bindArriveChange(e) {
    this.setData({
      arriveIndex: e.detail.value
    })
  },

  bindBusinessChange(e) {
    this.setData({
      businessIndex: e.detail.value,
      selectBusiness: true
    })
  },

  //跳转到收件地址
  selectAddress() { 
    wx.setStorageSync('urlNow', 'getExpress');
    wx.navigateTo({
      url: '../address/address',
    })
  },

  selectBusiness() {
    wx.navigateTo({
      url: '../expressBusiness/expressBusiness?url=getExpress',
    })
  },

  //更多选择
  showMore() {
    this.setData({
      showMore: !this.data.showMore
    })
  },

  //用户条款&隐私策略
  toAgreement() {
    wx.navigateTo({
        url: '../agreement/agreement',
    })
 },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const app = getApp();
    const discount = app.globalData.discount;
    console.log(app.globalData.discount)
    const {
      business
    } = options;
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
    if (business) {
      this.setData({
        business,
      })
    }
    this.setData({
      userInfo,
      Jifen: app.globalData.Jifen,
      discount: app.globalData.discount,}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
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
    wx.switchTab({
      url: '../index/index',
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