//订单页

const db = wx.cloud.database(); //复用
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabList: ['待接单','待完成','已完成'],
    tabNow: 0,
    orderList: [],
    myOrderNotGet: [],
    myOrdering:[],
    myOrdered:[],
    helpOrder: [],
    openid: '',
    phoneNow: '',
    unreadCount:0
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
  
    let { index, type } = e.currentTarget.dataset;
  
    if (type === 'tab') {
      this.setData({ tabNow: index }, () => {
        this.loadDataBasedOnTabs();
      });
    } 
  },

  // 根据当前的tab状态加载数据
  loadDataBasedOnTabs: function() {
    let { tabNow, tab_nextNow } = this.data;
    console.log(tabNow);
    if (tabNow === 0) {
      this.onLoad();
    } else if (tabNow === 1) {
      this.fetchDataForTab0Next1();
    } else if (tabNow === 2) {
      this.fetchDataForTab0Next2();
    }
  },

  // 获取待完成数据
  fetchDataForTab0Next1: function() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      _openid:this.data.openid,
      state: "待完成"
    }).get({
      success: (res) => {
        // 判断是否有新增的待完成订单
        /*const newOrders = res.data.filter(order => !this.data.orders.some(existingOrder => existingOrder._id === order._id));
        if (newOrders.length > 0) {
          this.setData({
            unreadCount: this.data.unreadCount + 1
          });
        }*/
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
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          myOrdering: data,
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
  //获取已完成数据
  fetchDataForTab0Next2: function() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('order').orderBy('createTime', 'desc').where({
      _openid: this.data.openid,
      state: "已完成"
    }).get({
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
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          myOrdered: data,
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

   // 取消待接单的订单
  deleteOrder(e) {
    wx.showModal({  //showModal 弹窗
      title: '确认要取消该订单吗？',
      content: '如果取消订单数量太多，会导致您的订单接单率减少哦',
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
                title: '已取消',
              })
              this.myOrderNotGet();
              wx.hideLoading();
            },
            fail: () => {
              wx.showToast({
                icon: 'none',
                title: '取消失败',
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
       // this.myOrdered();
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


  //在“待完成”里确定“已完成”
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
    let data = result.data[0];
    data.allMoney += money;
    data.allCount += 1;
    item.state = '已完成';
    item.stateColor = this.formatState(item.state)
    data.allOrder.push(item);
    const { _id, allCount, allMoney, allOrder } = data;
    await wx.cloud.callFunction({
      name: 'updateReceiver',
      data: {
        _id,
      },
    });
    await db.collection('order').doc(orderID).update({
      data: {
        state: '已完成'
      }
    });
   // this.myOrdered();
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
    if (state === '待完成'||'待接单') {
      return 'top_right';
    } else if (state === '已完成') {
      return 'top_right_finish';
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('order').orderBy('createTime', 'desc').where({
      _openid: this.data.openid,
      state: "待接单"
    }).get({
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
          item.info = this.formatInfo(item);
          item.stateColor = this.formatState(item.state);
        });
        this.setData({
          myOrderNotGet: data,
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
    wx.showLoading({
      title: '加载中',
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
      myOrderNotGet,
      myOrdering,
      myOrdered,
      tabNow,
      openid
    } = this.data;

    if (tabNow === 0) {
      db.collection('order').orderBy('createTime', 'desc').skip(myOrderNotGet.length).where({
        _openid: this.data.openid,
        state:"待接单"
      }).get({
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
      db.collection('order').orderBy('createTime', 'desc').skip(myOrdering.length).where({
        _openid: this.data.openid,
        state:"待完成"
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
              myOrdering.push(item);
            });
            this.setData({
              myOrdering,
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
      db.collection('order').orderBy('createTime', 'desc').skip(myOrdered.length).where({
        _openid: this.data.openid,
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