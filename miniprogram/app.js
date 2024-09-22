// app.js
App({
  globalData:{
    orderStatus:"待完成",
    business:''
  },
  watch: function (method) {
    var obj = this.globalData;
    Object.defineProperty(obj, "orderStatus", {
      configurable: true,
      enumerable: true,
      set: function (value) {
        console.log("订单状态变化为：" + value);
        this._orderStatus = value;
        method(value);
      },
      get: function () {
        return this._orderStatus;
      }
    })
  },
  sendSubscribeMessage: function() {
      wx.requestSubscribeMessage({
        tmplIds: ['CPQXB8sEqpwK1BMIIr753xyFOE4gg3UT1AS1vg_N8HE'],
        success(res) {
          if (res['CPQXB8sEqpwK1BMIIr753xyFOE4gg3UT1AS1vg_N8HE'] === 'accept') {
            // 用户同意订阅，可以向用户发送消息了
            console.log(res)
          } else {
            // 用户拒绝订阅，给用户一个提示
            wx.showToast({
              title: '请开启订阅消息功能',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail(err) {
          console.error(err)
        }
      })
  },
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-2gbbi0ro1c0f2dff',
        traceUser: true,
      });
    }

    wx.getSetting({
      withSubscriptions: true,
      success (res) {
        console.log(res.authSetting)
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
        console.log(res.subscriptionsSetting)
        // res.subscriptionsSetting = {
        //   mainSwitch: true, // 订阅消息总开关
        //   itemSettings: {   // 每一项开关
        //     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
        //     SYS_MSG_TYPE_RANK: 'accept'
        //     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
        //     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
        //   }
        // }
      }
    })

    
    this.getDiscount= function (Jifen) {
      if (Jifen >= 1 && Jifen <= 5) {
        return '10';
      } else if (Jifen >5  && Jifen <= 10) {
        return '9.9';
      } else if (Jifen >10 && Jifen<=20) {
        return '9.8';
      } else if (Jifen >20 && Jifen<=30) {
        return '9.7';
      }else if (Jifen >30 && Jifen<=40) {
        return '9.6';
      }else if (Jifen >40 && Jifen<=50) {
        return '9.5';
      }else if(Jifen>50){
        return '9';
      }
      return '10'
    },
    // 在页面的js文件中调用云函数
		this.globalData = {
      Jifen:[],
      discount:10,
    };
    wx.cloud.callFunction({
      name: 'getJifen', // 云函数的名称
      success: res => {
        console.log(res.result.data) // 输出云函数返回的数据
        this.globalData.Jifen= res.result.data // 获取积分数
        // 计算折扣并更新
        this.globalData.discount = this.getDiscount(this.globalData.Jifen);
        // 在页面中进行相应的处理
      },
      fail: err => {
        console.error(err) // 输出错误信息
        // 错误处理
      }
    })


		wx.getSystemInfo({
			success: e => {
				this.globalData.StatusBar = e.statusBarHeight;
				let custom = wx.getMenuButtonBoundingClientRect();
				this.globalData.Custom = custom;  
				this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
			}
		})
  },
  async getUserInfoData() {
    wx.showLoading({
      title: '加载中',
    })
    console.log("0 after output")
    const res = await new Promise((resolve, reject) => {
      wx.getSetting({
        withSubscriptions: true,
        success(res) {
          console.log(res.authSetting)
          resolve(res)
        },
        fail(err) {
          reject(err)
          wx.showToast({
            title: '获取用户setting异常',
          })
        }
      })
    })
    if (res.authSetting['scope.userInfo']) {
      const userInfoRes = await new Promise((resolve, reject) => {
        wx.getUserInfo({
          success(res) {
            console.log("3 after output")
            resolve(res)
          }
        })
      })
      if (userInfoRes.userInfo) {
        console.log(this.globalData)
        this.globalData = {
          ...this.globalData,
          ...userInfoRes
        }
        const cloudRes = await new Promise((resolve, reject) => {
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
              resolve(res)
            },
            fail: err => {
              reject(err)
            }
          })
        })
        console.log(cloudRes)
        this.globalData.openid = cloudRes.result.openid
      }
    }
    wx.hideLoading()
    return this.globalData
  }
});
