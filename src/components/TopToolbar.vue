<template>
  <div>
    <v-app-bar elevation="2" style="padding: 0 8px;" app fixed dark color="#1f212e" density="compact">
      <template v-slot:prepend>
        <div class="energy_box">
          <v-img :width="24" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
          <div class="energy_item">
            <div class="energy_val">{{ Number(userInfo?.rcpAmount || 0).toLocaleString() }}</div>
            <div class="plus_btn">
              <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
            </div>
          </div>
        </div>
        <div class="energy_box">
          <v-icon color="#FFF100" :size="24" icon="mdi-lightning-bolt"></v-icon>
          <div class="energy_item">
            <div class="energy_val">{{ userInfo.rctAmount }}</div>
            <div class="plus_btn">
              <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:append>

        <v-avatar v-if="userInfo.avatar" size="32" :image="userInfo.avatar"></v-avatar>
        <img v-else width="32" height="32" :avatar="userInfo.userName || 'avatar'" color="#3D3D3D" class="avatar">
      </template>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { useCheckInStore } from "@/store/check_in.js";
import { getUserInfo } from "@/services/api/user";

export default defineComponent({
  data() {
    return {
      title: "GMCoin",
      showMenu: false,
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
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {
    getUserInfo: getUserInfo,
    toMain() {
      const checkInStore = useCheckInStore();
      checkInStore.setChallengeId(null);
      this.$router.push('/activity');
    },
    toFrens() {
      // this.$router.push('/frens');
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
    toEarn() {
      // this.$router.push('/earn');
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        const userStore = useUserStore();
        userStore.fetchUserInfo();
      }
    },
    "$route.path"() {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
    }
  },
});
</script>
<style lang="scss" scoped>
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
    background: radial-gradient(#ffc81a 0%, #ffe71a 52%, #d9a315 100%);
    border: 1px solid #000;
    border-radius: 4px;
  }
}

.avatar {
  border: 4px solid #FFAD2E;
  border-radius: 50%;
}
</style>