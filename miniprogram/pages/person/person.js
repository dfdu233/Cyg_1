// 我的

const db = wx.cloud.database();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {}, //存放用户信息
        hasUserInfo: false, //是否获取了用户信息，默认false
        canIUseGetUserProfile: false, //是否支持新接口获取用户信息，默认false
        // success代表已经是接单员了, 
        // fail代表曾经申请过但是没通过
        // loading代表目前有正在审核中的
        // null代表从未申请过
        personReceiveState: '', //用户目前申请接单的状态
				admin: false,
				orderReceive:false,
    },

    handleClickNotice() {
      wx.showModal({  //showModal 弹窗
        title: '公告',
        content: '欢迎使用！有问题请添加客服的微信：zxy1475857674'
			})
			wx.setClipboardData({
				data: 'zxy1475857674',
				success: () => {
						wx.showToast({
								title: '复制微信成功',
						})
				}
		})
    },

    //审核接单申请
    orderReceiver() {
      //管理员审核接单申请前也要登录
      // const userInfo = wx.getStorageSync('userInfo');
      // if (!userInfo) {
      //     wx.showToast({
      //       icon: 'none',
      //       title: '请前往个人中心登录 ！',
      //     })
      //     return;
      // }
        wx.navigateTo({
            url: '../orderReceiver/orderReceiver',
        })
    },

//审核接单申请
    orderReceiver() {
      //管理员审核接单申请前也要登录
      // const userInfo = wx.getStorageSync('userInfo');
      // if (!userInfo) {
      //     wx.showToast({
      //       icon: 'none',
      //       title: '请前往个人中心登录 ！',
      //     })
      //     return;
      // }
        wx.navigateTo({
            url: '../orderReceiver/orderReceiver',
        })
    },

    //跳转到接单员中心
    jiedanyuan_zhongxin() {
      //接单员进入接单中心前也要登录
      // const userInfo = wx.getStorageSync('userInfo');
      // if (!userInfo) {
      //     wx.showToast({
      //       icon: 'none',
      //       title: '请前往个人中心登录 ！',
      //     })
      //     return;
      // }
        wx.navigateTo({
            url: '../jiedanyuan_zhongxin/jiedanyuan_zhongxin',
        })
    },

    //退出登录
    out(){
      const userInfo = wx.getStorageSync('userInfo');  //未登录，无需退出登录
      if (!userInfo) {
          wx.showToast({
            icon: 'none',
            title: '当前未登录， 无需退出登录 !',
          })
          return;
      }
      wx.showModal({  //showModal 弹窗
        title: '提示',
        content: '确定退出吗？',
        success: (res) => {
          const {confirm} = res; //confirm用户点击的选项
          if (confirm){
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('hasUserInfo');
            this.setData({
              hasUserInfo: false
          })
        }
        }
      })
    },

    //申请接单
    applyOrder() {
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.showToast({
              icon: 'none',
              title: '请前往个人中心登录 !',
            })
            return;
        }
        const {
            personReceiveState
        } = this.data;
        // success代表已经是接单员了
        if (personReceiveState === 'success') {
            wx.showModal({
                title: '提示',
                content: '您已经是接单员了, 请勿重复申请!',
                showCancel: false
            })
        } 
        // fail代表曾经申请过但是没通过
        else if (personReceiveState === 'fail') {
            wx.showModal({
                title: '提示',
                content: '您之前提交的申请未通过审核, 您可以继续申请, 如有疑问请联系管理员: zxy1475857674',
                success: (res) => {
                    const {
                        confirm
                    } = res;
                    if (confirm) {
                        wx.navigateTo({
                            url: '../applyOrder/applyOrder',
                        })
                    }
                }
            })
        } 
        // loading代表目前有正在审核中的
        else if (personReceiveState === 'loading') {
            wx.showModal({
                title: '提示',
                content: '您之前申请的内容正在审核中, 请耐心等待! 如加急审核请添加管理员微信: zxy1475857674',
                showCancel: false,
            })
        }         
        // null代表从未申请过
        else if (personReceiveState === 'null') {
            wx.navigateTo({
              url: '../applyOrder/applyOrder',
            })
        }
    },

   //我的地址
	 toaddAddress() {
		wx.navigateTo({
				url: '../addAddress/addAddress',
		})
},

   //我的积分
	 topoints() {
		wx.navigateTo({
				url: '../points/points',
		})
},		

    //关于我们
    toAbout() {
        wx.navigateTo({
            url: '../aboutAs/aboutAs',
        })
    },

