<template>
  <v-dialog v-model="showSend" width="auto">
    <div class="dialog_box">
      <div class="dialog_title">AUTO ORDER</div>
      <div class="enter_panel">
        <div class="enter_item" v-if="!isFriend">
          <div class="enter_title">Username</div>
          <div class="enter_input">
            <div class="input_box">
              <div class="input_prefix">@</div>
              <v-text-field
                v-model="userName"
                base-color="#fff"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
              ></v-text-field>
            </div>
            <div class="user_other">
              <div>Name:</div>
              <div class="other" v-if="userData && !isUserError">
                <div class="user_level">
                  <v-img
                    :width="16"
                    :src="levelImages[userInfo.level as keyof typeof levelImages]"
                  ></v-img>
                </div>
                <div>{{ userInfo.userName }}</div>
              </div>
            </div>
            <div v-if="isUserError" class="error_box">User does not exist</div>
          </div>
        </div>
        <div class="enter_item">
          <div class="enter_title">Amount</div>
          <div class="enter_input">
            <div class="input_box">
              <v-img
                :width="20"
                cover
                src="@/assets/images/game/icon_roller.png"
              ></v-img>
              <v-text-field
                v-model="amount"
                base-color="#fff"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                reverse
              ></v-text-field>
              <div class="multiply_btn" @click="handleMultiply()">x100</div>
            </div>
            <div v-if="isAmountError" class="error_box">
              $ROLLER is not enough.
            </div>
          </div>
        </div>
      </div>
      <div class="send_buttons">
        <v-btn
          class="button close"
          @click.stop="handleClose()"
          height="30"
          rounded="lg"
          size="small"
        >
          <span class="finished">Cancel</span>
        </v-btn>
        <v-btn
          class="button swap"
          @click.stop="handleSubmit()"
          height="30"
          rounded="lg"
          size="small"
          :disabled="!userName || !amount || isAmountError"
        >
          <span class="finished">Send TIP</span>
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import bigNumber from "bignumber.js";
import { transferSendTip } from "@/services/api/user";
import { useMessageStore } from "@/store/message.js";

// 等级图标
import Level_1 from "@/assets/images/main/level_1.png";
import Level_2 from "@/assets/images/main/level_2.png";
import Level_3 from "@/assets/images/main/level_3.png";
import Level_4 from "@/assets/images/main/level_4.png";
import Level_5 from "@/assets/images/main/level_5.png";
import Level_6 from "@/assets/images/main/level_6.png";
import Level_7 from "@/assets/images/main/level_7.png";
import Level_8 from "@/assets/images/main/level_8.png";
import Level_9 from "@/assets/images/main/level_9.png";
import Level_10 from "@/assets/images/main/level_10.png";
import Level_11 from "@/assets/images/main/level_11.png";
import Level_12 from "@/assets/images/main/level_12.png";
import Level_13 from "@/assets/images/main/level_13.png";
import Level_14 from "@/assets/images/main/level_14.png";
import Level_15 from "@/assets/images/main/level_15.png";
import Level_16 from "@/assets/images/main/level_16.png";
import Level_17 from "@/assets/images/main/level_17.png";
import Level_18 from "@/assets/images/main/level_18.png";
import Level_19 from "@/assets/images/main/level_19.png";
import Level_20 from "@/assets/images/main/level_20.png";
import Level_21 from "@/assets/images/main/level_21.png";
import Level_22 from "@/assets/images/main/level_22.png";
import Level_23 from "@/assets/images/main/level_23.png";
import Level_24 from "@/assets/images/main/level_24.png";
import Level_25 from "@/assets/images/main/level_25.png";
import Level_26 from "@/assets/images/main/level_26.png";
import Level_27 from "@/assets/images/main/level_27.png";

