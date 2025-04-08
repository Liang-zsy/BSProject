import store from "../../vuex/store";
import {timestampToTimeFormat} from "./TimeFormat";
export let changeGraphData = (_dataX, _dataY) => {
  // if (dataX.length > dataY[0].data.length) {
  //  dataX.shift();
  //  dataX.pop();
  // }
  let dataX = _dataX.concat();
  let dataY = [];
  for (let item in _dataY) {
    dataY.push(JSON.parse(JSON.stringify(_dataY[item])));
  }
  // dataY[0].data[0] = 0;
  // console.log(dataY[0].data[0], _dataY[0].data[0]);
  console.log('传入的数据', dataX, dataY);
  console.log('开始时间', store.state.startTime);
  //检查 store.state 中的 startTime 和 endTime，并根据这些时间调整 dataX 和 dataY。
  // 如果 dataX 的第一个时间点晚于 startTime，则在 dataX 的开头插入 startTime，并在 dataY 的对应位置插入 null。
  // 同理，如果 dataX 的最后一个时间点早于 endTime，则在 dataX 的末尾插入 endTime，并在 dataY 的对应位置插入 null。
  //为解决23问题，7.5注释掉该代码
  // if (store.state.startTime && store.state.endTime) {
  //   if (new Date(dataX[0]).getTime() > store.state.startTime) {
  //     dataX.unshift(timestampToTimeFormat(store.state.startTime));
  //     // dataX.unshift(this.modelFlag ? timestampToTime(store.state.startTime) : store.state.startTime);
  //     for (let item in dataY) {
  //       dataY[item].data.unshift(null);
  //     }
  //   }
  //   if (new Date(dataX[dataX.length - 1]).getTime() < store.state.endTime) {
  //     dataX.push(timestampToTimeFormat(store.state.endTime));
  //     // dataX.push(this.modelFlag ? timestampToTime(store.state.endTime) : store.state.endTime);
  //     for (let item in dataY) {
  //       dataY[item].data.push(null);
  //     }
  //   }
  // }
  for (let item in dataY) {
    let datayData = dataY[item].data;
    for (let _item in datayData) {
      // dataX[_item] = timeToTimestamp(dataX[_item]);
      datayData[_item] = [dataX[_item], datayData[_item]];
    }
  }
  let allData = {
    dataX,
    dataY
  }
  // let maxTime = Number.MIN_VALUE;
  // // let minTime = Number.MAX_VALUE;
  // // let minTime = parseInt(comSub(dataX[dataX.length - 1], dataX[0])  / dataX.length / 1000);
  // let minTime = (comSub(dataX[dataX.length - 1], dataX[0])  / dataX.length / 1000);
  // let subList = [''];
  // let addNum = [0];
  // let num = {};
  // let index = -1;
  // let mxValue = -1;
  // for (let item in dataX) {
  //   let _item = Number(item);
  //   if (_item) {
  //     let sub = comSub(dataX[_item], dataX[_item - 1]);
  //     // sub = parseInt(sub / 1000);
  //     sub = (sub / 1000);
  //     subList[item] = sub;
  //     mxValue = Math.max(mxValue, sub);
  //     // minTime = Math.min(minTime, sub);
  //     // if (sub > 60) {
  //     //   minTime = Math.min(minTime, sub);
  //     // }
  //     if (num[sub]) {
  //       num[sub]++;
  //     } else {
  //       num[sub] = 1;
  //     }
  //     if (num[sub] > maxTime) {
  //       maxTime = num[sub];
  //       index = item;
  //     }
  //   }
  // }
  // console.log('间距', subList);
  // // console.log(num, maxTime, subList[index]);
  // let tmpDataX = {};
  // let mul = 0, sum = 0;
  // for (let item in dataX) {
  //   let _item = Number(item);
  //   if (_item) {
  //     // if (subList[item] > subList[index]) {
  //     //   let addNum = parseInt((subList[item] - subList[index]) / subList[index] - 1);
  //     //   if (addNum && subList[item] > 3000) {
  //     //     sum += addNum;
  //     //   }
  //     // }
  //     // let addNum = parseInt((subList[item] - minTime) / minTime - 1);
  //     // let addNum = parseInt(minTime / (subList[item] - minTime) - 1);
  //     // let addNum = subList[item] > minTime ? parseInt((subList[item] - minTime) / minTime - 1) :
  //     // parseInt(minTime / (minTime - subList[item]) - 1);
  //     addNum[_item] = subList[item] > minTime ? ((subList[item] - minTime) / minTime - 1) :
  //     0;
  //     // console.log(addNum);
  //     if (addNum[_item] <= 0) {
  //       addNum[_item] = 0;
  //     }
  //     if (addNum[_item]) {
  //       sum += addNum[_item];
  //     }
  //   }
  // }
  // // let maxAddNum = parseInt(dataX.length / 2);
  // let maxAddNum = dataX.length;
  // if (sum > maxAddNum) {
  //   mul = parseFloat((maxAddNum / sum).toFixed(6));
  // }
  // console.log(minTime, sum, mul, typeof mul, mxValue);
  // // minTime = (comSub(dataX[dataX.length - 1], dataX[0])  / ((dataX.length - 2 + sum) * 1000));
  // for (let item in dataX) {
  //   let _item = Number(item);
  //   let addDataX = [];
  //   let addDataY = [];
  //   if (_item) {
  //     // if (subList[item] > subList[index]) {
  //     //   let addNum = parseInt((subList[item] - subList[index]) / subList[index] - 1);
  //     //   if (addNum && subList[item] > 3000) {
  //     //     if (mul) {
  //     //       addNum = parseInt(addNum / mul);
  //     //     }
  //     //     if (addNum) {
  //     //       addDataX = Array(addNum).fill('');
  //     //       addDataY = Array(addNum).fill(null);
  //     //     }
  //     //   }
  //     // }
  //     // let addNum = parseInt((subList[item] - minTime) / minTime - 1);
  //     // let addNum = parseInt(minTime / (subList[item] - minTime) - 1);
  //     // let addNum = subList[item] > minTime ? parseInt((subList[item] - minTime) / minTime - 1) :
  //     // parseInt(minTime / (minTime - subList[item]) - 1);
  //     let addNum = subList[item] > minTime ? ((subList[item] - minTime) / minTime - 1) :
  //     0;
  //     if (addNum <= 0) {
  //       addNum = 0;
  //     }
  //     if (addNum > 0) {
  //       if (mul) {
  //         addNum = parseInt(addNum * mul);
  //       }
  //       if (addNum > 0) {
  //         addNum = parseInt(addNum);
  //         addDataX = Array(addNum).fill('');
  //         addDataY = Array(addNum).fill(null);
  //       }
  //     }
  //     tmpDataX[item] = {
  //       addDataX,
  //       addDataY
  //     }
  //   }
  // }
  // let allDataY = [];
  // for (let item in dataY) {
  //   allDataY.push({
  //     name: dataY[item].name,
  //     data: []
  //   })
  // }
  // console.log(tmpDataX);
  // let allDataX = [];
  // for (let item in dataX) {
  //   if (tmpDataX[item]) {
  //     allDataX = allDataX.concat(tmpDataX[item].addDataX);
  //     // console.log(tmpDataX[item].addDataX, tmpDataX[item].addDataY[0], allDataX);
  //     for (let _item in allDataY) {
  //       allDataY[_item].data = allDataY[_item].data.concat(tmpDataX[item].addDataY);
  //     }
  //   }
  //   allDataX.push(dataX[item]);
  //   for (let _item in dataY) {
  //     allDataY[_item].data.push(dataY[_item].data[item]);
  //   }
  // }
  console.log('更新后的趋势图', allData.dataX, allData.dataY);
  // let allData = {
  //   dataX: allDataX,
  //   dataY: allDataY
  // }
  // let allData = {
  //   dataX,
  //   dataY
  // }
  return allData;
}
let comSub = (x, y) => {
  return new Date(x).getTime() - new Date(y).getTime();
}
// let timestampToTime = (timestamp) => {
//   var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
//   var Y = date.getFullYear() + '-';
//   var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
//   var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
//   var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
//   var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
//   var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds()) + '.';
//   var ms = (timestamp % 1000).toString();
//   while(ms.length < 3) {
//     ms = '0' + ms;
//   }
//   //var nowtime = new Date(Y+M+D+h+m+s);
//   return Y+M+D+h+m+s+ms;
// }
//
// let timeToTimestamp = (time) => {
//   return new Date(time).getTime();
// }
