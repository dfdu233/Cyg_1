//首页-打印服务
const app=getApp()
import {  getTimeNow } from '../../utils/index';
const db = wx.cloud.database(); //调用获取默认环境的数据库的引用

Page({
  /**
   * 页面的初始数据
   */
  data: {
    finalMoney:0,
    discount:app.globalData.discount,
    printImg: '',
    address: '',
    userInfo: {},
    pageNum: 1,
    copieNum: 1,
    remark: '',
    colorPrint: false,
    twoSided: false,
		path: '',
		timeList: [{
			name: '不急',
			tips: '时间小于75min',
			money: 0.9,
		},
		{
			name: '正常',
			tips: '时间小于60min',
			money: 1,
		},
		{
			name: '稍急',
			tips: '时间小于45min',
			money: 1,
		},
		{
			name: '特急',
			tips: '时间小于30min',
			money: 1.2,
		}
	],
    timeNow: 0, //默认是第一个
  },

  /*选择时间要求时的tip*/
  selectTime(e) {
    const {
      id,
      tip
    } = e.currentTarget.dataset;
    this.setData({
      timeNow: id,
      money: this.data.timeList[id].money}, () => {
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
    const { addMoney, discount, timeList, timeNow,copieNum,pageNum, colorPrint} = this.data;
    const money = timeList[timeNow].money;
    const finalMoney = (colorPrint ? ( copieNum * 1 * pageNum*discount*0.1*money + 3 ) : ( copieNum * 0.5 * pageNum*discount*0.1*money + 3 )).toFixed(2);
    this.setData({
        finalMoney: finalMoney,
    });
  },
	
  // 是否双面
  getTwoSided(e) {
    this.setData({
      twoSided: e.detail.value}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  // 是否彩印
  getColorPrint(e) {
    this.setData({
      colorPrint: e.detail.value}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  submit() {
    const {
      printImg,
      address,
      userInfo,
      pageNum,
      copieNum,
      colorPrint,
      remark,
      twoSided,
      phone
    } = this.data;
    if (!printImg || !address || !pageNum || !copieNum) {
      wx.showToast({
        icon: 'none',
        title: '您填写的信息不全',
      })
      return;
    }
    db.collection('order').add({ //在云数据库中新增记录
      data: {
        // 模块的名字
        name: '打印服务',
        // 当前时间
        time: getTimeNow(),
        // 订单金额
        money: colorPrint ? ( copieNum * 1 * pageNum + 3 ) : ( copieNum * 0.5 * pageNum + 3 ),
        // 订单状态
        state: '待帮助',
        // 收件地址
        address,
        // 订单信息
        info: {
          // 打印文件
          printImg,
          // 页数
          pageNum,
          //份数
          copieNum,
          // 备注
          remark,
          // 是否彩印
          colorPrint,
          // 是否双面
          twoSided,
        },
        // 用户信息
        userInfo,
        // 用户手机号
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
      }
    })
  },

  // 备注
  getRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 页数
  getPageNumber(e) {
    this.setData({
      pageNum: Number(e.detail.value)}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  // 份数
  getcopieNumber(e) {
    this.setData({
      copieNum: Number(e.detail.value)}, () => {
        // 在setData的回调里更新finalMoney，确保依赖的值已经更新
        this.calculateAndSetFinalMoney();
    })
  },

  // 收件地址
  selectAddress() {
    wx.setStorageSync('urlNow', 'print')
    wx.redirectTo({
      url: '../address/address',
    })
  },

  getImg() {
    wx.chooseMessageFile({ //从客户端会话选择文件
      count: 1,
      type: 'file',
      success: (res) => {
        // tempFilePath可以作为 img 标签的 src 属性显示图片
        console.log(res); //在控制台中打印输出
        const { path, name } = res.tempFiles[0]; //临时保存的路径
        this.setData({
          path, //使用 wx.chooseMessageFile API 从客户端会话选择文件，并将其临时保存到 path 变量中
        })
        wx.showLoading({
          title: '加载中',
        })
        const random = Math.floor(Math.random() * 1000);
        wx.cloud.uploadFile({
          cloudPath: `print/${random}${name}`,
          filePath: path,
          success: (res) => {
            console.log(res);
            let fileID = res.fileID;
            this.setData({
              printImg: fileID,
            })
            console.log(this.data.printImg);
            wx.hideLoading();
          },
          fail: (err) => {
            console.log(err);
          }
        })
      }
    })
  },
  
  //预览文件
  preview() { 
    wx.openDocument({ //打开文件
      filePath: this.data.path, //打开的路径
      success: function (res) {
        console.log('打开文档成功')
      }
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
    this.setData({
      userInfo,
      Jifen: app.globalData.Jifen,
      discount: app.globalData.discount,
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
