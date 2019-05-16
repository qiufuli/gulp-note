/**
 * 开发环境配置
 * 
 * */

const dev = {
  proxy: [{
    // target: 'http://130.10.7.135:8086', // 开发
    target: 'http://130.10.7.124:8086', // 开发
    // target: 'http://130.10.7.136:8086', // 开发
    pathRules: ['/dwww/**']
  }],
  // 自定义代理
  customerProxy: {
    /**
    * 自定义代理过滤
    * @param {String} pathname 路径名
    * @param {Object} req 请求对象
    * @return {Boolean} 返回为true，使用代理
    */
    filter(pathname, req) {
      const FLAG_STR = '?method';
      return req.url.indexOf(FLAG_STR) > -1;
    },
    target: 'http://www.shyjy.gov.cn'
  },
  port: '9999',
  ie8Port: '10000',
  logPrefix: '项目',
  // browserSync Sync同步配置 ghostMode
  // clicks click事件同步
  // scroll 滚动事件同步
  // forms 表单同步，包括：表单输入，表单提交等（原生表单）
  syncOption: {
    clicks: false,
    scroll: false,
    forms: false
  }
}
// 项目基本设置，不设时为默认值
const base = {
  // DEV: 'src', // 开发目录
  // PRO: 'dist' // 线上目录
};

module.exports.dev = dev;
module.exports.base = base;