//用户指南
touserguide() {
	wx.navigateTo({
			url: '../userguide/userguide',
	})
},

    getWXCustomer() { //复制微信
        wx.setClipboardData({
            data: 'zxy1475857674',
            success: () => {
                wx.showToast({
                    title: '复制微信成功',
                })
            }
        })
    },

    updateInfo() {
        if (this.data.hasUserInfo) { //未授权的话就不允许跳转
            wx.navigateTo({
                url: '../updateInfo/updateInfo',
            })
        }
    },

    //利用getPhoneNumber获取手机号
    getPhoneNumber(e) {
        wx.cloud.callFunction({ //调用云函数
            name: 'getUserPhone',
            data: {
                cloudID: e.detail.cloudID,
            },
            success: (res) => { //成功回调
                console.log(res);
                wx.setStorageSync('phone', res.result.list[0].data.phoneNumber);
            },
            fail: (err) => { //失败回调
                console.log(err);
            }
        })
    },

    //新接口
    getUserProfile() {
        wx.getUserProfile({
            desc: '获取用户信息',
            success: (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
                wx.setStorageSync('userInfo', res.userInfo); //数据存在本地缓存
                let userInfo = this.data.userInfo;
                userInfo.nickName = "已登录！点此修改信息";
                userInfo.avatarUrl = '../../images/denglutouxiang.png';
                this.setData({
                userInfo,
                })
                wx.setStorageSync('userInfo', this.data.userInfo); //登录后，更换小程序的默认头像和昵称
            }
        })
    },

    // 老接口
    getUserInfo(e) {
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },

    // 判断当前用户是否是接单员
    getJiedanyuanPower() { 
			db.collection('orderReceive').where({  
				  _openid: wx.getStorageSync('openid'),
					state: '通过' // 判断state字段的值是否为“通过”  
			}).get({  
					success: (res) => {  
							if (res.data.length > 0) {  
									this.setData({  
											orderReceive: true // 设置为true表示用户是接单员  
									});  
							} else {  
									this.setData({  
											orderReceive: false // 设置为false表示用户不是接单员  
									});  
							}  
					},  
					fail: (err) => {  
							console.error('查询失败:', err); // 处理查询失败的情况  
							this.setData({  
									orderReceive: false // 默认设置为false，表示查询失败或没有匹配的文档  
							});  
					}  
			}); 
    },

// 判断当前用户是否是管理员
    getAdminPower() {
        db.collection('admin').where({
            adminID: wx.getStorageSync('openid')
        }).get({
            success: (res) => {                
                this.setData({
                    admin: !!res.data.length //取反两次把数值类型转换成bool类型
                })
            }
        })
    },

  

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true //可以用新的API
            })
        }
        wx.showLoading({
          title: '加载中',
        })
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            hasUserInfo: !!userInfo, //任意类型，取反两次，均会把原来类型转换成bool类型
            userInfo: userInfo,
        })
        let personReceiveState = '';
				this.getJiedanyuanPower();
				this.getAdminPower();
        db.collection('orderReceive').where({
            _openid: wx.getStorageSync('openid')
        }).get({
            success: (res) => {
                const {
                    data
                } = res;
                if (data.length) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].state === '通过') {
                            personReceiveState = 'success';
                            break;
                        } else if (data[i].state === '不通过') {
                            personReceiveState = 'fail';
                        } else {
                            personReceiveState = 'loading';
                            break;
                        }
                    }
                } else {
                    personReceiveState = 'null';
                }
                this.setData({
                    personReceiveState,
                })
                wx.hideLoading();
            }
        })
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
        this.onLoad();
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