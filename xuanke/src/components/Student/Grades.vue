<template>
  <div class="student-grades">
    <h2>成绩查询</h2>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="grades.length === 0" class="empty-grades">
      <el-empty description="暂无成绩数据" />
    </div>
    
    <el-table v-else :data="grades" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="regularScore" label="平时成绩">
        <template #default="{ row }">
          {{ row.regularScore || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="midtermScore" label="期中成绩">
        <template #default="{ row }">
          {{ row.midtermScore || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="finalScore" label="期末成绩">
        <template #default="{ row }">
          {{ row.finalScore || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="totalScore" label="总成绩">
        <template #default="{ row }">
          {{ row.totalScore || '-' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const grades = ref([]);
const loading = ref(true);
const studentId = localStorage.getItem('studentId');

const fetchGrades = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:3000/api/student/${studentId}/grades`);
    grades.value = response.data.map(grade => ({
      ...grade,
      regularScore: grade.regular_score,
      midtermScore: grade.midterm_score,
      finalScore: grade.final_score,
      totalScore: grade.total_score
    }));
  } catch (error) {
    console.error('获取成绩失败:', error);
    ElMessage.error('获取成绩数据失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchGrades);
</script>

<script>
export default {
  name: 'StudentGrades',  // 修改组件名称为多词
};
</script>

<style scoped>
.student-grades {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.loading-container {
  padding: 20px;
}

.empty-grades {
  padding: 40px 0;
}
</style>
  