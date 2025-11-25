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
};
