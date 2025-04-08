import { bus } from "@/bus/bus";

/**
 * @description: 用于接收信号的mixin
 * 使用方法：
 * 在需要接收键盘信号的组件中引入该mixin，与keyPressSignalMixin配合使用
 */
const keyPressSlotMixin = {
    data() {
        return {
            currentLineParam: {},
            keydown: false,
        }
    },
    methods: {
        _keyPress(event) {
          if(typeof this.activatedFlag != undefined && this.activatedFlag == false) return
            console.log('keyPressSlotMixin: keyPress()');
            if (event.keyCode === 37) {
                this._arrowLeftPressedHandler();
            } else if (event.keyCode === 39) {
                this._arrowRightPressedHandler();
            }
        },
        _arrowLeftPressedHandler() {
            this._keyPressHandler(true);
        },
        _arrowRightPressedHandler() {
            this._keyPressHandler(false);
        },
        _keyPressHandler(isLeft) {
            // console.log('KeyPressSlotMixin::_keyPressHandler()');
            const offset = isLeft ? -1 : 1;
            if (this.PrimarySecondary.isMark) {
                this._drawLineHelper(this.PrimaryLineParam, offset);
            } else {
                this._drawLineHelper(this.SecondaryLineParam, offset);
            }
        },
        _keyUpHandler() {
            if (this.keydown) {
                this.$emit("chartinfo", this.currentLineParam);
                this.keydown = false;
            }
        },
        _drawLineHelper(lineParam, offset) {
            console.log('lineParam', lineParam);
            const option = this.mychart.getOption();
            let isWave = false
            try {
                if (option.title[0].text.indexOf("波形图") !== -1) {
                    isWave = true
                }
            } catch (e) {
                console.warn(e)
            }
            if (isWave) {
                return;
            }
            if(lineParam){
              this.keydown = true;
            }
            let param = lineParam;
            let xIndex = param.xIndex + offset;
            let newParam = {};
            newParam.name = option.xAxis[0].data[xIndex];
            newParam.xIndex = xIndex
            newParam.seriesNameIndex = param.seriesNameIndex
            newParam.seriesName = option.series[param.seriesNameIndex].name;
            newParam.seriesY = option.series[param.seriesNameIndex].data[xIndex];
            this.currentLineParam = newParam;
            console.log('newParam', newParam);
            this.drawLineAndProLine(newParam.name, newParam.seriesNameIndex, newParam);
        }
    },
    mounted() {
        bus.$on('keyDown', this._keyPress);
        bus.$on('keyUp', this._keyUpHandler);
    },
}

export default keyPressSlotMixin;
