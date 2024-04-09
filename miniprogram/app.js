// app.js
App({
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
      discount:10
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
  }
});
