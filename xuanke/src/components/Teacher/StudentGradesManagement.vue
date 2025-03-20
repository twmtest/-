<template>
  <div class="student-grades-management">
    <h2>学生成绩管理</h2>
    <el-table :data="studentGrades" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="regularScore" label="平时成绩" />
      <el-table-column prop="midtermScore" label="期中成绩" />
      <el-table-column prop="finalScore" label="期末成绩" />
      <el-table-column prop="totalScore" label="总成绩" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="editGrade(row)" size="small" type="primary">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button type="primary" @click="exportGrades">导出成绩报表</el-button>

    <el-dialog v-model="showEditDialog" title="编辑成绩">
      <el-form :model="currentGrade" label-width="100px">
        <el-form-item label="平时成绩">
          <el-input v-model="currentGrade.regularScore" type="number" />
        </el-form-item>
        <el-form-item label="期中成绩">
          <el-input v-model="currentGrade.midtermScore" type="number" />
        </el-form-item>
        <el-form-item label="期末成绩">
          <el-input v-model="currentGrade.finalScore" type="number" />
        </el-form-item>
        <el-form-item label="总成绩">
          <el-input v-model="currentGrade.totalScore" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveGrade">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStudentGrades, updateGrade } from '@/services/api';

const studentGrades = ref([]);
const teacherId = localStorage.getItem('teacherId');
const showEditDialog = ref(false);
const currentGrade = ref({});

onMounted(async () => {
  try {
    studentGrades.value = await getStudentGrades(teacherId);
  } catch (error) {
    console.error('获取成绩信息失败:', error.message);
  }
});

const editGrade = (grade) => {
  currentGrade.value = { ...grade };
  showEditDialog.value = true;
};

const saveGrade = async () => {
  try {
    await updateGrade(currentGrade.value);
    showEditDialog.value = false;
    studentGrades.value = await getStudentGrades(teacherId);
  } catch (error) {
    console.error('更新成绩失败:', error.message);
  }
};

const exportGrades = () => {
  // 实现导出成绩报表的逻辑
  console.log('导出成绩报表');
};
</script>

<style scoped>
.student-grades-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 