/**
 * 此方法目的使vue文件中的时间转换的方法统一
 * 提供时间时间戳转换时间字符串
 * 效果示例：2019-01-01 00:00:00.000
 * @param timestamp
 */
function timestampToTimeFormat(timestamp){
  var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + '.';
  var ms = (date.getTime() % 1000).toString();
  while (ms.length < 3) {
    ms = '0' + ms;
  }
  return Y + M + D + h + m + s + ms;
}
/**
 * 此方法目的使vue文件中的时间转换的方法统一
 * 提供时间时间戳转换时间字符串
 * 效果示例：2019-01-01\n00:00:00.000
 * @param timestamp
 */
function timestampToTimeFormatLineBreaks(timestamp){
  return timestampToTimeFormat(timestamp).replaceAll(" ",'\n');
}

function timestampToTimeFormatLineBreaksNoMilliseconds(timestamp){
  return timestampToTimeFormatLineBreaks(timestamp).split(".",1);
}

/**
 * 将时间字符串转换为时间戳
 * 支持多种时间格式：
 * - YYYY
 * - YYYY-MM
 * - YYYY-MM-DD
 * - YYYY-MM-DD HH
 * - YYYY-MM-DD HH:mm
 * - YYYY-MM-DD HH:mm:ss
 * - YYYY-MM-DD HH:mm:ss.SSS
 * @param {string} timeString - 时间字符串
 * @returns {number} 时间戳（毫秒）
 */
function timeStringToTimestamp(timeString) {
  // 替换换行符，确保时间字符串格式统一
  const normalizedString = timeString.replace(/\n/g, " ");

  // 尝试直接解析为 Date 对象
  const date = new Date(normalizedString);

  // 检查是否成功解析
  if (!isNaN(date.getTime())) {
    return date.getTime();
  } else {
    // 如果直接解析失败，尝试手动解析常见格式
    const regex = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?(?:\s+(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(?:\.(\d{1,3}))?$/;
    const match = normalizedString.match(regex);

    if (match) {
      const year = parseInt(match[1], 10);
      const month = match[2] ? parseInt(match[2], 10) - 1 : 0; // 月份从 0 开始
      const day = match[3] ? parseInt(match[3], 10) : 1; // 如果没有日期，默认为1号
      const hours = match[4] ? parseInt(match[4], 10) : 0;
      const minutes = match[5] ? parseInt(match[5], 10) : 0;
      const seconds = match[6] ? parseInt(match[6], 10) : 0;
      const milliseconds = match[7] ? parseInt(match[7], 10) : 0;

      const manualDate = new Date(year, month, day, hours, minutes, seconds, milliseconds);
      return manualDate.getTime();
    } else {
      throw new Error(`无法解析时间字符串: ${timeString}`);
    }
  }
}

export {timestampToTimeFormat, timestampToTimeFormatLineBreaks,timestampToTimeFormatLineBreaksNoMilliseconds, timeStringToTimestamp}
