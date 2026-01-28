<template>
  <v-card class="mx-auto" style="width: 100%">
    <v-card-text>
      <div>
        <v-icon>{{ chartData.icon }}</v-icon
        >{{ chartData.title }}
      </div>
    </v-card-text>
    <v-card-text>
      <v-row>
        <v-col v-for="square in chartData.dataSquares" :key="square.title">
          <dataSquare :square="square" :desc="descFile" />
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="chartData.queryTypeChartData">
          <doughnutChart
            :labels="chartData.queryTypeChartData.labels"
            :datasets="chartData.queryTypeChartData.datasets"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="chartData.queryResponseChartData">
          <doughnutChart
            :labels="chartData.queryResponseChartData.labels"
            :datasets="chartData.queryResponseChartData.datasets"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import dataSquare from "@/components/dashboard/dataSquare.vue";
import doughnutChart from "@/components/dashboard/doughnutChart.vue";
import descFileImport from "@/assets/json/queriesSquareDesc.json";
export default {
  name: "datachartData",
  components: {
    dataSquare,
    doughnutChart,
  },
  props: {
    chartData: Object,
  },
  data() {
    return {
      descFile: descFileImport,
    };
  },
};
</script>
