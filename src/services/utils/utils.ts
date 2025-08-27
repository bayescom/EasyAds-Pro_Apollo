const formatData = (data , places?, thousand?, decimal?) => {
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  thousand = thousand || ',';
  decimal = decimal || '.';
  let number = data, j;
  const negative = number < 0 ? '-' : '',
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + '';

  j = (j = i.length) > 3 ? j % 3 : 0;
  return negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : '');
};

const formatString2Array = (data) => {
  if (!data) {
    return [];
  }
  // 如果不为空，搜索框中的内容要经过后处理，比如去掉两个连续的顿号、逗号，英文逗号，换行空格等。
  const _data = data.replace(/[\r\n]/gi,',').replace(/\s+/ig,',').replace(/，+/gi,',').replace(/、+/gi,',').replace(/,+/gi,',').split(',');
  // 去掉单个字符串中的前后空格
  return _data.filter(function (s) {
    // 注：IE9(不包含IE9)以下的版本没有trim()方法
    return s && s.trim(); 
  });
};

const getUrlParams = (url: string) => {
  const pattern = /(\w+|[\u4e00-\u9fa5]+)=(\w+|[\u4e00-\u9fa5]+)/ig;
        
  const result: {current: string, pageSize: string, status?: string} = {current: '', pageSize: '', status: '1'};
  url.replace(pattern, ($, $1, $2)=>{
    result[$1] = $2;
  });
  return result;
};

/**
 * 生成随机数
 */
const generateRandomID = () => {
  const randomID = Math.random().toString(36).substring(2, 18);
  return randomID;
};

const sortByOrder = (originalArray, sortOrderArray) =>  {
  // 使用map将originalArray的每个元素映射到一个包含元素值和其在sortOrderArray中索引的对象  
  const mappedArray = sortOrderArray.map(value => ({  
    value: value,  
    sortOrderIndex: originalArray.indexOf(value)  
  }));  

  // 根据sortOrderIndex进行排序  
  mappedArray.sort((a, b) => a.sortOrderIndex - b.sortOrderIndex);  

  // 提取排序后的值  
  const sortedArray = mappedArray.filter(item => item.sortOrderIndex != -1);
  const result = sortedArray.map(item => item.value);
  return result;
};

/**
 * 解决两个数相加精度丢失问题
 * @param a
 * @param b
 * @returns {Number}
 */
function floatAdd(a, b) {
  let c, d;
  if (undefined == a || null == a || '' == a || isNaN(a)) { a = 0;}
  if (undefined == b || null == b || '' == b || isNaN(b)) { b = 0;}
  try {
    c = a.toString().split('.')[1].length;
  } catch (f) {
    c = 0;
  }
  try {
    d = b.toString().split('.')[1].length;
  } catch (f) {
    d = 0;
  }
  const e = Math.pow(10, Math.max(c, d));
  return  (floatMul(a, e) + floatMul(b, e)) / e;
}

/**
 * 解决两个数相乘精度丢失问题
 * @param a
 * @param b
 * @returns {Number}
 */
function floatMul(a, b) {
  let c = 0;
  const d = a.toString();
  const e = b.toString();
  try {
    c += d.split('.')[1].length;
  } catch (f) { console.log(); }
  try {
    c += e.split('.')[1].length;
  } catch (f) { console.log(); }
  return Number(d.replace('.', '')) * Number(e.replace('.', '')) / Math.pow(10, c);
}

const getTimeDifference = (startTime: string, endTime: string) => {
  // 解析时间字符串为Date对象
  const startDate = new Date(startTime.replace(' ', 'T') + 'Z');
  const endDate = new Date(endTime.replace(' ', 'T') + 'Z');
  
  // 计算时间差（毫秒） - 使用getTime()获取时间戳
  const diffMs = endDate.getTime() - startDate.getTime();
  
  // 计算天数和小时数
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // 返回格式化结果
  return `${diffDays}天${diffHours}小时`;
};

/**
 * 32位随机大小写字母和1-9数字 
 * @returns 
 */
const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 将 Number 数组 转换为 String 数组
 * @param list Number[]
 * @returns result String[]
 */
const convertNumbersToStrings = (list) => list.map(item => String(item));

/**
 * 将 String 数组 转换为 Number 数组
 * @param list String[]
 * @returns result Number[]
 */
const convertStringsToNumbers = (list) => list.map(item => +item);

const getCurrentDateTimeFormatted = () => {
  const now = new Date();
    
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要+1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
};


function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
}

export { formatData, formatString2Array, getUrlParams, generateRandomID, sortByOrder, floatAdd, getTimeDifference, generateRandomString, convertNumbersToStrings, convertStringsToNumbers, getCurrentDateTimeFormatted, areArraysEqual };
