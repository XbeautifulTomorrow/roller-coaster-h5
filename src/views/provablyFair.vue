<template>
  <div class="provably_fair_wrapper">
    <v-img
      class="logo_img"
      :width="200"
      cover
      src="@/assets/images/svg/provably-fair-logo.svg"
    ></v-img>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {};
  },
  created() {},
  methods: {},
});
</script>
<style lang="scss" scoped>
.activity_wrapper {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .activity_item + .activity_item {
    margin-top: 40px;
  }
}

.logo_img {
}
</style>