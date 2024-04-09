// page.js
Page({
  data: {
    type: '照明',
    locationValue: [0, 0, 0],
    locationRange: [
      ['园区A', '园区B'],
      ['楼宇1', '楼宇2'],
      ['寝室1', '寝室2']
    ],
    locationText: '请选择地点',
    amount: ''
  },
  submit(){
    db.collection('order').add({ //在云数据库中新增记录
      data: {
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
  onTypeChange: function(event) {
    this.setData({
      type: event.detail.value
    });
  },
  
  onLocationChange: function(event) {
    const value = event.detail.value;
    const locationRange = this.data.locationRange;
    const locationText = `${locationRange[0][value[0]]} - ${locationRange[1][value[1]]} - ${locationRange[2][value[2]]}`;
    
    this.setData({
      locationValue: value,
      locationText: locationText
    });
  },
  
  onAmountChange: function(event) {
    this.setData({
      amount: event.detail.value
    });
  },
  
  onRecharge: function() {
    const type = this.data.type;
    const location = this.data.locationText;
    const amount = this.data.amount;
    
    console.log('充值类型：', type);
    console.log('地点选择：', location);
    console.log('充值金额：', amount);
    
    // TODO: 将相关参数传递给后端，生成支付参数并进行跳转到微信支付界面
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

