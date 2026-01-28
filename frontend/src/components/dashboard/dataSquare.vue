<template>
  <v-card
    class="mx-auto"
    max-width="150"
    min-width="135"
    :loading="squareLoading"
    :height="returnHeight()"
  >
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-card-text v-bind="attrs" v-on="on">
          <div>
            <v-icon style="font-size: 1rem" :color="square.color">{{
              square.icon
            }}</v-icon
            >{{ square.title }}
          </div>

          <p class="text-h5 text--primary">{{ returnValue() }}</p>
          <p v-if="square.detailed">{{ square.percent }}%</p>
        </v-card-text>
      </template>
      <span>Total: {{ square.value }}</span>
      <div>{{ returnDes(square.title) }}</div>
    </v-tooltip>
  </v-card>
</template>

<script>
export default {
  name: "dataSquare",
  props: {
    square: Object,
    squareLoading: Boolean,
    desc: Object,
  },
  methods: {
    returnHeight() {
      if (this.square.tall) return "115px";
      return "80px";
    },
    returnDes(title) {
      if (this.desc) {
        return this.desc[title];
      }
      return;
    },
    returnValue() {
      if (this.square.value > 999999999) {
        return `${Math.round(this.square.value / 1000000) / 10}B`;
      }
      if (this.square.value > 999999) {
        return `${Math.round(this.square.value / 10000) / 10}M`;
      }
      if (this.square.value > 999) {
        return `${Math.round(this.square.value / 100) / 10}K`;
      }
      return this.square.value;
    },
  },
};
</script>
