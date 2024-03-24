// 首页-快递代寄
const app=getApp()
import { getTimeNow } from '../../utils/index';
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
	  money: '',
	  typeNow: 0, //默认是第一个
    helpContent: '',
    imgUrl: '',
    address: '',
    userInfo: {},
    business: '',
    remark: '',
    addMoney: 0,
    finalMoney:0
  },

 /*选择小中大件时的tip*/
  selectType(e) {
	  const {
		  id,
		  tip
	  } = e.currentTarget.dataset;
	  this.setData({
		typeNow: id,
		money: this.data.typeList[id].money}, () => {
      // 在setData的回调里更新finalMoney，确保依赖的值已经更新
      this.calculateAndSetFinalMoney();
	  })
	  wx.showToast({
		  icon: 'none',
		  title: tip,
	  })
  },

  //计算最后支付金额
  calculateAndSetFinalMoney: function() {
    const { addMoney, discount, typeList, typeNow,numIndex } = this.data;
    const money = typeList[typeNow].money;
    const finalMoney = (money*discount * 0.1+addMoney).toFixed(2);
    this.setData({
        finalMoney: finalMoney,
    });
  },

  submit() {
    const that = this.data;
    const { helpContent, imgUrl, address, userInfo, business, remark, addMoney, phone } = this.data;
    if (!(helpContent || imgUrl) || !address || !business) {
      wx.showToast({
        icon: 'none',
        title: '您填写的信息不全',
      })
      return;
    }
    db.collection('order').add({ //在云数据库中新增记录
      data: {
        // 模块的名字
        name: '快递代寄',
        // 当前时间
        time: getTimeNow(),
        // 订单金额
				money: Number(that.money + that.addMoney),
        // 订单状态
        state: '待帮助',
        // 收件地址
        address:that.address,
        // 订单信息
        info: {
          size: that.typeList[that.typeNow].name,
          // 帮助内容
          helpContent,
          // 快递代寄截图
          imgUrl:that.imgUrl,
          // 快递商家
          business:that.business,
          // 备注
          remark:that.remark,
        },
        // 用户信息
        userInfo:that.userInfo,
        // 手机号
        phone:that.phone,
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
      }
    })
  },

  // 增加金额
  getAddMoney(e) {
    this.setData({
      addMoney: Number(e.detail.value),
      money:Number(e.detail.value)}, () => {
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

  // 快递商家
  selectBusiness() {
    wx.redirectTo({
      url: '../expressBusiness/expressBusiness?url=expressReplace',
    })
  },

  // 取货地点
  selectAddress() {
    wx.setStorageSync('urlNow', 'expressReplace')
    wx.redirectTo({
      url: '../address/address',
    })
  },

  //上传“快递代寄”截图
  getImgUrl() {
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
          cloudPath: `expressReplace/${random}.png`,
          filePath: res.tempFilePaths[0],
          success: (res) => {
            let fileID = res.fileID;
            wx.cloud.getTempFileURL({ //将cloud开头的url转换成https开头的url
              fileList: [fileID],
              success: (res) => {
                this.setData({
                  imgUrl: res.fileList[0].tempFileURL,
                })
                wx.hideLoading();
              }
            })
          }
        })
      },
    })
  },

  //帮助内容
  getHelpContent(e) {
    this.setData({
      helpContent: e.detail.value
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
    const { business } = options; //business快递商家
    const address = wx.getStorageSync('addressNow');
    const userInfo = wx.getStorageSync('userInfo');
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