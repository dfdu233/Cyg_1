// miniprogram/pages/category/category.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu: [{
                mainTitle: "生活娱乐",
                sub: ["生活百货",  "生活家电"]
              },
        
              {
                mainTitle: "学习办公",
                sub: ["办工文具", "办公耗材", "书籍"]
              },
                {
                  mainTitle: "书籍",
                  sub: ["地球与行星科学学院","能源学院","环境与土木工程学院","地球物理学院","核技术与自动化工程学院","材料与化学化工学院","管理科学学院","马克思主义学院","文法学院","外国语学院","商学院","传播科学与艺术学院","体育学院","计算机与网络安全学院","地理与规划学院","生态环境学院","数理学院","机电工程学院","牛津布鲁克斯学院"]
                },
              {
                mainTitle: "运动户外",
                sub: ["健身用品", "户外用品", "运动穿戴", "骑行车品"]
              },
              {
                mainTitle: "二次元",
                sub: ["动漫周边", "游戏周边", "conplay", "Lolita"]
              },
              {
                mainTitle: "数码极客",
                sub: ["手机/平板", "手机配件", "电脑/配件", "影音用品", "游戏电玩", "其他配件"]
              },
              {
                mainTitle: "文化艺术",
                sub: ["文玩收藏", "工艺礼品", "玩具乐器"]
              },
              {
                mainTitle: "动植物",
                sub: ["宠物用品", "宠物", "园艺植物", "园艺用品"]
              },
              {
                mainTitle: "穿搭美妆",
                sub: ["女士鞋服", "男士鞋服", "时尚包包", "时尚配饰", "美容美妆"]
              },
              {
                mainTitle: "DIY",
                sub: ["手工DIY"]
              },
              {
                mainTitle: "其他",
                sub: ["其他"]
              },
            
    ],
    seletedIndex: 0,
    seletedSub: ["生活百货", "食品生鲜", "家具家纺", "生活家电", "卡卷服务"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  changeTab(event) {
    const _index = event.currentTarget.dataset.index
    this.setData({
      seletedIndex: _index,
      seletedSub: this.data.menu[_index].sub
    })
  },
  handleClickMenu(event){
    const value=event.currentTarget.dataset.value
    app.globalData.categorySelectedValue = value
    app.globalData.categorySelectedType=this.data.menu[this.data.seletedIndex].mainTitle
    wx.navigateBack()({
      
    })
  }
})