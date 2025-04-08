import store from "../../vuex/store";
// 根据传递的测点类型，返回测点树
export let getPointTree = (model, pointInfo, ...args) => {
  // console.log(model, args, pointInfo);
  let pointTree = [];
  for (let item of args) {
    //model值为1表示多通道，0表示单通道
    let points = typeToPoint(item, pointInfo);
    if(points.length == 0) continue;
    if (model) {
      //将类型的测点放入树中
      pointTree.push(getMultiPointTree(item, points));
    } else {
      pointTree.push(getSinglePointTree(item, points))
    }
  }
  return pointTree;
}

// 根据类型返回相应的测点
let typeToPoint = (type, pointInfo) => {
  let pointData = [];
  switch (type) {
    case '振动':
      pointData = getVibPoint(pointInfo);
      break;
    case '轴位移':
      pointData = getAxialPoint(pointInfo);
      break;
    case '径向振动':
      pointData = getVibPoint(pointInfo);
      break;
    case '轴向振动':
      pointData = getAxialPoint(pointInfo);
      break;
    case '压力':
      pointData = getPressPoint(pointInfo);
      break;
    case '温度':
      pointData = getTempPoint(pointInfo);
      break;
    case '流量':
      pointData = getVolumePoint(pointInfo);
      break;
    case '其他':
      pointData = getOtherPoint(pointInfo);
      break;
    case '撞击':
      pointData = getHitPoint(pointInfo);
      break;
  }
  return pointData;
}

//获取振动测点
let getVibPoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 1);
}

//获取轴位移测点
let getAxialPoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 2)
}

//获取压力测点
let getPressPoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 3)
}

//获取温度测点
let getTempPoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 4)
}
//获取流量测点
let getVolumePoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 5)
}
//获取其他测点
let getOtherPoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 6)
}
//获取撞击测点
let getHitPoint = (pointInfo) => {
  return pointInfo.filter(item => item.channelType == 7)
}

//根据数据构建多通道测点树
let getMultiPointTree = (type, pointData) => {
  //空数据，返回0
  // if (!pointData.length) {
  //   return 0;
  // }
  let point = {
    id: type,
    label: type,
    children: []
  }
  for (let item of pointData) {
    point['children'].push({
      id: item.pointId,
      label: item.pointName,
      pointUuid: item.pointUuid,
      type: item.type,
      channelType: item.channelType
    })
  }
  //如果为振动测点需要给children增加特征
  if (judgePointType(pointData[0])) {
    point['children'].unshift({
      id: `特征${type}`,
      label: `特征`,
      disabled: true,
      type: pointData[0].type,
      index: judgeFeatureIndex(type)
    })
  }
  return point;
}

//根据数据构建单通道测点树
let getSinglePointTree = (type, pointData) => {
  let point = {
    id: type,
    label: type,
    xid: type,
    disabled: true,
    children: []
  }
  //获取所有类型测点的特征值
  let feature = store.state.features;
  for (let item of pointData) {
    let pointInfo = {
      id: item.pointId,
      pointUuid: item.pointUuid,
      label: item.pointName,
      xid: item.pointId,
      type: item.type,
      parent: type,
      children: []
    }
    for (let [index, featureItem] of feature[item.type].entries()) {
      pointInfo.children.push({
        id: item.pointId + index,
        pointUuid: item.pointUuid,
        label: featureItem.label,
        unit: featureItem.unit,
        xid: index.toString(),
        type: item.type,
      })
    }
    point.children.push(pointInfo)
  }
  return point;
}

//判断是否为振动测点
let judgePointType = (pointInfo) => {
  if ([1, 2].includes(pointInfo.channelType)) {
    return true;
  }
  return false;
}

//根据测点类型判断控制特征值数组的下标是哪一个
let judgeFeatureIndex = (type) => {
  let index = 0;
  switch (type) {
    case '振动':
      index = 0;
      break;
    case '轴位移':
      index = 1;
      break;
    case '径向振动':
      index = 0;
      break;
    case '轴向振动':
      index = 1;
      break;
  }
  return index;
}
