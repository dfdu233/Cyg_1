// 接单员中心
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: ['正在悬赏', '我帮助的'],
    tabNow: 0,
    helpOrder: [],
    helpDayOrder:0,
    helpMonthOrder:0,
    helpTotalNum: 0,
    helpTotalMoeny: 0,
		selectedOrder: {}, // 初始化selectedOrder对象，用于存储选择的记录  
  },
  selectTab(e) {
    const userInfo = wx.getStorageSync('userInfo');  //未登录不允许查看
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    const {
      id
    } = e.currentTarget.dataset;
    this.setData({
      tabNow: id,
    })
    if (id === 0) {
      this.onLoad();
    } else if (id === 1) {
      this.getMyHelpOrder();
    }
  },

  // 获取我帮助的订单信息 
  getMyHelpOrder() {
    wx.showLoading({
      title: '加载中',
    })
    // 从数据库中获取订单信息
    db.collection('orderReceive').where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        this.setData({
          helpTotalMoeny: data[0].allMoney,
          helpTotalNum: data[0].allCount
        })
        this.setData({
          helpOrder: data[0].allOrder,
        })
        wx.hideLoading();
      }
    })
  },

  // 我帮助的订单单数总和
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
  // 获取正在悬赏的订单信息
  getRewardOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      state: '待帮助'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          if (item.name === "快递代寄" && item.info.imgUrl) {
            item.imgUrl = item.info.imgUrl;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          rewardOrder: data,
        })
        wx.hideLoading();
      }
    })
  },

  // 点击接单
  orderReceive(e) {
    const userInfo = wx.getStorageSync('userInfo');  //未登录不允许接单
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    if (this.data.canReceive) {
      wx.showLoading({
        title: '加载中',
      })
      const {
        item
      } = e.currentTarget.dataset;
      const {
        _id,
        _openid
      } = item;
      /* 判断当前用户是否是管理员，自己不能接自己发布的订单 */

      // if (_openid === wx.getStorageSync('openid')) {
      //   wx.showToast({
      //     icon: 'none',
      //     title: '无法接单!',
      //   });
      //   return;
      // } 

      /*点击申请接单后，接单员号码才会显示*/
      const address = wx.getStorageSync('addressNow');
      const userInfo = wx.getStorageSync('userInfo');
      if (address) {
        const {
          phone
        } = address;
        this.setData({
          phoneNow: `${phone}`
        })
      }
      this.setData({
        userInfo,
      })

      //调用updateReceive云函数，接单成功，则订单状态为"已帮助"
      wx.cloud.callFunction({ 
        name: 'updateReceive',
        data: {
          _id,
          receivePerson: this.data.openid,
          state: "已帮助"
        },
        success: (res) => {
          if (this.data.tabNow === 0) {
            this.onLoad();
          } else {
            this.getRewardOrder();
          }
          wx.hideLoading();
        },
        fail: (err) => {
          console.log(err);
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '您目前不是接单员, 请前往个人中心申请成为接单员!'
      })
    }
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
    wx.cloud.database().collection('orderReceive').orderBy('_id', 'desc').limit(1).get({  
      success: res => {  
        if (res.data.length > 0) {  
          // 取最后一条记录  
          const lastRecord = res.data[0];  
          this.setData({  
            selectedOrder: {  
              allMoney: lastRecord.allMoney,  
              allCount: lastRecord.allCount,  
            }  
          });  
        } else {  
          console.error('没有找到数据');  
        }  
      },  
      fail: err => {  
        console.error('查询失败', err);  
      }  
    });  
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