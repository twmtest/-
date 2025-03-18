<template>
    <div>
      <h2>成绩查询</h2>
      <el-table :data="grades" style="width: 100%">
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="regular_score" label="平时成绩" />
        <el-table-column prop="midterm_score" label="期中成绩" />
        <el-table-column prop="final_score" label="期末成绩" />
        <el-table-column prop="total_score" label="总成绩" />
      </el-table>
    </div>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue';
    import { getStudentGrades } from '@/services/api';

    const grades = ref([]);
    const studentId = localStorage.getItem('studentId'); // 假设学生ID存储在localStorage中

    onMounted(async () => {
      try {
        grades.value = await getStudentGrades(studentId);
      } catch (error) {
        console.error('获取成绩信息失败:', error.message);
      }
    });
  </script>
  
  <script>
  export default {
    name: 'StudentGrades',  // 修改组件名称为多词
  };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  