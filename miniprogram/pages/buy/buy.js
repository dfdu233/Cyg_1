// miniprogram/pages/publish/publish.js
const CloudFunc = require("./../../cloudDatabase/operateDatas.js")
const CloudFuncGet = require("./../../cloudDatabase/getDatas.js")
import regeneratorRuntime from "./../../util/regenerator-runtime/runtime.js"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    visibleActions: false,
    weightActions: [{
        name: '1kg以下',
      },
      {
        name: '1kg-5kg'
      },
      {
        name: '5kg-10kg'
      },
      {
        name: '10kg以上'
      }
    ],
    money: 0,
    weight: "1kg以下",
    transactionTypeTagsIndex: 0,
    transactionTypeTags: [{
        name: '一口价',
        tagIndex: 0,
        color: 'theme'
      },
      {
        name: '拍卖',
        tagIndex: 1,
        color: 'theme'
      }
    ],
    shippingMethodsTags: [{
        name: '卖主送',
        checked: true,
        color: 'theme'
      },
      {
        name: '跑腿送',
        checked: false,
        color: 'theme'
      },
      {
        name: '买主取',
        checked: false,
        color: 'theme'
      },

    ],
    address: {},
    isNew: false,
    name: "",
    description: "",
    categoryType: "",
    categoryValue: "",
    selectedImages: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    var addr=wx.getStorageSync('addressNow')
    this.setData({
      id: options.id || " ",
      address: addr
    },
    )
    console.log(this.data.address)
    console.log(2)
    app.getUserInfoData().then((res) => {
      app.globalData = {
        ...res
      }
      console.log(res)
      CloudFuncGet.queryUser(res.openid).then((res)=>{
        app.globalData.userInfo.avatarUrl=res.data[0].avatarUrl;
        app.globalData.userInfo.nickName=res.data[0].nickName;
        console.log(res)
      })
      

    })
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
    this.setData({
      categoryType: app.globalData.categorySelectedType||"",
      categoryValue: app.globalData.categorySelectedValue||""
    })
  },
  handleMoneyChange(event) {
    console.log(event)
    
    this.setData({
      money: event.detail.detail.value,
      warningMessage: '' // 清空警告信息
    })
  },
  onChangeTransactionType(event) {
    const detail = event.detail;
    this.setData({
      transactionTypeTagsIndex: event.detail.name,
    })
  },
  onChangeShippingMethods(event) {
    const index = event.detail.name; // 获取选择的发货方式索引
    const shippingMethod = this.data.shippingMethodsTags[index];

    // 检查金额是否小于10元
    if (shippingMethod.name === '跑腿送' && this.data.money < 10) {
      this.setData({
        warningMessage: '当前金额少于10元不能选择跑腿送',
        ['shippingMethodsTags[' + index + '].checked']: false // 取消选中
      });
      return; // 终止函数，避免执行后续逻辑
    }

    // 更新对应发货方式的 checked 状态
    this.setData({
      ['shippingMethodsTags[' + index + '].checked']: event.detail.checked
    });
  },
  handleSelectWeight() {
    this.setData({
      visibleActions: true
    });
  },
  handleCancelWeightActions() {
    this.setData({
      visibleActions: false
    });
  },
  handleClickItem({
    detail
  }) {
    const index = detail.index;
    this.setData({
      weight: this.data.weightActions[index].name,
      visibleActions: false
    })
  },
  async handlePublish() {
    //上架商品
    let that = this
    if (!app.globalData.userInfo) {
      wx.navigateTo({
        url: './../login/login',
      })
      return false
    }
    if (!this.data.name) {
      wx.showToast({
        icon: "none",
        title: '请输入物品名称',
      })
      return false
    }
    if (!this.data.description) {
      wx.showToast({
        icon: "none",
        title: '请输入物品描述',
      })
      return false
    }
    if (!this.data.categoryValue) {
      wx.showToast({
        icon: "none",
        title: '请选择分类',
      })
      return false
    }
    if (!this.data.selectedImages.length > 0) {
      wx.showToast({
        icon: "none",
        title: '请添加图片',
      })
      return false
    }
    if(this.data.money<0.01){
      wx.showToast({
        icon: "none",
        title: '金额不小于3.5',
      })
      return false
    }
    
    const decimalPattern = /^\d+(\.\d{1,2})?$/;
    if(!decimalPattern.test(this.data.money)){
      wx.showToast({
        icon: "none",
        title: '金额最多两位小数',
      })
      return false
    }
    
    const data = {
      name: this.data.name,
      description: this.data.description,
      categoryType: this.data.categoryType,
      categoryValue: this.data.categoryValue,
      isNew: this.data.isNew,
      images: this.data.selectedImages,
      collection: 0,
      status: "pending",
      createTime: new Date().getTime(),
      ...app.globalData.userInfo
      
    }
    data.nickName=wx.getStorageSync('userInfo').nickName
    data.avatarUrl=wx.getStorageSync('userInfo').avatarUrl
    data.address=wx.getStorageSync('addressNow')
    CloudFunc.addGoods(data).then((res) => {
      wx.showToast({
        title: '新增记录成功',
      })
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      
    let where = {
      id: res._id
    }
    that.setData({
      id:res._id
    })
    let data = {
      id: res._id || " ",
   
      weight: that.data.weight,
      address: that.data.address,
      money: that.data.money,
      transactionType: that.data.transactionTypeTags[this.data.transactionTypeTagsIndex].name,
      shippingMethods: that.data.shippingMethodsTags.filter(item => item.checked),
      buyeraddress:'',
    }
    CloudFunc.updateGoods(where, data).then((res)=>{
      console.log(res)
      wx.showToast({
        title: '发布成功',
      })
      wx.navigateTo({
        url: `./../../pages/goodsDetail/goodsDetail?id=${that.data.id}`
      })
    }).catch((err)=>{
      wx.showToast({
        title: `error${err}`,
      })
    })  
    }).catch((err) => {
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    })
  
  },

  chooseAddress(){
    wx.setStorageSync('urlNow', 'buy');
    wx.navigateTo({
      url: '../address/address',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.redirectTo({
      url: '../index/index'
    })
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
  nameHandle(event) {
    this.setData({
      name: event.detail.detail.value
    })
  },
  descriptionHandle(event) {
    this.setData({
      description: event.detail.detail.value
    })
  },
  onChangeSwitch(event) {
    const detail = event.detail;
    this.setData({
      'isNew': detail.value
    })
  },
  chooseImage() {
    // 选择图片
    let count = this.data.selectedImages.length
    wx.chooseImage({
      count: 3 - count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths
        this.uploadImageHandle(filePath)
      },
      fail: e => {
        console.error(e)
      },
      complete: function() {}
    })
  },
  
  uploadImageHandle(files) {
    wx.showLoading({
      title: '图片上传中',
      mask: true
    })
    // 上传图片
    const filesBlob = files.map((item, index) => {
      const timeStamp = new Date().getTime()
      const cloudPath = 'vision-test-image' + timeStamp + item.match(/\.[^.]+?$/)[0]
      return this.uploadPromise(cloudPath, item).then((res) => {
        console.log('[上传文件] 成功：')
        this.setData({
          selectedImages: this.data.selectedImages.concat(res.fileID)
        })
      }).catch(e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: "none",
          title: '上传失败',
          mask: true
        })
      })
    })
    Promise.all(filesBlob).then((res) => {
      wx.hideLoading()
    })
  },
  uploadPromise(cloudPath, item) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath: item,
        success: res => {
          resolve(res)
        },
        fail: e => {
          reject(e)
        },
        complete: () => {}
      })
    })
  },
  previewImage(event) {
    const currentPreviewUrl = event.currentTarget.dataset.currenturl
    wx.previewImage({
      current: currentPreviewUrl, // 当前显示图片的http链接
      urls: this.data.selectedImages // 需要预览的图片http链接列表
    })
  },
  deleteHandle(event) {
    const deleteIndex = event.currentTarget.dataset.index
    this.data.selectedImages.splice(deleteIndex, 1)
    this.setData({
      selectedImages: this.data.selectedImages
    })
  },
  handleNextSubmit() {
    if (!app.globalData.userInfo) {
      wx.navigateTo({
        url: './../login/login',
      })
      return false
    }
    if (!this.data.name) {
      wx.showToast({
        icon: "none",
        title: '请输入物品名称',
      })
      return false
    }
    if (!this.data.description) {
      wx.showToast({
        icon: "none",
        title: '请输入物品描述',
      })
      return false
    }
    if (!this.data.categoryValue) {
      wx.showToast({
        icon: "none",
        title: '请选择分类',
      })
      return false
    }
    if (!this.data.selectedImages.length > 0) {
      wx.showToast({
        icon: "none",
        title: '请添加图片',
      })
      return false
    }

    const data = {
      name: this.data.name,
      description: this.data.description,
      categoryType: this.data.categoryType,
      categoryValue: this.data.categoryValue,
      isNew: this.data.isNew,
      images: this.data.selectedImages,
      collection: 0,
      status: "pending",
      createTime: new Date().getTime(),
      ...app.globalData.userInfo
    }
    CloudFunc.addGoods(data).then((res) => {
      wx.showToast({
        title: '新增记录成功',
      })
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      wx.navigateTo({
        url: `./../buy/buy?id=${encodeURIComponent(res._id)}`,
      })
    }).catch(() => {
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    })
    console.log(`${this.data.name}-${this.data.description}-${this.data.category}-${this.data.isNew}`)
  }
})