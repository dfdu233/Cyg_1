
// pages/jiedanyuan_zhongxin/jiedanyuan_zhongxin.js
const db = wx.cloud.database(); //复用

Page({

  /**
   * 页面的初始数据
   */

  data: {
    tabList: ['待接单', '待完成', '已完成', '正在悬赏'],
    tabNow: 0,
    orderList: [],
    myOrder: [],
    rewardOrder: [],
    helpOrder: [],
    openid: '',
    phoneNow: '',
    canReceive: false,
    helpTotalNum: 0,
    helpTotalMoeny: 0,
    dayCount:0,
    now : new Date().toLocaleDateString(),
    monthCount:0,
    cash:0
  },
  getCash(){
    const that=this
    db.collection('orderReceive').
    where({
      _openid:wx.getStorageSync('openid')
    }).
    get({
      success: function(res) {
       console.log(res.data[0].cash)
        that.setData({
          cash:res.data[0].cash
        })
        
      }
    })
  },
  getdayCount() {
    const _=db.command
    console.log(this.data.now)
    const that=this
    db.collection('order').where({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成',
      createTime: _.and(_.gte(new Date(that.data.now+" 00:00:00")),_.lte(new Date(that.data.now+" 23:59:59"))),
    }).count({
      success: (res) => {

        console.log(res);
        this.setData({
          dayCount: res.total
        })
      }
    })
  },

  getmonthCount() {
    const _=db.command
    console.log(this.data.now)
    const that=this
    const array=this.data.now.split('/')
    const starttime=array[0]+'/'+array[1]+'/'+'1'
    db.collection('order').where({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成',
      createTime: _.and(_.gte(new Date(starttime+" 00:00:00")),_.lte(new Date(that.data.now+" 23:59:59"))),
    }).count({
      success: (res) => {

        console.log(res);
        this.setData({
          monthCount: res.total
        })
      }
    })
  },
  
//订单页


  /**
   * 页面的初始数据
   */

  selectTab(e) {
    const userInfo = wx.getStorageSync('userInfo');  //未登录不允许查看
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    const {
      id
    } = e.currentTarget.dataset;
    this.setData({
      tabNow: id,
    })
    if (id === 0) {
      this.onLoad();
    } else if (id === 1) {
      this.getMyOrder();
    } else if (id === 2) {
      this.getMyHelpOrder();
    } else if (id === 3) {
      this.getRewardOrder();
    }
  },


  //直接删除订单
  zhijiedeleteOrder(e) {
    wx.showLoading({
      title: '处理中',
    })
    const {
      id
    } = e.currentTarget.dataset;
    wx.cloud.callFunction({
      name: 'deleteOrder',
      data: {
        _id: id
      },
      success: () => {
        wx.showToast({
          title: '删除成功',
        })
        this.getMyOrder();
        wx.hideLoading();
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '删除失败',
        })
        wx.hideLoading();
      }
    })
  },

  //打电话
  callPhone(e) {
    const userInfo = wx.getStorageSync('userInfo');  //未登录不允许拨打电话
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    const {
      phone
    } = e.currentTarget.dataset; //当前组件上由data-开头的自定义属性组成的集合
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  getMyHelpOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      receivePerson: this.data.openid,
      state:'已完成'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          if (item.name === "快递代寄" && item.info.imgUrl) {
            item.imgUrl = item.info.imgUrl;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          helpOrder: data,
        })
        wx.hideLoading();
      }
    })
  },
