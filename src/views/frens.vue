<template>
  <div class="frens_wrapper">
    <div class="frens_text">Invite Friends!</div>
    <div class="total_rewards">
      <div class="rewards">
        <div class="amount_box">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <div>
            {{ Number(Math.floor(userInfo?.totalRcpAmount)).toLocaleString() }}
          </div>
        </div>
        <div class="amount_box">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_usdt.png"
          ></v-img>
          <div>
            {{
              Number(
                accurateDecimal(userInfo?.totalUsdtAmount, 2)
              ).toLocaleString()
            }}
          </div>
        </div>
      </div>
      <div class="invitation_ranking" @click="toRanking()">
        <v-img
          :width="40"
          cover
          src="@/assets/images/svg/earn/invite.svg"
        ></v-img>
        <div>Top 300 Leaders</div>
        <v-icon size="20" icon="mdi-menu-right-outline"></v-icon>
      </div>
    </div>
    <div class="frens_descriptions">
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">
          Share your invitation link to your frens.
        </div>
      </div>
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">
          Your frens join Roll Coaster and start play.
        </div>
      </div>
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">
          You and your frens will receive bonuses.
        </div>
      </div>
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">
          You'll also get an extra 20% from each of your frens' cost.
        </div>
      </div>
    </div>
    <div class="invitation_method">
      <div class="method_item">
        <div class="method_item_img">
          <v-img
            :width="50"
            cover
            src="@/assets/images/frens/invite_prize.png"
          ></v-img>
        </div>
        <div class="method_box">
          <div class="method_text">Invite a Friend</div>
          <div class="method_prize">
            <div class="bonus">
              <v-img
                :width="18"
                cover
                src="@/assets/images/game/icon_rcp.png"
              ></v-img>
              <span>{{ `+ 2,500` }}</span>
            </div>
            <div class="text">for you and your friend</div>
          </div>
        </div>
      </div>
      <div class="method_item">
        <div class="method_item_img">
          <v-img
            :width="48"
            cover
            src="@/assets/images/frens/telegram_premium_prize.png"
          ></v-img>
        </div>
        <div class="method_box">
          <div class="method_text">
            <div>
              <span>Invite a Friend with </span>
              <span style="color: #49b6f6">Telegram Premium</span>
            </div>
          </div>
          <div class="method_prize">
            <div class="bonus">
              <v-img
                :width="18"
                cover
                src="@/assets/images/game/icon_rcp.png"
              ></v-img>
              <span>{{ `+ 10,000` }}</span>
            </div>
            <div class="text">for you and your friend</div>
          </div>
        </div>
      </div>
    </div>
    <div class="frens_list">
      <div class="frens_list_text">{{ `Friend List(${frensTotal})` }}</div>
      <div class="frens_list_content">
        <div
          class="frens_list_item"
          v-for="(item, index) in frensList"
          :key="index"
        >
          <div class="frens_list_item_left">
            <div class="user_level">
              <v-img
                :width="40"
                :src="levelImages[item.level as keyof typeof levelImages]"
              ></v-img>
            </div>
            <div class="frens_list_item_left_box">
              <div :class="['user_name', item.isMember && 'premium']">
                {{ item.userName }}
              </div>
              <div class="user_prize">
                <div class="energy" v-if="item.rcpAmount">
                  <v-img
                    :width="18"
                    cover
                    src="@/assets/images/game/icon_rcp.png"
                  ></v-img>
                  <span>{{ `+ ${formatIncome(item.rcpAmount, 1)}` }}</span>
                </div>
                <div class="bonus" v-if="item.usdtAmount">
                  <v-img
                    :width="18"
                    cover
                    src="@/assets/images/game/icon_usdt.png"
                  ></v-img>
                  <span>{{ `+ ${formatIncome(item.usdtAmount, 2)}` }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="frens_list_item_right">
            <div class="frens_list_item_right_time">
              {{ timeForStr(item.registrationTime, "MM-dd HH:mm:ss") }}
            </div>
            <div class="send_btn" @click="handleSend(item)">
              <v-img
                :width="18"
                cover
                src="@/assets/images/game/icon_usdt.png"
              ></v-img>
              <span>TIP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-btn
      class="invite_btn"
      height="32"
      width="70%"
      @click="inviteToTelegram()"
      rounded="lg"
      size="small"
    >
      <v-img
        :width="24"
        style="margin-right: 4px"
        cover
        src="@/assets/images/svg/frens/linvite_user.svg"
      ></v-img>
      <span style="font-size: 20px; text-transform: capitalize"
        >Invite Friend</span
      >
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getInviteUserList } from "@/services/api/user.js";
import {
  shareOnTelegram,
  timeForStr,
  unitConversion,
  accurateDecimal,
} from "@/utils";

