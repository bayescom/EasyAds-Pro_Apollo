const routerPermissions = [
  {
    'name': '数据报表',
    'key': 'data_report',
    'path': '',
    'children': [
      {
        'name': '媒体收益报表',
        'key': 'media_report',
        'path': '/data_report/media_report',
        'children': []
      },
      {
        'name': 'A/B测试报表',
        'key': 'ab_report',
        'path': '/data_report/ab_report',
        'children': []
      },
    ]
  },
  {
    'name': '资源管理',
    'key': 'traffic',
    'path': '',
    'children': [
      {
        'name': '媒体管理',
        'key': 'media',
        'path': '/traffic/media'
      },
      {
        'name': '广告位管理',
        'key': 'adspot',
        'path': '/traffic/adspot'
      },
      {
        'name': '广告网络',
        'key': 'channel',
        'path': '/traffic/channel'
      }
    ]
  },
  {
    'name': '流量分发',
    'key': 'distribution',
    'path': '/traffic/distribution',
    'children': []
  },
  {
    'name': '用户管理',
    'key': 'user',
    'path': '/company/user',
    'children': []
  },
  {
    'name': '版本号管理',
    'key': 'version',
    'path': '/version_app',
    'children': []
  },
];

const routerPermissionsPathList = [
  '/data_report/media_report',
  '/traffic/media',
  '/traffic/adspot',
  '/traffic/channel',
  '/traffic/distribution',
  '/company/user',
  '/version_app',
  '/version_sdk',
  '/data_report/ab_report'
];

export { routerPermissions, routerPermissionsPathList };
