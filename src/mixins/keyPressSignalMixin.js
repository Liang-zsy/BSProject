import { bus } from "@/bus/bus";

/**
 * @description: 用于处理键盘事件并向对应的槽发送信号的mixin
 * 使用方法：
 * 在需要使用的页面中引入该mixin，将keyPressSlotMixin引入至需要接收键盘消息的组件中即可
 */
const keyPressSignalMixin = {
    methods: {
        keyDown(event) {
            bus.$emit('keyDown', event);
        },
        keyUp(event) {
            bus.$emit('keyUp', event);
        }
    },
    mounted() {
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup', this.keyUp);
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.keyDown);
        document.removeEventListener('keyup', this.keyUp);
    },
    activated() {
      document.addEventListener('keydown', this.keyDown);
      document.addEventListener('keyup', this.keyUp);
    },
    deactivated() {
      document.removeEventListener('keydown', this.keyDown);
      document.removeEventListener('keyup', this.keyUp);
    },
}

export default keyPressSignalMixin;
