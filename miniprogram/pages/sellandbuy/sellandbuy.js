// pages/trade/trade.js
Page({

  /**
   * 页面的初始数据
   */
	data: { 
		tabList: ['我要卖', '我要买'],
		tabNow: 0,
		bookCategories: ['书籍', '物品', '电子产品','其他'], // 书籍类别列表  
		selectedBookIndex: -1, // 初始时没有书籍类别被选中 
		text: '书籍名称版本等、物品尺寸等、产品已使用时间、几成新等'  ,
		jiage: '',
		options: ['自己送', '买主取', '跑腿取送'],
		selectedIndex: -1, // 初始时没有按钮被选中  
        selectedContent: '' // 记录选中的按钮内容  
  },


  selectTab(e) {
    const userInfo = wx.getStorageSync('userInfo');  //未登录不允许查看
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      });
      return;
    }
		const { index } = e.currentTarget.dataset;
		this.setData({ tabNow: index });
		if (index === 0) {
    } else if (index === 1) {
    } 
  },



	selectBookCategory: function(e) {  
		var bookIndex = e.currentTarget.dataset.index; // 获取选中的书籍类别索引  
		var bookContent = e.currentTarget.dataset.content; // 获取选中的书籍类别内容（书籍、物品、电子产品）  
		this.setData({ // 更新选中的书籍类别索引和内容到数据中  
				selectedBookIndex: bookIndex,   
				selectedBookContent: bookContent   
		});  
		// 这里可以添加逻辑来处理用户选择某个书籍类别后的行为，比如跳转到相应的页面等。  
},  

	changeText(e) {  
    this.setData({  
      text: e.detail.value  
    })  
	},
	
	changejiage(e) {  
    this.setData({  
      jiage: e.detail.value  
    })  
  },

	selectOption: function(e) {  
		var index = e.currentTarget.dataset.index;  
		var content = e.currentTarget.dataset.content;  
		this.setData({  
				selectedIndex: index, // 更新选中的按钮索引  
				selectedContent: content // 更新选中的按钮内容  
		});  
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

