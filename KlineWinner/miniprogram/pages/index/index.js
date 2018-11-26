//index.js
const CHARTS = require('../../../dist/wxcharts.js'); // 引入wx-charts.js文件
data: {
  dataInfo: [
    {
      id: 1,
      subNum: "C1609050001",
      percentage: 30,
      grade: "SPCC",
      spec: "2.5*1200*C",
      weight: 500
    },
    {
      id: 2,
      subNum: "A1609050001",
      percentage: 80,
      grade: "SPCC",
      spec: "3.5*1200*C",
      weight: 100
    }
  ]
},
ringShow: function() {
  for (var i in this.data.dataInfo) {
    var item = this.data.dataInfo[i];
    let ring = {
      canvasId: "ringGraph" + item.id, // 与canvas-id一致
      type: "ring",
      series: [
        {
          name: "已完成",
          data: item.percentage,
          color: '#ff6600'
        },
        {
          name: "未完成",
          data: 100 - item.percentage,
          color: '#eeeeee'
        }
      ],
      width: 100,
      height: 100,
      dataLabel: false,
      legend: false,
      title: { // 显示百分比
        name: item.percentage + '%',
        color: '#333333',
        fontSize: 14
      },
      extra: {
        pie: {
          offsetAngle: -90
        },
        ringWidth: 6,
      }
    };
    new CHARTS(ring);
  }
}

const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
