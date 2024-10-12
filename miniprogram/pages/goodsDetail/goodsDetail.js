// miniprogram/pages/goodsDetail/goodsDetail.js
import regeneratorRuntime from "./../../util/regenerator-runtime/runtime.js"

import {  getTimeNow } from '../../utils/index';
const CloudFuncGet = require("./../../cloudDatabase/getDatas.js")
const CloudFunc = require("./../../cloudDatabase/operateDatas.js")
const { $Message } = require('../../iview/dist/base/index');
const app = getApp()
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index2:0,
    showSkeleton: true,
    userData: {},
    id: "",
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    pageData: {},
    isCollected: false,
    commentValue:"",
    commentType:"comment",
    replyId:"",
    commentFocus:false,
    password:[],
    isPayPanelShow:false,
    create_time:Date.parse(new Date()),
    B_address:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    const userInfo=wx.getStorageSync('userInfo')
      
    await this.setData({
      id: options.id
    })
  
    let res = await app.getUserInfoData()
    await this.fetchUserData(res.openid)
    await this.fetchData()
    this.setData({
      showSkeleton: false
    })
  },
  fetchData() {
    return new Promise((resolve, reject) => {
      CloudFuncGet.queryGoodDetail({
        dataBase: "xianyu_goods",
        where: {
          _id: this.data.id
        }
      }).then((res) => {
        resolve(res)
        this.setData({
          pageData: res.data,
        })
      }).catch((e) => {
        reject(e)
      })
    })
  },
  async fetchUserData(openid) {
    try {
      console.log("fetchUserData")
      let userRes = await CloudFuncGet.queryUser(openid)
      if (userRes.data[0].favorites) {
        userRes.data[0].favorites.map(async(item, index) => {
          if (item._id == this.data.id) {
            await this.setData({
              isCollected: true
            })
          }
        })
      }
      await this.setData({
        userData: userRes.data[0]
      })
      console.log(this.data.isCollected)
    } catch (e) {

    }
  },
  handleEnterChat() {
    let paramData = JSON.stringify({
      openId:this.data.pageData._openid,
      avatarUrl: this.data.pageData.avatarUrl,
      nickName: this.data.pageData.nickName,
    })
    wx.navigateTo({
      url: `./../chat/chat?paramData=${paramData}`,
    })
  },
  handleCommentChange(event){
    // console.log(event.detail.value)
    this.setData({
      commentValue: event.detail.value
    })
  },
  handleCommentBlur(){
    this.setData({
      commentFocus:false,
      commentType: "comment",
    })
  },
  handleReply(event){
    console.log(event.currentTarget.dataset.replyid)
    this.setData({
      commentType:"reply",
      commentFocus:true,
      replyId: event.currentTarget.dataset.replyid
    })
  },
  handleCommentSend(){
    if(!this.data.commentValue){
      return false
    }
    wx.showLoading({
      title: '',
    })
    let commentData={
      commentType:this.data.commentType,
      userinfo:{
        openId:this.data.userData._openid,
        avatarUrl: this.data.userData.avatarUrl,
        nickName: this.data.userData.nickName
      },
      reply:[],
      timeStamp:new Date().getTime(),
      commentValue:this.data.commentValue
    }
    console.log(1)
    wx.cloud.callFunction({
      name: 'commentOrReply',
      data: {
        commentData,
        id: this.data.id,
        replyId:this.data.replyId
      },
      success: res => {
        this.setData({
          pageData:res.result.data,
          commentValue:""
        })
      },
      fail:e=>{
        console.log(e)
        wx.showToast({
          title: e,
        })
      },
      complete:()=>{
        this.setData({
          commentType: "comment",
          commentFocus: false
        })
        wx.hideLoading()
      }
    })
  },
  async handleObtainedOrRepublish(id, type) {
    try {
      wx.showLoading({
        title: '',
      })
      let res = await wx.cloud.callFunction({
        name: 'shelfOrObtainedGood',
        data: {
          id,
          type,
          buyeraddress:wx.getStorageSync('address')[0],
        }
      })
      console.log(res)
    } catch (e) {
      console.log(e)
    } finally {
      wx.hideLoading()
    }
  },
  createOrder(){
    wx.showLoading({
      title: '创建订单中',
    })
    let data={
      _openId: this.data.userData._openid,
      ownerId:this.data.pageData._openid,
      goodId:this.data.id,
      userInfo:{
        openId:this.data.userData._openid,
        nickName:this.data.userData.nickName,
        avatarUrl:this.data.userData.avatarUrl
      },
      goodInfo:{
        totalmoney: this.data.pageData.money,
        name: this.data.pageData.name,
        image:this.data.pageData.images[0],
        methods: this.data.pageData.shippingMethods,
        description:this.data.pageData.description

      },
      addressInfo:this.data.pageData.address.addressDetail,
      create_time:this.data.create_time,
      status:"unreceipt",
      rate:0
    }
    wx.cloud.callFunction({
      name:"createOrder",
      data:{
        data
      },
      success:async (res)=>{
        // const index2=this.data.index2
        // let content =''
        // await this.handleObtainedOrRepublish(this.data.id,"sold")
        // console.log(this.data.pageData.shippingMethods[index2].name)
        // if(this.data.pageData.shippingMethods[index2].name=='跑腿送'){
        //   contents='选择了跑推送'
        //   wx.showModal({
        //     title: '提示',
        //     content: '选择了跑推送',
        //     success: function (res) {
        //       if (res.confirm) {//这里是点击了确定以后
        //         console.log('用户点击确定')
        //       } else {//这里是点击了取消以后
        //         console.log('用户点击取消')
        //       }
        //     }
        //   })
        // }
        // if(this.data.pageData.shippingMethods[index2].name=='买主取'){
        //   contents='选择了买主取'
        //   wx.showModal({
        //     title: '提示',
        //     content: '选择了买主取',
        //     success: function (res) {
        //       if (res.confirm) {//这里是点击了确定以后
        //         console.log('用户点击确定')
        //       } else {//这里是点击了取消以后
        //         console.log('用户点击取消')
        //       }
        //     }
        //   })
        // }
        // if(this.data.pageData.shippingMethods[index2].name=='卖主送'){
        //   wx.showModal({
        //     title: '提示',
        //     content: '选择了卖主送',
        //     success: function (res) {
        //       if (res.confirm) {//这里是点击了确定以后
        //         console.log('用户点击确定')
        //       } else {//这里是点击了取消以后
        //         console.log('用户点击取消')
        //       }
        //     }
        //   })
        // }
        // wx.switchTab({
        //   url: './../secorder/secorder',
        // })
        const index2 = this.data.index2;
        await this.handleObtainedOrRepublish(this.data.id, "sold");
        console.log(this.data.pageData.shippingMethods[index2].name);
      
        const methodName = this.data.pageData.shippingMethods[index2].name;
        const address = this.data.pageData.address.build + this.data.pageData.address.houseNumber;
        let content = '';
        if (methodName === '跑腿送') {
          content = '选择了跑推送';
          db.collection('order').add({
            data:{
            name:'闲置交易',
            time:getTimeNow(),
            money:this.data.pageData.money,
            state:'待接单',
            address:this.data.B_address,
            info:{
              
                helpContent:this.data.pageData.description,
                pickUpAddress:this.data.pageData.address.build+this.data.pageData.address.houseNumber
              
            },
            userInfo:wx.getStorageSync('userInfo'),
            // 手机号
            phone:wx.getStorageSync('addressNow').phone,
            createTime: db.serverDate(),
            outTradeNo:"2608230605"+Date.parse(new Date())
          }
          })

        } else if (methodName === '买主取') {
          content = `选择了买主取${address} `;
        } else if (methodName === '卖主送') {
          content = '选择了卖主送';
          wx.cloud.callFunction({
            name:"sendMessage2",
            data:{
              OPENID:this.data.pageData._openid,
              address:wx.getStorageSync('addressNow').build+wx.getStorageSync('addressNow').houseNumber,
              time:new Date().toISOString().substring(0, 10),
              person:wx.getStorageSync('userInfo').nickName
            },
      
            success:res =>{
              console.log("通知成功",res)
             
            },
            fail(err){
              console.log("通知失败",err)
            }
          })
        }
      
        if (content) {
          wx.showModal({
            title: '提示',
            content: content,
            success: function (res) {
              if (res.confirm) { // 这里是点击了确定以后
                console.log('用户点击确定');
                wx.switchTab({
                  url: './../secorder/secorder',
                });
              } else { // 这里是点击了取消以后
                console.log('用户点击取消');
              }
            }
          });
        } else {
          // 如果没有匹配的配送方式，直接跳转
          wx.switchTab({
            url: './../secorder/secorder',
          });
        }
      },
      fail:(e)=>{
        console.log(e)
        wx.showToast({
          title: '异常错误',
        })
      },
      complete:()=>{
        wx.hideLoading()
      }
    })
  },
  choose(e){
    this.setData({
      index2:e.detail.value
    })
  },
  handleWechatPay(){
    console.log("pay")
    const _=this
    wx.cloud.callFunction({
      name:"pay",
      data:{
        price:_.data.pageData.money,
        outTradeNo:"260909090"+_.data.create_time
      },

      success:res =>{
        console.log("获取支付参数成功",res)
        console.log(res)
        const payment=res.result.payment
        console.log("payment",payment)
        wx.requestPayment({
          ...payment,
          success(res){
            _.createOrder()
          },
          fail(err){
            console.log("支付失败",err);
          }
        })
      },
      fail(err){
        console.log("支付失败",err)
      }
    })
  },
  handlePayPanelHide(event){
    this.setData({
      isPayPanelShow:false
    })
    $Message({
      content: '取消支付',
      type: 'warning'
    });
  },

  handlePayPanelChange(event){
    console.log(event.detail.inputValue)
    this.setData({
      password: event.detail.inputValue.split("")
    })
    if (event.detail.inputValue.length>=6){
      this.setData({
        isPayPanelShow: false
      })
      wx.showLoading({
        title: '',
      })
      new Promise((resolve)=>{
        setTimeout(()=>{
          this.setData({
            password:[]
          })
          wx.hideLoading()
          $Message({
            content: '支付成功',
            type: 'success'
          });
          this.createOrder()
        },2000)
      })
    }
  },

  chooseAddress(){
    wx.setStorageSync('urlNow', 'goodsdetail');
    wx.navigateTo({
      url: '../address/address',
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
      B_address: wx.getStorageSync('addressNow').build+wx.getStorageSync('addressNow').houseNumber
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
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async onPullDownRefresh() {
    try {
      wx.showNavigationBarLoading()
      await this.fetchData()
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    } catch (e) {
      wx.showToast({
        title: `下拉刷新异常${e}`,
      })
    }
  },
  async handleAddFavorites() {
    try {
      wx.showLoading({
        title: '加载中',
      })
      let data = {
        type: "add",
        dataBase: "xianyu_goods",
      }
      let goods = {
        ...this.data.pageData
      }
      await wx.cloud.callFunction({
        name: 'updateDbData',
        data: {
          type: "add",
          field: "favorites",
          goods,
        }
      })
      let editRes = await CloudFunc.editGoodsFavorites(data, goods)
      await this.setData({
        isCollected: true
      })
      await this.fetchData()
      wx.hideLoading()
    } catch (e) {
      console.log(e)
      wx.showToast({
        title: `错误${e}`,
      })
    }
  },
  async cancelAddFavorites() {
    try {
      wx.showLoading({
        title: '加载中',
      })
      let data = {
        type: "cancel",
        dataBase: "xianyu_goods",
      }
      let goods = {
        ...this.data.pageData
      }
      await wx.cloud.callFunction({
        name: 'updateDbData',
        data: {
          type: "delete",
          field: "favorites",
          goods,
        }
      })
      await this.setData({
        isCollected: false
      })
      let editRes = await CloudFunc.editGoodsFavorites(data, goods)
      await this.fetchData()
      wx.hideLoading()
    } catch (e) {
      console.log(e)
      wx.showToast({
        title: `错误${e}`,
      })
    }
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

  previewImage(event) {
    const currentPreviewUrl = event.currentTarget.dataset.currentUrl
    wx.previewImage({
      current: currentPreviewUrl, // 当前显示图片的http链接
      urls: this.data.pageData.images // 需要预览的图片http链接列表
    })
  },
})