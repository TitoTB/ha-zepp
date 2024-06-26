// import { getScrollListDataConfig } from '../../utils'
import {t, extendLocale} from "../../lib/i18n";
import { DEVICE_HEIGHT, DEVICE_WIDTH, TOP_BOTTOM_OFFSET } from "./index.style";

const {
  messageBuilder,
  FS_REF_SENSORS_UPDATE_ALARM_ID,
  FS_REF_SENSORS_UPDATE_STATE,
  FS_REF_SENSORS_UPDATE_TIMESTAMP,
} = getApp()._options.globalData;

const logger = DeviceRuntimeCore.HmLogger.getLogger("ha-zepp-main");

Page({
  state: {
    scrollList: null,
    dataList: [],
    widgets: [],
    rendered: false,
    sensorsUpdateState: false,
    y: TOP_BOTTOM_OFFSET,
  },
  build() {
    logger.debug("page build invoked");
    this.drawWait();

    if (hmBle.connectStatus() === true) {
      this.state.sensorsUpdateState = hmFS.SysProGetBool(FS_REF_SENSORS_UPDATE_STATE);
      this.state.sensorsUpdateState = this.state.sensorsUpdateState == undefined ? false : this.state.sensorsUpdateState;
      messageBuilder
        .request({ method: "GET_UPDATE_SENSORS_STATE" })
        .then(({ result }) => {
          this.toggleSensorUpdates((turnOn = result), (isOn = this.state.sensorsUpdateState));
          this.getEntityList();
        });
    } else {
      this.drawNoBLEConnect();
    }
    hmUI.setLayerScrolling(true);
  },
  toggleSensorUpdates(turnOn, isOn) {
    if (turnOn === true && isOn === false) {
      //start sensor updates to HA
      hmFS.SysProSetBool(FS_REF_SENSORS_UPDATE_STATE, true);
      hmApp.gotoPage({
        file: "page/sensors_update/index.page",
        param: FS_REF_SENSORS_UPDATE_ALARM_ID,
      });
    } else if (turnOn === false && isOn === true) {
      // stop sensor updates to HA
      this.drawTextMessage("Turning sensor updates off..\nApp closing");
      hmFS.SysProSetBool(FS_REF_SENSORS_UPDATE_STATE, false);
      const existingAlarm = hmFS.SysProGetInt64(FS_REF_SENSORS_UPDATE_ALARM_ID);
      if (existingAlarm) {
        hmApp.alarmCancel(existingAlarm);
      }
      hmApp.gotoHome();
    }
  },
  getEntityList() {
    messageBuilder
      .request({ method: "GET_ENTITY_LIST" })
      .then(({ result, error }) => {
        if (error) {
          this.drawError(error);
          return;
        }
        this.state.dataList = result;
        this.createAndUpdateList();
      })
      .catch((res) => {
        this.drawError();
        console.log(res);
      });
  },
  toggleSwitchable(item, value) {
    messageBuilder.request({
      method: "TOGGLE_SWITCH",
      entity_id: item.key,
      value,
      service: item.type,
    });
  },
  clearWidgets() {
    this.state.widgets.forEach((widget, index) => {
      hmUI.deleteWidget(widget);
    });
    this.state.widgets = [];
    this.state.y = TOP_BOTTOM_OFFSET; // start from this y to skip rounded border
    if (typeof hmUI.redraw === 'function') {
      hmUI.redraw();
    } else {
      logger.debug("Zepp OS 1 not supported redraw function.");
    }
  },
  createWidget(...args) {
    const widget = hmUI.createWidget(...args);
    this.state.widgets.push(widget);
    return widget;
  },
  createButton() {
      const iconsize = 100;
      const titleHeight = 35;
      const valueHeight = 15;
      const entitiesGap = 5;
      const totalHeight = iconsize + valueHeight + entitiesGap + titleHeight;
      this.createWidget(hmUI.widget.TEXT, {
          x: 0,
          y: this.state.y,
          w: DEVICE_WIDTH,
          h: titleHeight,
          text: t("devices"),
          text_size: 25,
          color: 0xFFFFFF,
          align_h: hmUI.align.CENTER_H,
      });
      const device_button = this.createWidget(hmUI.widget.IMG, {
          x: DEVICE_WIDTH / 2 - 50,
          y: this.state.y + titleHeight,
          src: "devices.png",
          text: t("devices"),
          align_h: hmUI.align.CENTER_H,
      });
      device_button.addEventListener(hmUI.event.CLICK_UP, () => {
          hmApp.gotoPage({ file: "page/devices/index.page", });
      });
      this.state.y += totalHeight;
  },
  createButton2() {
      const iconsize = 100;
      const titleHeight = 35;
      const valueHeight = 15;
      const entitiesGap = 5;
      const totalHeight = iconsize + valueHeight + entitiesGap + titleHeight;
      this.createWidget(hmUI.widget.TEXT, {
          x: 0,
          y: this.state.y,
          w: DEVICE_WIDTH,
          h: titleHeight,
          text: t("scripts"),
          text_size: 25,
          color: 0xFFFFFF,
          align_h: hmUI.align.CENTER_H,
      });
      const device_button = this.createWidget(hmUI.widget.IMG, {
          x: DEVICE_WIDTH / 2 - 50,
          y: this.state.y + titleHeight,
          src: "scripts.png",
          text: t("scripts"),
          align_h: hmUI.align.CENTER_H,
      });
      device_button.addEventListener(hmUI.event.CLICK_UP, () => {
          hmApp.gotoPage({ file: "page/scripts/index.page", });
      });
      this.state.y += totalHeight;
  },
  createButton3() {
      const iconsize = 100;
      const titleHeight = 35;
      const valueHeight = 15;
      const entitiesGap = 5;
      const totalHeight = iconsize + valueHeight + entitiesGap + titleHeight;
      this.createWidget(hmUI.widget.TEXT, {
          x: 0,
          y: this.state.y,
          w: DEVICE_WIDTH,
          h: titleHeight,
          text: t("sensors"),
          text_size: 25,
          color: 0xFFFFFF,
          align_h: hmUI.align.CENTER_H,
      });
      const device_button = this.createWidget(hmUI.widget.IMG, {
          x: DEVICE_WIDTH / 2 - 50,
          y: this.state.y + titleHeight,
          src: "sensors.png",
          text: t("sensors"),
          align_h: hmUI.align.CENTER_H,
      });
      device_button.addEventListener(hmUI.event.CLICK_UP, () => {
          hmApp.gotoPage({ file: "page/sensors/index.page", });
      });
      this.state.y += totalHeight;
  },
  createEntity(item) {
    const titleHeight = 32;
    const valueHeight = 32;
    const entitiesGap = 10;
    const totalHeight = titleHeight + valueHeight + entitiesGap;
    this.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: this.state.y,
      w: DEVICE_WIDTH,
      h: titleHeight,
      text: item.title,
      text_size: 17,
      color: 0xaaaaaa,
      align_h: hmUI.align.CENTER_H,
    });
    this.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: this.state.y + titleHeight,
      w: DEVICE_WIDTH,
      h: valueHeight,
      text: item.state,
      text_size: 16,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    });

    if ((item.type === "light") | (item.type === "media_player")) {
      const iconsize = 24;
      const details_button = this.createWidget(hmUI.widget.IMG, {
        x: DEVICE_WIDTH - iconsize - 5,
        y: this.state.y + titleHeight + valueHeight / 2 - iconsize / 2,
        src: "forward24.png",
      });
      details_button.addEventListener(hmUI.event.CLICK_UP, (info) => {
        hmApp.gotoPage({
          file: `page/${item.type}/index.page`,
          param: JSON.stringify(item),
        });
      });
    }
    this.state.y += totalHeight;
  },
  createSwitchable(item) {
    const titleHeight = 32;
    const valueHeight = 48;
    const entitiesGap = 10;
    const totalHeight = titleHeight + valueHeight + entitiesGap;
    const sliderWidth = 76
    this.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: this.state.y,
      w: DEVICE_WIDTH,
      h: titleHeight,
      text: item.title,
      text_size: 17,
      color: 0xaaaaaa,
      align_h: hmUI.align.CENTER_H,
    });
    this.createWidget(hmUI.widget.SLIDE_SWITCH, {
      x: DEVICE_WIDTH / 2 - sliderWidth / 2,
      y: this.state.y + titleHeight,
      w: sliderWidth,
      h: valueHeight,
      select_bg: "switch_on.png",
      un_select_bg: "switch_off.png",
      slide_src: "radio_select.png",
      slide_select_x: 32,
      slide_un_select_x: 8,
      checked: item.state === "on" ? true : false,
      checked_change_func: (slideSwitch, checked) => {
        if (!this.state.rendered) return;
        this.toggleSwitchable(item, checked);
      },
    });

    if ((item.type === "light") | (item.type === "media_player")) {
      const iconsize = 24;
      const details_button = this.createWidget(hmUI.widget.IMG, {
        x: DEVICE_WIDTH - iconsize - 5,
        y: this.state.y + titleHeight + valueHeight / 2 - iconsize / 2,
        src: "forward24.png",
      });
      details_button.addEventListener(hmUI.event.CLICK_UP, (info) => {
        hmApp.gotoPage({
          file: `page/${item.type}/index.page`,
          param: JSON.stringify(item),
        });
      });
    }
    this.state.y += totalHeight;
  },
  createExecutable(item) {
    const titleHeight = 32;
    const valueHeight = 48;
    const entitiesGap = 10;
    const totalHeight = titleHeight + valueHeight + entitiesGap;
    this.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: this.state.y,
      w: DEVICE_WIDTH,
      h: titleHeight,
      text: item.title,
      text_size: 17,
      color: 0xaaaaaa,
      align_h: hmUI.align.CENTER_H,
    });
    this.createWidget(hmUI.widget.BUTTON, {
      x: DEVICE_WIDTH / 4,
      y: this.state.y + titleHeight,
      w: DEVICE_WIDTH / 2,
      h: valueHeight,
      text: item.state === "on" ? t("Cancel") : t("Run"),
      normal_color: 0x18bcf2,
      press_color: 0x61cef2,
      radius: 20,
      click_func: (button) => {
        messageBuilder.request({
          method: "PRESS_BUTTON",
          entity_id: item.key,
          service: item.type,
          current_state: item.state,
        });
      },
    });
    this.state.y += totalHeight;
  },
  createElement(item) {
    if (item === "end") {
      return this.createWidget(hmUI.widget.BUTTON, {
        x: 0,
        y: this.state.y,
        w: DEVICE_WIDTH,
        h: TOP_BOTTOM_OFFSET,
        text: this.state.sensorsUpdateState ? `Last sync: ${hmFS.SysProGetChars(FS_REF_SENSORS_UPDATE_TIMESTAMP)}` : '',
        text_size: 12,
        click_func: () => {
          hmApp.gotoPage({ file: "page/sensors_update/index.page" });
        },
      });
    }
    if (typeof item !== "object" || typeof item.type !== "string") return;
    if (
      ["light", "switch", "input_boolean", "automation"].includes(item.type) &&
      item.state !== "unavailable"
    ) {
      return this.createSwitchable(item);
    }
    if (item.type === "script" && item.state !== "unavailable") {
      return this.createExecutable(item);
    }
    return this.createEntity(item);
  },
  createAndUpdateList() {
    this.clearWidgets();
    this.state.rendered = false;
    this.createButton();
    this.createButton2();
    this.createButton3();
    this.createElement("end");
    this.state.rendered = true;
  },
  drawTextMessage(message, button) {
    this.clearWidgets();
    this.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
      text: message,
      text_size: 18,
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
    if (button) {
      const buttonParams = {};
      if (button.buttonColor) {
        buttonParams.normal_color = button.buttonColor;
      }
      if (button.buttonPressedColor) {
        buttonParams.press_color = button.buttonPressedColor;
      }
      if (button.textColor) {
        buttonParams.text_color = button.textColor;
      }
      if (typeof button.onClick === "function") {
        buttonParams.click_func = button.onClick;
      }
      this.createWidget(hmUI.widget.BUTTON, {
        x: DEVICE_WIDTH / 2 - 50,
        y: DEVICE_HEIGHT - TOP_BOTTOM_OFFSET * 3,
        text: button.text,
        w: 100,
        h: 50,
        radius: 4,
        normal_color: 0x333333,
        press_color: 0x444444,
        ...buttonParams,
      });
    }
    return;
  },
  drawNoBLEConnect() {
    return this.drawTextMessage(t("No connection to\n the application"));
  },
  drawWait() {
    //this.drawTextMessage(t("Loading..."));
    return this.createWidget(hmUI.widget.IMG_ANIM, {
      anim_path: 'loading',
      anim_prefix: 'loading',
      anim_ext: 'png',
      anim_fps: 30,
      anim_size: 60,
      repeat_count: 0,
      anim_status: hmUI.anim_status.START,
      x: DEVICE_WIDTH / 2 - 150/2,
      y: DEVICE_HEIGHT / 2 - 150/2,
    });
  },
  drawError(message) {
    let text = t("An error occurred");
    if (typeof message === "string") {
      text += ":\n";
      text += message;
    }
    return this.drawTextMessage(text);
  },
  onAppMessage({ payload: buf }) {
    const data = messageBuilder.buf2Json(buf);
    if (data.action === "listUpdate") {
      this.state.dataList = data.value;
      this.createAndUpdateList();
    }
  },
  onInit() {
    logger.debug("page onInit invoked");
    messageBuilder.on("call", this.onAppMessage);
    //hmApp.setScreenKeep(true);
  },

  onDestroy() {
    hmUI.setStatusBarVisible(false);
    messageBuilder.off("call", this.onAppMessage);
    logger.debug("page onDestroy invoked");
  },
});
