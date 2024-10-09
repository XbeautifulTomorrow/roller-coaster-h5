<template>
  <v-dialog v-model="showManual" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="recharge_title">DEPOSIT</div>
        <div class="close_btn" @click="showManual = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="canvas_box">
          <canvas ref="canvas" style="border-radius: 8px"></canvas>
        </div>
        <div class="order_item">
          <div class="item_title">Deposit Address</div>
          <div
            class="item_info"
            @click="onCopy(formatAddr(manualInfo.publicKey))"
          >
            <div class="item_val">
              {{ handleOmitted(formatAddr(manualInfo.publicKey)) }}
            </div>
            <div class="item_copy">
              <v-img
                :width="20"
                cover
                src="@/assets/images/svg/copy_btn.svg"
              ></v-img>
            </div>
          </div>
        </div>
        <div class="order_item">
          <div class="item_title">TONMEMO</div>
          <div class="item_info" @click="onCopy(manualInfo.remark)">
            <div class="item_val">{{ manualInfo.remark }}</div>
            <div class="item_copy">
              <v-img
                :width="20"
                cover
                src="@/assets/images/svg/copy_btn.svg"
              ></v-img>
            </div>
          </div>
        </div>
        <div class="buy_info">
          <span>Send </span>
          <span style="color: #49b6f6; font-weight: bold">
            {{ `${manualInfo.tonAmount} TON ` }}
          </span>
          <span>or </span>
          <span style="color: #26a17b; font-weight: bold">
            {{ `${manualInfo.usdtAmount} USDT ` }}
          </span>
          <span>to this deposit address.</span>
        </div>
        <div class="buy_hint">
          <span>Please make sure that the </span>
          <span style="font-weight: bold; color: #e2b03e">ADDRESS </span>
          <span>as well as the </span>
          <span style="font-weight: bold; color: #e2b03e">TONMEMO </span>
          <span>
            are filled in correctly, otherwise you will lose the transferred
            tokens
          </span>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import QRCode from "qrcode";
import { useUserStore } from "@/store/user.js";
import { Address } from "@ton/ton";
import { onCopy } from "@/utils";

export default defineComponent({
  data() {
    return {};
  },
  computed: {
    showManual: {
      get() {
        const { showManual } = useUserStore();
        return showManual;
      },
      set(val: boolean) {
        const { setShowManual } = useUserStore();
        setShowManual(val);
      },
    },
    manualInfo() {
      const { manualInfo } = useUserStore();
      return manualInfo;
    },
  },
  methods: {
    onCopy: onCopy,
    handleReady() {
      this.showManual = false;
    },
    // 格式化地址
    formatAddr(event: string) {
      if (!event) return event;
      const addr = Address.parse(event).toString({
        bounceable: false,
      });

      return addr;
    },
    // 处理省略
    handleOmitted(event: any) {
      var reg = /^(\S{16})\S+(\S{6})$/;
      return event.replace(reg, "$1......$2");
    },
  },
  mounted() {
    this.$nextTick(() => {
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      QRCode.toCanvas(
        canvas,
        this.formatAddr(this.manualInfo.publicKey),
        { margin: 2, width: 200, errorCorrectionLevel: "H" },
        (error: any) => {
          if (error) console.error(error);
        }
      );
    });
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  max-width: max-content !important;
}

.dialog_box {
  width: 100vw;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;
}

.recharge_title {
  width: 60%;
  color: #fdefd6;
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(
    180deg,
    rgba(210, 70, 49, 1) -3%,
    rgba(212, 72, 52, 1) 100%
  );
  padding: 8px 24px;
  border-radius: 24px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  margin: 0 auto;
  margin-top: -30px;
}

.close_btn {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background: linear-gradient(180deg, #f0d3b3 0%, #f2d0ac 100%);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10px;
  right: 24px;

  .v-img {
    flex: none;
  }
}

.recharge_panel {
  width: 100%;
  min-height: 460px;
  margin-top: -16px;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  background-color: rgba(66, 20, 79, 1);
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 1);
  border-radius: 20px;
  padding: 16px;
}

.canvas_box {
  margin: 16px 0;
}

.order_item + .order_item {
  margin-top: 12px;
}

.order_item {
  .item_title {
    font-size: 16px;
    text-align: left;
    font-weight: 700;
    font-style: normal;
    color: #ffffff;
  }

  .item_info {
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgba(34, 34, 34, 0.45);
    border-width: 2px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 1);
    border-radius: 10px;
    padding: 12px 8px;
    cursor: pointer;
  }

  .item_val {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 10px;
  }
}

.buy_info {
  padding: 12px 0;
  box-shadow: none;
  font-size: 16px;
  color: #dfdfdf;
}

.buy_hint {
  font-size: 14px;
  color: #e7b95a;
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}
</style>