export default defineComponent({
  data() {
    return {
      isFriend: false,
      userName: null as string | any,
      amount: null as number | any,
      userData: null as any,
      isUserError: false,
      isAmountError: false,
      levelImages: {
        1: Level_1,
        2: Level_2,
        3: Level_3,
        4: Level_4,
        5: Level_5,
        6: Level_6,
        7: Level_7,
        8: Level_8,
        9: Level_9,
        10: Level_10,
        11: Level_11,
        12: Level_12,
        13: Level_13,
        14: Level_14,
        15: Level_15,
        16: Level_16,
        17: Level_17,
        18: Level_18,
        19: Level_19,
        20: Level_20,
        21: Level_21,
        22: Level_22,
        23: Level_23,
        24: Level_24,
        25: Level_25,
        26: Level_26,
        27: Level_27,
      },
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    sendUser() {
      const { sendUser } = useUserStore();
      return sendUser;
    },
    rctAmount() {
      const { userInfo } = useUserStore();
      return userInfo.rctAmount;
    },
    showSend: {
      get() {
        const { showSend } = useUserStore();
        return showSend;
      },
      set(val: boolean) {
        const { setShowSend } = useUserStore();

        setShowSend(val);
      },
    },
  },
  methods: {
    async handleSubmit() {
      const res = await transferSendTip({
        rctAmount: this.amount, //转账RCT数量
        userName: this.userName, //用户名
      });

      if (res.code == 200) {
        this.showSend = false;
        this.isFriend = false;
        this.amount = null;
        this.userName = null;
        const { fetchUserInfo, setSendUser } = useUserStore();
        setSendUser(null);
        fetchUserInfo();
        const { setMessageText } = useMessageStore();
        setMessageText("Send successful");
      }
    },
    handleMultiply() {
      if (!this.amount) return;
      this.amount = new bigNumber(this.amount).multipliedBy(100).toNumber();
    },
    handleInput(val: any) {
      if (!this.amount) return;

      if (
        Number(this.rctAmount) <= 0 ||
        Number(this.amount) > Number(this.rctAmount)
      ) {
        this.isAmountError = true;
      } else {
        this.isAmountError = false;
      }

      // 去除非数字字符
      let value = String(this.amount).replace(/[^\d.]/g, "");

      // 更新输入框的值
      this.amount = Math.floor(Number(value));
    },
    handleClose() {
      this.showSend = false;
    },
  },
  watch: {
    sendUser(newV) {
      if (!newV) return;
      this.userName = newV;
      this.isFriend = true;
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
}

.dialog_box {
  border-radius: 8px;
  padding: 16px;
  color: #fff;
  font-size: 20px;
  line-height: 1.2;
  background-color: #1f212e;

  .dialog_title {
    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #fff;
  }
}

.enter_panel {
  padding-top: 8px;
}

.enter_item {
  width: 240px;

  .enter_title {
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    color: #b0b5c5;
    padding-bottom: 4px;
  }
}

.enter_input {
  padding-bottom: 24px;
  font-weight: 700;
  font-style: normal;
  font-size: 14px;
  color: #fff;
  position: relative;

  .input_box {
    display: flex;
    align-items: center;
    border: 1px solid #fbc819;
    line-height: 1;
    padding: 4px;
    border-radius: 4px;
    box-shadow: 0px 0px 5px rgba(247, 171, 9, 0.8);

    .input_prefix {
      padding-right: 8px;
    }

    .v-img {
      flex: none;
    }

    :deep(.v-field__input) {
      padding: 0;
      min-height: 0;
      line-height: 1.2;
    }

    .multiply_btn {
      background-color: #2a2f40;
      border-radius: 4px;
      line-height: 1;
      padding: 4px 8px;
      color: #b0b5c5;
      margin-left: 8px;
    }
  }

  .user_other {
    position: absolute;
    bottom: 8px;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #b0b5c5;

    .other {
      display: flex;
      align-items: center;
      color: #fff;

      .v-img {
        flex: none;
        margin: 0 4px;
      }
    }
  }

  .error_box {
    position: absolute;
    bottom: 4px;
    font-size: 12px;
    color: #ff0000;
  }
}

.send_buttons {
  display: flex;
  align-items: center;
  .button {
    text-align: center;
    font-weight: bold;
    font-style: normal;
    font-size: 12px;
    line-height: 1;
    border-radius: 4px;

    &.swap {
      background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
      color: #000;
    }

    &.close {
      background-color: rgba(36, 41, 54, 1);
      color: #b0b5c5;
      margin-right: 4px;
    }
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}

.user_level {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;

  .v-img {
    flex: none;
  }
}
</style>