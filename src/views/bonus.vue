<template>
  <div class="bonus_wrapper"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";

export default defineComponent({
  data() {
    return {};
  },
  computed: {
    // 用户信息
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
});
</script>
<style lang="scss" scoped>
.bonus_wrapper {
  padding: 16px 8px;
}
</style>