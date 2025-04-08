import store from '../vuex/store'
export const renderContentMixin = {
  methods: {
    renderContent(h, {node, data}) {
      // console.log(node)
      if (node.label == '特征') {
        let featureType = store.state.features[node.data.type];
        return h("div", {class: "feature-content"},[
            h("span", {
                style: {
                  fontSize: '14px',
                  color: this.mycolor,
                  marginRight: '5px',
                  display: 'flex',
                  alignItems: 'center'
                },
              }, this.translateText("opPage.textMap.", "特征")),
            h("div",{class: "feature-select"},[h("el-select", {
              class: "el-select--mini el-input--mini tree-el-input",
              style: {
                // width: '55%'
              },
              on: {
                input: (value) => {
                  this.$set(this.featureSelect, node.data.index, value);
                  //分为多通道、单通道两种模式,只有一种模式时调用多通道的选择函数
                  if (this.treeSelect == 1) {
                    this.SinglePointTreeChecked()
                  } else {
                    this.MultiPointTreeChecked();
                  }
                }
              },
              props: {
                value: this.featureSelect[node.data.index]
              }
            }, [
              featureType.map(item => {
                return h("el-option", {
                    style: {
                      lineHeight: '18px',
                      fontSize: '14px',
                      height: '18px'
                    },
                    props: {
                      value: item.id,
                      label: this.translateText("opPage.textMap.", item.label)
                    }
                  }
                );
              })
            ])]
            )
          ]
        );
      } else {
        return h("span", {
            style: {
              fontSize: '14px',
              color: this.mycolor,
            },
          }, node.label
        );
      }
    }
  }
}