interface frensInfo {
  userId: number; //用户ID
  userName: string; //用户名
  avatar: string; //头像
  level: number; // 等级
  tgId: number; //tgId
  registrationTime: string; //注册时间
  rcpAmount: number; //RCP数量
  usdtAmount: number; //USDT数量
  isMember: boolean; //是否为会员
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      frensTotal: 0,
      frensList: [] as Array<frensInfo>,
      page: 1,
      size: 10,
      finished: false,
      timer: null as any,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
  },
  created() {
    this.fetchInviteUserList();
  },
  methods: {
    timeForStr: timeForStr,
    unitConversion: unitConversion,
    accurateDecimal: accurateDecimal,
    // 获取邀请用户列表
    async fetchInviteUserList(type = 1, isSearch = true) {
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const res = await getInviteUserList({
        page: _page,
        size: this.size,
      });
      if (res.code == 200) {
        this.frensTotal = res.data.total;

        if (res.data.current >= res.data.pages) {
          this.finished = true;
        }

        if (type == 1) {
          this.frensList = res.data.records;
        } else {
          this.frensList.push.apply(this.frensList, res.data.records);
        }

        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    // 加载更多
    nextQuery() {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.page++;
        this.fetchInviteUserList(2, false);
      }, 300);
    },
    // 邀请
    inviteToTelegram() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theRollerCoasterBot/RollerCoaster?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/test1gscbot/test1gsc?startapp=${inviteCode}`;
      }
      shareOnTelegram(inviteUrl);
    },
    handleSend(event: frensInfo) {
      const { setSendUserId, setSendUser, setShowSend } = useUserStore();
      setSendUserId(event.tgId);
      setSendUser(event.userName);
      setShowSend(true);
    },
    // 打开邀请奖励排行榜
    toRanking() {
      this.$router.push({
        path: "/frensRanking",
      });
    },
    // 格式化收益
    formatIncome(income: number, type: number) {
      if (type == 1) {
        if (Math.abs(income || 0) < 1000) {
          return Math.floor(income);
        } else {
          return unitConversion(Math.floor(income) || 0);
        }
      } else {
        if (Math.abs(income || 0) < 1000) {
          return accurateDecimal(income, 2);
        } else {
          return unitConversion(accurateDecimal(income, 2) || 0);
        }
      }
    },
  },
  mounted() {
    const _this = this;
    window.addEventListener("scroll", function () {
      if (
        window.innerHeight + window.scrollY + 10 >=
        document.body.offsetHeight
      ) {
        if (!_this.finished) {
          _this.nextQuery();
        }
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener("scroll", () => {});
  },
});
</script>
<style lang="scss" scoped>
.frens_wrapper {
  padding: 8px;
  box-sizing: border-box;
}

.frens_text {
  font-weight: bold;
  font-size: 24px;
  color: #b0b5c5;
  text-align: center;
}

.total_rewards {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(6, 4, 4, 0.6);
  height: 70px;
  border-radius: 10px;
  padding: 0 8px;
  margin-top: 4px;
}

.rewards {
  min-width: 80px;
  flex: 1 0 36%;
  height: 100%;
  font-weight: bold;
  font-size: 18px;
  color: #fbb11b;
  border-right: 4px solid #fdefd6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  .amount_box {
    display: flex;
    align-items: center;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
  .amount_box + .amount_box {
    margin-top: 4px;
  }
}

.invitation_ranking {
  flex: 1 0 60%;
  font-size: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.frens_descriptions {
  margin-top: 8px;

  .frens_descriptions_text {
    font-size: 14px;
    color: #b0b5c5;
  }
}

.frens_descriptions_item {
  display: flex;

  .dots {
    margin-right: 8px;
    position: relative;

    .line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      height: 100%;
      width: 2px;
      background-color: #b0b5c5;
      z-index: 1;
    }

    .dot_box {
      display: flex;
      align-items: center;
      height: 20px;
      z-index: 2;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ea980a;
      border: 2px solid #b0b5c5;
      z-index: 2;
    }
  }

  .descriptions_text {
    font-size: 14px;
    color: #b0b5c5;
  }
}

.frens_descriptions_item:nth-child(1) {
  .dots {
    margin-right: 8px;
    position: relative;

    .line {
      height: 10px;
      bottom: 0;
    }
  }
}

.frens_descriptions_item:last-child {
  .dots {
    margin-right: 8px;
    position: relative;

    .line {
      height: 10px;
      top: 0;
    }
  }
}

.invitation_method {
  margin-top: 12px;

  .method_item + .method_item {
    margin-top: 8px;
  }
}

.method_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 8px;

  .method_item_img {
    width: 60px;
    height: 60px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .v-img {
      flex: none;
    }
  }

  .method_box {
    .method_text {
      display: flex;
      align-items: center;
      height: 36px;
      font-weight: bold;
      font-size: 16px;
      color: #ffffff;
      line-height: 1;
    }
  }

  .method_prize {
    display: flex;
    align-items: center;
    line-height: 1;

    & > div {
      display: flex;
      align-items: center;
      font-size: 14px;
    }

    & > div + div {
      margin-left: 4px;
    }

    .energy,
    .bonus {
      color: #fbb11b;
      font-weight: bold;

      .dot {
        font-size: 20px;
      }

      .v-img {
        margin-right: 4px;
      }
    }

    .text {
      color: #fff;
    }
  }
}

.frens_list {
  padding-top: 8px;
  padding-bottom: 50px;

  .frens_list_text {
    font-weight: bold;
    font-size: 20px;
    color: #b0b5c5;
  }
}

.frens_list_content {
  height: 400px;

  .frens_list_item + .frens_list_item {
    margin-top: 8px;
  }
}

.frens_list_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
}

.frens_list_item_left {
  display: flex;
  align-items: center;

  & > img,
  & > v-img {
    margin-right: 8px;
    flex: none;
  }

  .user_name {
    font-weight: bold;
    font-size: 16px;
    color: #ffffff;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.premium {
      color: #49b6f6;
    }
  }

  .user_prize {
    display: flex;
    align-items: center;

    & > div + div {
      margin-left: 8px;
    }

    & > div {
      display: flex;
      align-items: center;
      color: #fbb11b;
      font-weight: bold;
      font-size: 14px;

      .v-img {
        margin-right: 4px;
      }
    }
  }
}

.frens_list_item_right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .frens_list_item_right_time {
    font-size: 16px;
    color: #e1e1e1;
  }

  .send_btn {
    background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    padding: 0px 4px;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}

.invite_btn {
  position: fixed;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: 60px;
  z-index: 2000;
  background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
  color: #000;
}

.avatar {
  border: 4px solid #ffad2e;
  border-radius: 50%;
}

.user_level {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;

  .v-img {
    flex: none;
  }
}
</style>