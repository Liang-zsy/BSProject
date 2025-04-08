import Vue from 'vue';

class Bus {
    constructor() {
        if (!Bus.instance) {
            Bus.instance = this;
            Bus.bus = new Vue();
        }
        return Bus.instance;
    }
    getBus() {
        return Bus.bus;
    }
}

export const bus = new Bus().getBus();

