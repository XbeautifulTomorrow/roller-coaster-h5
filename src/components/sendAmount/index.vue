<template>
  <v-dialog v-model="showSend" width="auto">
    <div class="dialog_box">
      <div class="dialog_title">
        <span v-if="isFriend">{{ `TIP ${userName}` }}</span>
        <span v-else>TIP A FRIEND</span>
      </div>
      <div class="enter_panel">
        <div class="enter_item" v-if="!isFriend">
          <div class="enter_title">ID</div>
          <div class="enter_input">
            <div class="input_box">
              <v-text-field
                v-model="userId"
                base-color="#fff"
                placeholder="Enter your friend's ID"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
              ></v-text-field>
            </div>
            <div class="user_other">
              <div class="other" v-if="userData && !isUserError">
                <div class="user_level">
                  <v-img
                    :width="16"
                    :src="levelImages[userData.level as keyof typeof levelImages]"
                  ></v-img>
                </div>
                <div>{{ `${userData.firstName} ${userData.lastName}` }}</div>
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
                src="@/assets/images/game/icon_usdt.png"
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
            </div>
            <div v-if="isAmountError" class="error_box">
              USDT is not enough.
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
          :disabled="!userId || !userName || !amount || isAmountError"
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
import { searchByTgId, transferSendTip } from "@/services/api/user";
import { useMessageStore } from "@/store/message.js";

export default defineComponent({
  data() {
    return {
      isFriend: false,
      userId: null as number | string | any,
      userName: null as string | any,
      amount: null as string | any,
      userData: null as any,
      isUserError: false,
      isAmountError: false,
      timer: null as number | any,
    };
  },
  computed: {
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    sendUser() {
      const { sendUser } = useUserStore();
      return sendUser;
    },
    sendUserId() {
      const { sendUserId } = useUserStore();
      return sendUserId;
    },
    usdtAmount() {
      const { userInfo } = useUserStore();
      return userInfo.usdtAmount;
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
      const { amount, userName, removeTxt } = this;

      const sendNum = removeTxt(amount);

      const res = await transferSendTip({
        usdtAmount: sendNum, //转账USDT数量
        userName: userName, //用户名
      });

      if (res.code == 200) {
        this.showSend = false;
        const { fetchUserInfo } = useUserStore();
        this.handleClear();
        fetchUserInfo();
        const { setMessageText } = useMessageStore();
        setMessageText("Send successful");
      }
    },
    async handleUserInfo() {
      const { userId } = this;
      const res = await searchByTgId({
        tgId: userId,
      });

      if (res.code == 200) {
        this.userData = res.data;
        if (res.data) {
          this.userName = res.data.userName;
        }
      }
    },

    handleInput(event: any) {
      let {
        target: { _value },
      } = event;

      if (!_value) return;

      // 去除非数字字符
      let value = _value.replace(/[^\d.]/g, "");

      if (
        Number(this.usdtAmount) <= 0 ||
        Number(value) > Number(this.usdtAmount)
      ) {
        this.isAmountError = true;
      } else {
        this.isAmountError = false;
      }

      // 分割整数和小数部分
      let parts = value.split(".");
      // 处理整数部分添加逗号
      // parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // 更新输入框的值
      this.amount = parts[0];
    },

    handleClose() {
      this.showSend = false;
    },
    handleClear() {
      this.userId = null;
      this.isFriend = false;
      this.amount = null;
      this.userName = null;
      this.userData = null;
      const { setSendUserId, setSendUser } = useUserStore();
      setSendUserId(null);
      setSendUser(null);
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event || 0).replace(new RegExp(type, "g"), "");
    },
  },
  watch: {
    sendUserId(newV) {
      if (!newV) return;
      this.userId = newV;
      this.userName = this.sendUser;
      this.isFriend = true;
    },
    userId(newV) {
      if (!newV) return;
      if (this.isFriend) return;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.handleUserInfo();
      }, 300);
    },
    showSend(newA) {
      if (!newA) {
        this.handleClear();
      }
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
      font-weight: bold;

      &::-webkit-input-placeholder {
        /* WebKit, Blink, Edge */
        color: #b0b5c5;
      }
      &:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 */
        color: #b0b5c5;
        opacity: 1;
      }
      &::-moz-placeholder {
        /* Mozilla Firefox 19+ */
        color: #b0b5c5;
        opacity: 1;
      }
      &:-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        color: #b0b5c5;
      }
      &::-ms-input-placeholder {
        /* Microsoft Edge */
        color: #b0b5c5;
      }

      &::placeholder {
        /* Most modern browsers support this now. */
        color: #b0b5c5;
      }
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
    bottom: 2px;
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
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;

  .v-img {
    flex: none;
  }
}
</style>