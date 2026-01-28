<template>
  <v-card class="mx-auto" style="width: 100%">
    <v-card-text>
      <div><v-icon>mdi-chart-areaspline</v-icon>All Data</div>
      <LineChartGenerator
        :chart-options="chartOptions"
        :chart-data="chartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import { Line as LineChartGenerator } from "vue-chartjs/legacy";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default {
  name: "LineChart",
  components: {
    LineChartGenerator,
  },
  props: {
    chartId: {
      type: String,
      default: "line-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Array,
      default: () => [],
    },
    allChartData: Object,
  },
  data() {
    return {
      delayed: "",
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        suggestedMin: 0,
        suggestedMax: 6,
        tension: 0.5,
        animation: {
          onComplete: () => {
            this.delayed = true;
          },
          delay: (context) => {
            let delay = 0;
            if (
              context.type === "data" &&
              context.mode === "default" &&
              !this.delayed
            ) {
              delay = context.dataIndex * 10 + context.datasetIndex * 10;
            }
            return delay;
          },
        },
      },
    };
  },
  computed: {
    chartData() {
      return {
        labels: this.allChartData.labels,
        suggestedMin: 0,
        suggestedMax: 6,
        datasets: this.allChartData.datasets,
      };
    },
  },
};
</script>
