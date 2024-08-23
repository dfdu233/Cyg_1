// pages/points/points.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Jifen:[],
    discount:'',
    rank:''
  },
  goToRent:function(){
    wx.navigateTo({
      url: '/pages/userguide/userguide',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:function() {
    this.setData({
      Jifen: app.globalData.Jifen,
      discount: app.globalData.discount,
      rank: this.getRank(app.globalData.Jifen),
      imageSrc:this.getImageSrc(app.globalData.Jifen)
    })
  },
  getRank: function (Jifen) {
    if (Jifen >= 1 && Jifen <= 5) {
      return '青铜';
    } else if (Jifen >5  && Jifen <= 10) {
      return '白银';
    } else if (Jifen >10 && Jifen<=20) {
      return '黄金';
    } else if (Jifen >20 && Jifen<=30) {
      return '铂金';
    }else if (Jifen >30 && Jifen<=40) {
      return '钻石';
    }else if (Jifen >40 && Jifen<=50) {
      return '星耀';
    }else if(Jifen>50){
      return '王者';
    }
  },
  getImageSrc: function (Jifen) {
    if (Jifen >= 1 && Jifen <= 5) {
      return '../../images/one.png';
    } else if (Jifen >5  && Jifen <= 10) {
      return '../../images/two.png';
    } else if (Jifen >10 && Jifen<=20) {
      return '../../images/three.png';
    } else if (Jifen >20 && Jifen<=30) {
      return '../../images/four.png';
    }else if (Jifen >30 && Jifen<=40) {
      return '../../images/five.png';
    }else if (Jifen >40 && Jifen<=50) {
      return '../../images/six.png';
    }else if(Jifen>50){
      return '../../images/seven.png';
    }
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