<template>
  <div class="provably_fair_wrapper">
    <div class="provably_fair_title">PROVABLY FAIR</div>
    <v-img
      class="logo_img"
      :width="100"
      cover
      src="@/assets/images/svg/provably-fair-logo.svg"
    ></v-img>
    <div class="description_item">
      <div class="description_item_title">What does it mean?</div>
      <div class="description_item_text">
        All prices for the 24-hour round have been predetermined using a
        randomly drawn seed that is revealed at the end of each trading round.
        Using this published seed, anyone can verify that we followed the
        algorithm described below and that we did not alter any prices after the
        round's trading began. In particular, it is not possible for us to
        change prices based on the orders placed by users.
      </div>
    </div>
    <div class="description_item">
      <div class="description_item_title">ROLLERCOASTER</div>
      <div class="description_item_tabel">
        <div class="description_item_tabel_head">
          <div>DATE/TIME</div>
          <div>TICKS</div>
          <div>SEED</div>
        </div>
        <div
          class="description_item_tabel_item"
          v-for="item in seedList"
          :key="item.id"
        >
          <div>{{ item.createTimeStr }}</div>
          <div>{{ item.id }}</div>
          <div>{{ item.seed }}</div>
        </div>
      </div>
    </div>
    <div class="description_item">
      <div class="description_item_title">ALGORITHM</div>
      <div class="description_item_text">
        At the beginning of a trading round (00:00 UTC), a new 32-byte seed is
        randomly chosen. All prices for the round can be reproduced by combining
        this seed with an integer tick counter incrementing from zero.
      </div>
      <div class="description_item_text">
        The seed is first encoded into a 64-character lowercase hexadecimal
        string and then concatenated with the string representation of the
        current value of the tick counter. A hash of the combined string is then
        calculated using the BLAKE2b hash function with a digest size of 256
        bits. By using a cryptographic hash function, we've ensured that price
        changes are random and unpredictable before the seed has been revealed,
        but after the seed is known, they can be fully reproduced.
      </div>
      <div class="description_item_text">
        The first 8 bytes of the hash are converted to an unsigned 64-bit
        integer assuming a little-endian encoding. This integer value is
        converted to a floating point number in the unit range, which will be
        uniformaly distributed. Using the inverse cumulative distribution
        function with the market's configured tick volatility (0.1%) as its
        standard deviation, we then convert the floating point value to a
        normally distributed return and use that to update the market's price.
      </div>
    </div>
    <div class="description_item">
      <div class="description_item_title">VERIFICATION EXAMPLE</div>
      <div class="description_item_text">
        Anyone can verify the prices from a trading round after the seed has
        been revealed. As an example, the following python code calculates the
        first 5 prices of a round given its seed:
      </div>
      <div class="description_item_text code_blocks">
        <div>import pyblake2</div>
        <div>import statistics</div>
        <div>price = 1000.0</div>
        <div>
          seed =
          'nqwj556c2qz043jo19g26ii35129pba4afybg486hgz66ffkjov25hdcpuvjg9r6'
        </div>
        <br />
        <div>volatility = 0.001</div>
        <div>print(f'Price at time 0: {price}')</div>
        <div>for tick in range(4):</div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;combined_value = bytes(seed + str(tick),
          encoding='ascii')
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;hash = pyblake2.blake2b(combined_value,
          digest_size=32).digest()
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;unsigned_int = int.from_bytes(hash[:8],
          byteorder='little', signed=False)
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;unit_range_float = float(unsigned_int) /
          float(2**64 - 1)
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;normal_return =
          statistics.NormalDist(mu=0.0,sigma=volatility).inv_cdf(unit_range_float)
        </div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;price = price * (1.0 + normal_return)</div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;print(f'Price at time {tick + 1}:
          {round(price, 2)}')
        </div>
      </div>
      <div class="description_item_text">The output is:</div>
      <div class="description_item_text code_blocks">
        <div>Price at time 0: 1000.0</div>
        <div>Price at time 1: 999.63</div>
        <div>Price at time 2: 1000.11</div>
        <div>Price at time 3: 999.79</div>
        <div>Price at time 4: 1001.23</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getCarSeed } from "@/services/api/order";

interface seedInfo {
  id: number; //TICKS
  createTime: string;
  createTimeStr: string; //DATE/TIME
  seed: string; //SEED
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      seedList: [] as Array<seedInfo>,
    };
  },
  created() {
    this.fetchCarSeed();
  },
  methods: {
    async fetchCarSeed() {
      const res = await getCarSeed({});
      if (res.code == 200) {
        this.seedList = res.data;
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.provably_fair_wrapper {
  padding: 16px 8px;

  .activity_item + .activity_item {
    margin-top: 40px;
  }
}

.provably_fair_title {
  font-weight: 700;
  font-style: normal;
  font-size: 18px;
  color: #ffffff;
  text-align: center;
}

.logo_img {
  margin: 0 auto;
  margin-top: 8px;
}

.description_item {
  margin-top: 12px;

  .description_item_title {
    color: white;
    text-align: left;
    font-size: 16px;
    font-weight: 700;
    padding-bottom: 4px;
  }

  .description_item_text {
    font-weight: 700;
    font-style: normal;
    font-size: 12px;
    line-height: 1.2;
    color: #b0b5c5;

    &.code_blocks {
      padding: 8px;
      background-color: #141620;

      & > div {
        word-break: break-all;
      }
    }
  }

  .description_item_text + .description_item_text {
    margin-top: 8px;
  }
}

.description_item_tabel {
  .description_item_tabel_head,
  .description_item_tabel_item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #303545;

    & > div {
      flex: 1;
      font-size: 14px;
      line-height: 1;
      padding: 8px 0;
      font-weight: 700;
      font-style: normal;
      color: #b0b5c5;
      text-align: center;
    }

    & > div:last-child {
      min-width: 54%;
    }
  }

  .description_item_tabel_item {
    background-color: transparent;
    border-bottom: 1px solid #303545;
    box-sizing: border-box;

    & > div {
      height: 50px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.1;
      padding: 4px;
      border-left: 1px solid #303545;
      box-sizing: border-box;
      word-break: break-all;
    }

    & > div:last-child {
      border-right: 1px solid #303545;
      box-sizing: border-box;
    }
  }
}
</style>