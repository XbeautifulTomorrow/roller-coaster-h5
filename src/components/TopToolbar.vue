<template>
  <div>
    <v-app-bar
      elevation="2"
      style="padding: 0 8px"
      app
      fixed
      dark
      color="#1f212e"
      density="compact"
    >
      <template v-slot:prepend>
        <div class="back" v-if="!isTab" @click="goBack()">
          <v-img :width="30" cover src="@/assets/images/svg/back.svg"></v-img>
        </div>
        <div class="energy_box">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <div class="energy_item rcp">
            <div class="energy_val">
              {{ Number(userInfo?.rcpAmount || 0).toLocaleString() }}
            </div>
            <div class="plus_btn" @click="toRecharge()">
              <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
            </div>
          </div>
        </div>
        <div class="energy_box">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_roller.png"
          ></v-img>
          <div class="energy_item rct">
            <div class="energy_val">
              {{ Number(userInfo?.rctAmount || 0).toLocaleString() }}
            </div>
            <div class="plus_btn" @click="toSwap()">
              <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:append>
        <div class="user_info">
          <div class="user_level">
            <v-img
              :width="24"
              :src="levelImages[userInfo.level as keyof typeof levelImages]"
            ></v-img>
          </div>
          <div class="user_name">{{ userInfo.userName }}</div>
        </div>
      </template>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getUserInfo } from "@/services/api/user";

export default defineComponent({
  data() {
    return {
      showMenu: false,
      isTab: true,
      NavList: ["/", "/earn", "/frens", "/wallet"],
    };
  },
  created() {
    if (this.isLogin) {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
    }
  },
  computed: {
    isLogin() {
      const { isLogin } = useUserStore();
      return isLogin;
    },
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {
    getUserInfo: getUserInfo,

    goBack() {
      this.$router.go(-1); // 返回上一页
    },
    toMain() {
      this.$router.push("/activity");
    },
    toRecharge() {
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
    toSwap() {
      this.$router.push("/swap");
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        const userStore = useUserStore();
        userStore.fetchUserInfo();
      }
    },
    "$route.path"(val) {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
      this.isTab = this.NavList.includes(val);
    },
  },
});
</script>
<style lang="scss" scoped>
.back {
  margin-right: 8px;
}

.energy_box {
  display: flex;
  align-items: center;
  background-color: #000;
  border-radius: 30px;
  margin-right: 8px;

  .energy_item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #fff;

    &.rcp {
      min-width: 120px;
    }
    &.rct {
      min-width: 80px;
    }
    .energy_val {
      font-size: 12px;
      font-weight: bold;
      padding: 0 4px;
    }
  }

  .plus_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
    border: 1px solid #000;
    border-radius: 4px;
  }
}

.avatar {
  border: 4px solid #ffad2e;
  border-radius: 50%;
}

.user_info {
  display: flex;
  align-items: center;

  .user_name {
    width: 30px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.user_level {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;

  .v-img {
    flex: none;
  }
}
</style>