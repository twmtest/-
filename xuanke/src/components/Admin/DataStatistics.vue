<template>
  <div class="data-statistics">
    <h2>数据统计</h2>
    <div ref="chart" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { getStatistics } from '@/services/api';

const chart = ref(null);

const initChart = async () => {
  const chartInstance = echarts.init(chart.value);

  try {
    const stats = await getStatistics();

    const option = {
      title: {
        text: '系统数据统计',
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['数量'],
        top: '10%',
        textStyle: {
          color: '#333',
        },
      },
      xAxis: {
        type: 'category',
        data: ['课程', '学生', '教师', '管理员'],
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          color: '#333',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        axisLabel: {
          color: '#333',
        },
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: [stats.courses, stats.students, stats.teachers, stats.admins],
          itemStyle: {
            color: '#74b9ff',
          },
          barWidth: '50%',
        },
      ],
    };

    chartInstance.setOption(option);
  } catch (error) {
    console.error('获取统计数据失败:', error.message);
  }
};

onMounted(() => {
  initChart();
});
</script>

<style scoped>
.data-statistics {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.chart {
  width: 100%;
  height: 400px;
}
</style> 