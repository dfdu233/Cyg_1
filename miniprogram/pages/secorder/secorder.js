// miniprogram/pages/order/order.js
import regeneratorRuntime from "./../../util/regenerator-runtime/runtime.js"
const CloudFuncGet = require("./../../cloudDatabase/getDatas.js")
const CloudFunc = require("./../../cloudDatabase/operateDatas.js")
const { $Message } = require('../../iview/dist/base/index');
const app=getApp()
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'https://sr.aihuishou.com/sos/image/636782499370538790522990215.jpg?x-oss-process=image/quality,q_80&size=694x240',
      'https://sr.aihuishou.com/sos/image/6368092437329051601479400495.png?x-oss-process=image/quality,q_80&size=694x240'
    ],
    goodsData: [],
    userId:"",
    currentTab:"unreceipt",
    unreceipt: {
      goodsData: [],
      page: 1
    },
    completed: {
      goodsData: [],
      page: 1
    },
    pageSize: 10,
    showLoadMore: false,
    actions: [{
      name: ' 确认',
      color: '#19be6b'
    }],
    rateValue:0,
    isRateModalShow:false,
    rateId:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    console.log(app)
    await this.setData({
      userId:app.globalData.openid
    })
    this.fetchOrderData()
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
  onPullDownRefresh:async function () {
    await this.fetchOrderData()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom:async function () {
    let setParam = `${this.data.currentTab}.page`
    await this.setData({
      showLoadMore: true,
      [setParam]: this.data[this.data.currentTab].page + 1
    })
    this.fetchMoreOrderData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onRateChange(e){
    this.setData({
      rateValue: e.detail.index
    })
  },
  onShowRateModal(e){
    this.setData({
      isRateModalShow:true,
      rateId:e.currentTarget.dataset.id
    })
  },
  async handleChange({ detail }) {
    await this.setData({
      currentTab: detail.key,
    });
    this.fetchOrderData()
  },
  fetchOrderData() {
    try {
      wx.showLoading({
        title: '',
      })
      wx.cloud.callFunction({
        name: 'getOrder',
        data: {
          params: {
            status: this.data.currentTab,
            page: 1,
            pageSize: this.data.pageSize
          },
          openId: this.data.userId
        },
        success: res => {
          let setParam = `${this.data.currentTab}.goodsData`
          this.setData({
            [setParam]: res.result.data
          })
          
        },
        complete: () => {
          this.setData({
            showLoadMore: false
          })
          wx.hideLoading()
        }
      })
    } catch (e) {

    }

  },
  async fetchMoreOrderData() {
    try {
      wx.cloud.callFunction({
        name: 'getOrder',
        data: {
          params: {
            status: this.data.currentTab,
            page: this.data[this.data.currentTab].page,
            pageSize: this.data.pageSize
          },
          openId: this.data.userId
        },
        success: res => {
          let setParam = `${this.data.currentTab}.goodsData`
          this.setData({
            [setParam]: this.data[this.data.currentTab].goodsData.concat(res.result.data)
          })

        },
        complete: () => {
          this.setData({
            showLoadMore: false
          })
        }
      })
    } catch (e) {

    }

  },
  async handleComfirmReceipt(event){
    wx.showLoading({
      title: '',
    })
    let goodId=event.currentTarget.dataset.id
    wx.cloud.callFunction({
      name:"comfirmReceipt",
      data:{
        id:goodId,
        type:"receipt"
      },
      success: res => {
        db.collection('order')
        .where({
          _openid:wx.getStorageSync('openid')

        })
          .update({
            state:'已完成'
        })
        this.fetchOrderData()
      },
      fail:(e)=>{
        console.log(e)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
    
  },
  handleRate(){
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name:"rate",
      data:{
        id:this.data.rateId,
        rate:this.data.rateValue
      },
      success:(res)=>{
        wx.showToast({
          title: '谢谢支持！',
          icon: "success"
        })
        this.setData({
          isRateModalShow: false,
          rateValue: 0
        })
        this.fetchOrderData()
      },
      fail:(e)=>{
        console.log(e)
      },
      completed:()=>{
        wx.hideLoading()
      }
    })
  }
})