//首页-帮我送
const app=getApp()
import {  getTimeNow } from '../../utils/index';
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
			moneya: 3.3,
		},
		{
			name: '中件',
			tips: '中件: 2-3kg，体积=鞋盒, 价格5.5元',
			moneya: 5.5,
		},
		{
			name: '大件',
			tips: '大件: 3-5kg，体积=纸箱, 价格7.7元',
			moneya: 7.7,
		},
		{
			name: '超大件',
			tips: '大件: >5kg，体积=棉被, 价格9.9元',
			moneya: 9.9,
		}
	],
		typeNow: 0, //默认是第一个
		timeList: [{
			name: '不急',
			tips:'时间小于75min',
			moneyb: 0.9,
		},
		{
			name: '正常',
			tips: '时间小于60min',
			moneyb: 1,
		},
		{
			name: '稍急',
			tips: '时间小于45min',
			moneyb: 1.1,
		},
		{
			name: '特急',
			tips: '时间小于30min',
			moneyb: 1.2,
		}
	],
	  timeNow: 0, //默认是第一个
    helpContent: '',
    pickUpAddress: '',
    address: '',
    userInfo: {},
    addMoney: null,
    moneya:3.3,
    moneyb:0.9,
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
      moneya: this.data.typeList[id].moneya,}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
    wx.showToast({
      icon: 'none',
      title: this.data.typeList[id].tips,
    })
	},
	
  /*选择时间要求时的tip*/
  selectTime(e) {
    const {
      id,
      tip
    } = e.currentTarget.dataset;
    this.setData({
      timeNow: id,
      moneyb: this.data.timeList[id].moneyb,}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
    wx.showToast({
      icon: 'none',
      title: this.data.timeList[id].tips,
    })
  },

  calculateAndSetFinalMoney: function() {
    const { addMoney, discount, typeList, typeNow, timeList, timeNow } = this.data;
    const moneya = typeList[typeNow].moneya;
    const moneyb = timeList[timeNow].moneyb;
    const finalMoney = (moneya * moneyb*discount * 0.1+addMoney).toFixed(2);
    this.setData({
        finalMoney: finalMoney,
    });
},

  submit() {
    const that = this.data;
    const {
      helpContent,
      pickUpAddress,
      address,
      addMoney,
      userInfo,
      phone,
      moneya,
      moneyb,
    } = this.data;
    if (!helpContent || !pickUpAddress || !address) {
      wx.showToast({
        icon: 'none',
        title: '您填写的信息不全',
      })
      return;
    }
    db.collection('order').add({ //在云数据库中新增记录
      data: {
        // 模块的名字
        name: '帮我拿',
        // 当前时间
        time: getTimeNow(),
        // 订单金额
        money:Number(moneya*moneyb+addMoney),
        // 订单状态
        state: '待帮助',
        // 收件地址
        address,
        // 订单信息
        info: {
          // 帮助内容
          helpContent,
          // 取货地点
          pickUpAddress,
        },
        // 用户信息
        userInfo,
        // 手机号
        phone,
        createTime: db.serverDate()
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
        wx.removeStorageSync('helpContentNow');
      }
    })
  },

  // 增加金额
  getMoney(e) {
    this.setData({
      addMoney: Number(e.detail.value),
      moneya:Number(e.detail.value),
      moneyb:Number(e.detail.value),}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  // 取货地点
  getPickUpAddress(e) {
    this.setData({
      pickUpAddress: e.detail.value
    })
  },

  // 收件地址
  selectAddress() {
    wx.setStorageSync('urlNow', 'run')
    wx.redirectTo({
      url: '../address/address',
    })
  },

  // 帮助内容
  getHelpContent(e) {
    this.setData({
      helpContent: e.detail.value
    })
    wx.setStorageSync('helpContentNow', e.detail.value);
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
    const address = wx.getStorageSync('addressNow');
    const userInfo = wx.getStorageSync('userInfo');

    // 计算订单金额
    var helpContentNow = wx.getStorageSync('helpContentNow');
    if (address) {
      const {
        build,
        houseNumber,
        phone
      } = address;
      this.setData({
        address: `${build}-${houseNumber}`,
      })
      this.setData({
        phone: `${phone}`
      })
    }
    this.setData({
      helpContent: `${helpContentNow}`
      })
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