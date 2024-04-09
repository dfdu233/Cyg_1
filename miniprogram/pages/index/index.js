//首页

const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indexConfig: [{
        icon: '../../images/kuaidi.png',
        text: '快递代取',
        url: '../getExpress/getExpress'
      },
      {
        icon: '../../images/kuaididaiji.png',
        text: '快递代寄',
        url: '../expressReplace/expressReplace',
      },
      {
        icon: '../../images/dayin.png',
        text: '打印服务',
        url: '../print/print',
      },
      {
        icon: '../../images/bangsong.png',
        text: '帮我送',
        url: '../helpMeGive/helpMeGive',
      },
      {
        icon: '../../images/paotui.png',
        text: '帮我拿',
        url: '../run/run',
      },
      {
        icon: '../../images/bangmai.png',
        text: '帮我买',
        url: '../replaceMe/replaceMe',
      },
      {
        icon: '../../images/trade.png',
        text: '闲置买卖',
        url: '../sellandbuy/sellandbuy',  
      },
      {
        icon: '../../images/rent.png',
        text: '租房信息',
        url: '../rent/rent',
      },
      {
        icon: '../../images/qita.png',
        text: '电费代充',
        url: '../charge/charge',
      }
		],

		campusList: [{
			log: '../../images/kuaidi.png',
			name: '快递代取',
		},
		],
		schoolListNow: 0, //默认是第一个
    showPopup: false,  
    curSId: 4,
    school: [
		{name: "成都理工大学(成都）" ,id: 1},
    {name: "四川大学（江安)" ,id: 2}
    ],
    curschoolName:"成都理工大学(成都）" ,
    title: "学校"
	},
	changeSchool(e){
    console.log(e.detail.selectId);
    console.log(e.detail.select);
    // process();
    },
	showSchoolPopup() {  
    this.setData({ showPopup: true });  
  },  
  beforeenter() {  
    // 进入动画前的处理...  
  },  
  enter() {  
    // 进入动画中的处理...  
  },  
  afterenter() {  
    // 进入动画后的处理...  
  },  
  beforeleave() {  
    // 离开动画前的处理...  
  },  
  leave() {  
    // 离开动画中的处理...  
  },  
  afterleave() {  
    // 离开动画后的处理...  
  },  
  clickoverlay() {  
    // 点击遮罩层的处理...  
  },
	
  //跳转页面
  toDetail(e) { 
    const userInfo = wx.getStorageSync('userInfo');
    const url = e.currentTarget.dataset.url;
    if (userInfo) {
      wx.navigateTo({ //userInfo存在，说明登录过，则可以跳转
        url,
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 !',
      })
    }
  },

  handleClickNotice() {
    wx.showModal({  //showModal 弹窗
      title: '公告',
      content: '欢迎使用！请接单员添加客服的微信：zxy1475857674'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.cloud.callFunction({
        name: 'UserOpenId',
        success: (res) => {
          const {
            openid
          } = res.result;
          wx.setStorageSync('openid', openid);
        }
      })
    }
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

