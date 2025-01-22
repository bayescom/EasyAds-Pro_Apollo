import Compression from 'vite-plugin-compression';

export default {
  vite: true,
  hash: true,
  plugins: [
    [
      'build-plugin-ignore-style',
      {
        libraryName: 'antd'
      }
    ],
  ],
  vitePlugins: [Compression()],
  proxy: {
    '/dspapi': {
      enable: true,
      target: 'http://192.168.8.107:8080'
    }
  }
};
