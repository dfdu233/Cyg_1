//订单页

const db = wx.cloud.database(); //复用
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabList: ['我发布的', '我下单的'],
    tabNow: 0,
    orderList: [],
    myOrder: [],
    helpOrder: [],
    openid: '',
    phoneNow: '',
    canReceive: false,
    helpTotalNum: 0,
    helpTotalMoeny: 0,
    tab_nextList:['待完成','已完成'],
    tab_nextNow:0,
    dayCount:0
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
  
    const { index, type } = e.currentTarget.dataset;
  
    if (type === 'tab') {
      this.setData({ tabNow: index });
  
      if (index === 0) {
        this.onLoad(); // 模拟页面加载
      } else if (index === 1) {
        this.getMyOrder(); // 获取我下单的订单
      } else if (index === 2) {
        this.getMyHelpOrder(); // 获取我接收的订单
      }
    } else if (type === 'tab_next') {
      this.setData({ tab_nextNow: index });
      // 处理tab_next中的选择逻辑
    }
  },

  // 删除已帮助的订单
  deleteOrder(e) {
    wx.showModal({  //showModal 弹窗
      title: '确认要取消该订单吗？',
      content: '如果要取消已帮助的订单，请一定要电话告知接单者！！！如果未告知接单者，擅自取消已帮助的订单，则违反平台规定，受到平台惩罚！！！',
      success: (res) => {
        const { confirm } = res; //confirm用户点击的选项
        if (confirm) {
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
        }
      }
    })
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

  // 获取我帮助的订单信息 
  getMyHelpOrder() {
    wx.showLoading({
      title: '加载中',
    })
    // 从数据库中获取订单信息
    db.collection('orderReceive').where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: (res) => {
        const {
          data
        } = res;
        this.setData({
          helpTotalMoeny: data[0].allMoney,
          helpTotalNum: data[0].allCount
        })
        this.setData({
          helpOrder: data[0].allOrder,
        })
        wx.hideLoading();
      }
    })
  },

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
    db.collection('order').aggregate().match({
      receivePerson: wx.getStorageSync('openid'),
      state: '已完成',
    }).group({
      _id: null,
      totalNum: $.sum('$money'),
    }).end({
      success: (res) => {
        console.log(res);
        this.setData({
          helpTotalMoeny: res.list[0].totalNum
        })
      }
    })
  },

  // 获取正在悬赏的订单信息
  getRewardOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      state: '待帮助'
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

  // 获取我的订单信息
  getMyOrder() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      _openid: this.data.openid
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

      //调用updateReceive云函数，接单成功，则订单状态为"已帮助"
      wx.cloud.callFunction({ 
        name: 'updateReceive',
        data: {
          _id,
          receivePerson: this.data.openid,
          state: "已帮助"
        },
        success: (res) => {
          if (this.data.tabNow === 0) {
            this.onLoad();
          } else {
            this.getRewardOrder();
          }
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

  //在“我的订单”里确定“已完成”
  async toFinish(e) {
    wx.showLoading({
      title: '加载中',
    })
    const {
      item
    } = e.currentTarget.dataset;
    const {
      _id: orderID,
      receivePerson,
      money
    } = item;
    const result = await db.collection('orderReceive').where({
      _openid: receivePerson
    }).get();
    console.log(result)
    let data = result.data[0];
    data.allMoney += money;
    data.allCount += 1;
    data.dayCount += 1;
    item.state = '已完成';
    item.stateColor = this.formatState(item.state)
    data.allOrder.push(item);
    const { _id, allCount, allMoney, allOrder ,dayCount} = data;
    await wx.cloud.callFunction({
      name: 'updateReceiver',
      data: {
        _id,
        allMoney, //总收益
        allCount, //总单数
        allOrder, //所有我帮助的订单
        dayCount,
      },
    });
    await db.collection('order').doc(orderID).update({
      data: {
        state: '已完成'
      }
    });
    this.getMyOrder();
    wx.hideLoading();
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
    if (state === '待帮助') {
      return 'top_right';
    } else if (state === '已帮助') {
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
    db.collection('order').orderBy('createTime', 'desc').get({
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
      db.collection('order').orderBy('createTime', 'desc').skip(orderList.length).get({
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
        _openid: openid
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
        state: '待帮助'
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