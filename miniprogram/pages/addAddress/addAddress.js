//首页-快递代取-收件地址-添加地址

Page({
  /**
   * 页面的初始数据
   */
  data: {
      defalutAddress: true,
      build: '',
      houseNumber: '',
      name: '',
      phone: '',
      isEdit: false,
      editNow: false,
      editIndex: 0,
  },
  saveAddress() {
      const {
          build,
          houseNumber,
          name,
          phone,
          defalutAddress,
          isEdit,
          editNow,
          index,
      } = this.data;
    // 保存this指向
    const that = this.data;
    // 保存地址前，首先判断必填值有没有填
    if (!that.build || !that.houseNumber || !that.name || !that.phone) {
      wx.showToast({
        icon: 'none',
        title: '您填写的信息不全',
      })
      return;
    }
    // 其次判断用户输入手机号格式的是否正确
    let regExp = new RegExp("^1[3578]\\d{9}$"); 
    /*
      使用正则表达式校验手机号
      ^ 行开始
      [ ] 当前位置上可以是中括号中某个字符
      [abc] [^abc]
      \\d 当前位置上可以数字
      当前位置上可以是字母 数字 下划线
      {9} 正好9次  {m,} 最少m次  {m,n} 最少m次 最多n
      $ 行结尾
    */
    if (!regExp.test(this.data.phone)) {
         wx.showToast({
          icon: 'none',
           title: '手机号格式不对 ！',
         })
         return;
      } 
      let address = wx.getStorageSync('address');
              if (!isEdit && defalutAddress && address) {
                  for (let i = 0; i < address.length; i++) {
                    // 最后判断是否已存在默认地址
                      if (address[i].defalutAddress) { 
                          wx.showToast({
                              icon: 'none',
                              title: '已存在默认地址!',
                          })
                          return;
                      }
                  }
      }
      const form = {
          build,
          houseNumber,
          name,
          phone,
          defalutAddress,
      };
      if (!address) {
          address = [form];
      } else {
          if (editNow) {
              address[Number(index)] = form;
          } else {
              address.push(form);
          }
      }
      wx.setStorageSync('address', address)    
      wx.redirectTo({
        url: '../address/address',
      })
  },
  onBack() {
    // 点击左上角返回键时跳转到 ../buy/buy
    wx.navigateTo({
      url: '../buy/buy',
    });  
  },
  //是否设为默认地址
  handleChangeSwitch(e) {
      this.setData({
          defalutAddress: e.detail.value
      })
  },

  //收件电话
  getPhone(e) {
      this.setData({
          phone: e.detail.value
      })
  },

  // 收件姓名
  getName(e) {
      this.setData({
          name: e.detail.value
      })
  },

  // 寝室号/门牌号
  getHouseNumber(e) {
      this.setData({
          houseNumber: e.detail.value
      })
  },

  //选择楼栋
  selectBuild() {
      wx.navigateTo({
          url: '../selectBuild/selectBuild',
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      const {
          build, address, index
      } = options;
      if (address) {
          const { build: builds, houseNumber, name, phone, defalutAddress } = JSON.parse(address);
          if (defalutAddress) {
              this.setData({
                  isEdit: true
              })
          }
          this.setData({
              build: builds,
              houseNumber,
              name,
              phone,
              defalutAddress,
              index,
              editNow: true,
          })
      } else {
          this.setData({
              build,
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
 
  onUnload() {

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