/*
  // 获取我帮助的订单信息 
  getMyHelpOrder() {
    wx.showLoading({
      title: '加载中',
    })
    // 从数据库中获取订单信息
    db.collection('order').orderBy('createTime', 'desc').where({
      receivePerson: wx.getStorageSync('openid'),
      state:'已完成'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        console.log('res')
        console.log(res)
        this.setData({
          helpTotalMoeny: data[0].allMoney,
          helpTotalNum: data[0].allCount
        })
        this.setData({
          helpOrder: data,
        })
        wx.hideLoading();
      }
    })
  },
*/
  // 我帮助的订单单数总和
  getHelpTotalNum() {
    
    db.collection('order').where({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成'
    }).count({
      success: (res) => {
        console.log(res);
        this.setData({
          helpTotalNum: res.total
        })
      }
    })
  },



  // 我帮助的订单金额总和
  getHelpTotalMoney() {
    const $ = db.command.aggregate;
    const max_limit=20;
    const total=db.collection('order').count();
    const batchtimes=Math.ceil(total/max_limit);
    console.log(total)
    for(let i=0;i<5;i++){
      
    db.collection('order').aggregate().match({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成',
    }).skip(i*max_limit)
    .group({
      _id: null,
      totalNum: $.sum('$money'),
    }).end({
      success: (res) => {
        console.log(res);
        this.setData({
          helpTotalMoeny: this.data.helpTotalMoeny+res.list[0].totalNum
        })
      }
    })
  }
  this.setData({
    helpTotalMoeny: this.data.helpTotalMoeny-this.data.cash
  })
  },
  // 获取正在悬赏的订单信息
  getRewardOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      state: '待接单'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          if (item.name === "快递代寄" && item.info.imgUrl) {
            item.imgUrl = item.info.imgUrl;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          rewardOrder: data,
        })
        wx.hideLoading();
      }
    })
  },

  getcash(){
    console.log("提现")
    const _=db.command
    db.collection('orderReceive').
    where({
      _openid:this.data.openid
    }).
    update({
      data: {
        cash: _.inc(this.data.helpTotalMoeny)
      },
      success: function(res) {
        console.log(res.data)
      }
    })

  },
  // 点击接单
  orderReceive(e) {
    const userInfo = wx.getStorageSync('userInfo');  //未登录不允许接单
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    if (this.data.canReceive) {
      wx.showLoading({
        title: '加载中',
      })
      const {
        item
      } = e.currentTarget.dataset;
      const {
        _id,
        _openid
      } = item;
      /* 判断当前用户是否是管理员，自己不能接自己发布的订单 */

      // if (_openid === wx.getStorageSync('openid')) {
      //   wx.showToast({
      //     icon: 'none',
      //     title: '无法接单!',
      //   });
      //   return;
      // } 

      /*点击申请接单后，接单员号码才会显示*/
      const address = wx.getStorageSync('addressNow');
      const userInfo = wx.getStorageSync('userInfo');
      if (address) {
        const {
          phone
        } = address;
        this.setData({
          phoneNow: `${phone}`
        })
      }
      this.setData({
        userInfo,
      })

      //调用updateReceive云函数，接单成功，则订单状态为"待完成"
      wx.cloud.callFunction({ 
        name: 'updateReceive',
        data: {
          _id,
          receivePerson: this.data.openid,
          state: "待完成",
          phonenow:wx.getStorageSync('phone')
        },
        success: (res) => {
          wx.cloud.callFunction({
            name: 'sendMessage',
            data: {
              OPENID: _id
            },
            success: () => {
              wx.showToast({
                title: '已取消',
              })
           
              wx.hideLoading();
            },
            fail: () => {
              wx.showToast({
                icon: 'none',
                title: '取消失败',
              })
              wx.hideLoading();
            }
          });
          getApp().globalData.orderStatus="待完成";
          wx.hideLoading();
        },
        fail: (err) => {
          console.log(err);
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '您目前不是接单员, 请前往个人中心申请成为接单员!'
      })
    }
  },
  //待完成
  getMyOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      _openid: this.data.openid,
      state:'待完成'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          if (item.name === "快递代寄" && item.info.imgUrl) {
            item.imgUrl = item.info.imgUrl;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          myOrder: data,
        })
        wx.hideLoading();
      }
    })
  },

  getMyOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      receivePerson: this.data.openid,
      state:'待完成'
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          if (item.name === "快递代寄" && item.info.imgUrl) {
            item.imgUrl = item.info.imgUrl;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          myOrder: data,
        })
        wx.hideLoading();
      }
    })
  },

  //所有订单的信息
  formatInfo(orderInfo) {
    const {
      name,
      info,
    } = orderInfo;
    if (name === '快递代取') {
      const {
        business,
        expectGender,
        expectTime,
        number,
        remark,
        size,
      } = info;
      return `快递类型: ${size} -- 快递数量: ${number}个 -- 快递商家: ${business} -- 期望送达: ${expectTime} -- 性别限制: ${expectGender} -- 备注: ${remark}`;
    } else if (name === '打印服务') {
      const {
        colorPrint,
        pageNum,
        copieNum,
        remark,
        twoSided
      } = info;
      return `页数: ${pageNum}页 -- 份数: ${copieNum} 份 -- 是否彩印: ${colorPrint ? '是' : '否'} -- 是否双面: ${twoSided ? '是' : '否'} -- 备注: ${remark}`;
    } else if (name === '帮我拿') {
      const {
        helpContent,
        pickUpAddress
      } = info;
      return `帮助内容: ${helpContent} -- 取货地点: ${pickUpAddress}`;
    } else if (name === '快递代寄') {
      const {
        helpContent,
        business,
        remark
      } = info;
      return `帮助内容: ${helpContent} -- 快递商家: ${business} -- 备注: ${remark}`;
    } else if (name === '租借服务') {
      const {
        leaseItem,
        leaseTime,
        deliveryTime
      } = info;
      return `租借物品: ${leaseItem} -- 租借时长: ${leaseTime} -- 预计交货时间: ${deliveryTime}`;
    } else if (name === '游戏陪玩') {
      const {
        gameID,
        gameName,
        gameTime,
        remark
      } = info;
      return `游戏名称: ${gameName} -- 游戏时间or盘数: ${gameTime} -- 游戏ID: ${gameID} -- 备注信息: ${remark}`;
    } else if (name === '帮我送') {
      const {
        deliveryInfo
      } = info;
      return `送达地点: ${deliveryInfo}`;
    } else if (name === '帮我买') {
      const {
        helpContent
      } = info;
      return `帮助内容: ${helpContent}`;
    } else if (name === '其它帮助') {
      const {
        helpContent
      } = info;
      return `帮助内容: ${helpContent}`;
    }
  },

  //所有的状态类型
  formatState(state) {
    if (state === '待接单') {
      return 'top_right';
    } else if (state === '待完成') {
      return 'top_right_help';
    } else if (state === '已完成') {
      return 'top_right_finish';
    }
  },

  //获取当前用户是否有“接单”的权利
  getPersonPower() {
    db.collection('orderReceive').where({
      _openid: wx.getStorageSync('openid'),
      state: '通过'
    }).get({
      success: (res) => {
        this.setData({
          canReceive: !!res.data.length
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.getPersonPower(); //查看当前用户的权限
    this.getCash();
    this.getdayCount();
    this.getmonthCount();
    this.getHelpTotalMoney();
    this.getHelpTotalNum();  
    db.collection('order').orderBy('createTime', 'desc').where(
      {
        state:"待接单"
      }
    ).get({
      success: (res) => {
        const {
          data
        } = res;
        console.log(data);
        data.forEach(item => {
          if (item.name === "快递代取" && item.info.expressCode) {
            item.expressCode = item.info.expressCode;
          }
          if (item.name === "快递代取" && item.info.codeImg) {
            item.codeImg = item.info.codeImg;
          }
          if (item.name === "快递代寄" && item.info.imgUrl) {
            item.imgUrl = item.info.imgUrl;
          }
          //接单员接单后，需要下载需要打印的文件
          if (item.name === '打印服务') {
            item.printImg = item.info.printImg;
          }
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          orderList: data,
          openid: wx.getStorageSync('openid') //获取openid
        })
        wx.hideLoading();
      },
      fail: (res) => {
        wx.showToast({
          icon: 'none',
          title: '服务器异常~~~',
        })
        wx.hideLoading();
      }
    })
  },

  //取件码截图
  showCodeImg(e) {
    const {
      item: {
        codeImg,
        state,
        receivePerson
      }
    } = e.currentTarget.dataset;
    console.log(codeImg, state, receivePerson);
    if (state !== '待完成' || receivePerson !== this.data.openid) {
      wx.showToast({ //设置查看权限
        icon: 'none',
        title: '无权查看 !',
      })
      return;
    }
    //未登录不允许查看
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    wx.previewImage({ //previewImage实现在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作
      urls: [codeImg],
    })
  },

  //快递代寄截图
  showimgUrl(e) {
    const {
      item: {
        imgUrl,
        state,
        receivePerson
      }
    } = e.currentTarget.dataset;
    console.log(imgUrl, state, receivePerson);
    if (state !== '已帮助' || receivePerson !== this.data.openid) {
      wx.showToast({ //设置查看权限
        icon: 'none',
        title: '无权查看 !',
      })
      return;
    }
    //未登录不允许查看
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    wx.previewImage({ //previewImage实现在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作
      urls: [imgUrl],
    })
  },

  //下载需打印的文档
  downloadFile(e) {
    //订单已完成，或者待帮助，或者不是接单员，都无权查看
    const { item: { printImg, codeImg, state, receivePerson } } = e.currentTarget.dataset;
    console.log(printImg, codeImg, state, receivePerson);
    if (state !== '已帮助' || receivePerson !== this.data.openid) {
      wx.showToast({
        icon: 'none',
        title: '无权查看 !',
      })
      return;
    }
    //未登录不允许下载
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请前往个人中心登录 ！',
      })
      return;
    }
    wx.showLoading({
      title: '下载中',
    })
    wx.cloud.downloadFile({ //从云存储下载文件资源到本地
      fileID: printImg, // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath);
        const fileManager = wx.getFileSystemManager();
        fileManager.saveFile({ //存储
          tempFilePath: res.tempFilePath,
          success: (res) => {
            console.log(res, '下载成功');
            wx.hideLoading(); //下载结束后，“下载中”的提示关闭
            wx.openDocument({ //如果是手机上下载打印文件后，会保存到手机微信的某个文件夹，不便于用户查找，所以先使用openDocument打开此文件
              filePath: res.savedFilePath, //直接通过文件路径 (本地路径) 打开文件
              showMenu: true, //手机端显示右上角菜单，可以将文件保存到手机或另存为
            })
          }
        })
      },
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
    wx.showLoading({
      title: '加载中',
    })
    let {
      orderList,
      myOrder,
      rewardOrder,
      helpOrder,
      tabNow,
      openid
    } = this.data;

    if (tabNow === 0) {
      db.collection('order').orderBy('createTime', 'desc').skip(orderList.length).
      where({
        state:'待接单'
      }).
      get({
        success: (res) => {
          if (res.data.length) {
            res.data.forEach(item => {
              if (item.name === "快递代取" && item.info.expressCode) {
                item.expressCode = item.info.expressCode;
              }
              if (item.name === "快递代取" && item.info.codeImg) {
                item.codeImg = item.info.codeImg;
              }
              if (item.name === "快递代寄" && item.info.imgUrl) {
                item.imgUrl = item.info.imgUrl;
              }
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              orderList.push(item);
            })
            this.setData({
              orderList,
            })
          } else { //页面划到最底部显示“无更多信息”
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        },
        fail: (error) => {
          wx.showToast({
            icon: 'none',
            title: '服务器出错...',
          })
          wx.hideLoading();
        }
      })
    } else if (tabNow === 1) {
      db.collection('order').orderBy('createTime', 'desc').skip(myOrder.length).where({
        receivePerson: openid,
        state:'待完成',
      }).get({
        success: (res) => {
          if (res.data.length) {
            const {
              data
            } = res;
            data.forEach(item => {
              if (item.name === "快递代取" && item.info.expressCode) {
                item.expressCode = item.info.expressCode;
              }
              if (item.name === "快递代取" && item.info.codeImg) {
                item.codeImg = item.info.codeImg;
              }
              if (item.name === "快递代寄" && item.info.imgUrl) {
                item.imgUrl = item.info.imgUrl;
              }
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              myOrder.push(item);
            });
            this.setData({
              myOrder,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        }
      })
    } else if (tabNow === 2) {
      db.collection('order').orderBy('createTime', 'desc').skip(helpOrder.length).where({
        receivePerson: this.data.openid,
        state: '已完成'
      }).get({
        success: (res) => {
          if (res.data.length) {
            const {
              data
            } = res;
            data.forEach(item => {
              if (item.name === "快递代取" && item.info.expressCode) {
                item.expressCode = item.info.expressCode;
              }
              if (item.name === "快递代取" && item.info.codeImg) {
                item.codeImg = item.info.codeImg;
              }
              if (item.name === "快递代寄" && item.info.imgUrl) {
                item.imgUrl = item.info.imgUrl;
              }
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              helpOrder.push(item);
            });
            this.setData({
              helpOrder,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        }
      })
    } else if (tabNow === 3) {
      db.collection('order').orderBy('createTime', 'desc').skip(rewardOrder.length).where({
        state: '待接单'
      }).get({
        success: (res) => {
          if (res.data.length) {
            const {
              data
            } = res;
            data.forEach(item => {
              if (item.name === "快递代取" && item.info.expressCode) {
                item.expressCode = item.info.expressCode;
              }
              if (item.name === "快递代取" && item.info.codeImg) {
                item.codeImg = item.info.codeImg;
              }
              if (item.name === "快递代寄" && item.info.imgUrl) {
                item.imgUrl = item.info.imgUrl;
              }
              item.info = this.formatInfo(item);
              item.stateColor = this.formatState(item.state);
              rewardOrder.push(item);
            });
            this.setData({
              rewardOrder,
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '无更多信息',
            })
          }
          wx.hideLoading();
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})