<template>
  <div>
    <h2>我的课程</h2>
    <el-table :data="myCourses" style="width: 100%">
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="studentCount" label="学生人数" />
      <el-table-column prop="status" label="课程状态" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="manageCourse(row)" size="small">管理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTeacherCourses } from '@/services/api';

const myCourses = ref([]);
const teacherId = localStorage.getItem('teacherId');

onMounted(async () => {
  try {
    myCourses.value = await getTeacherCourses(teacherId);
  } catch (error) {
    console.error('获取课程信息失败:', error.message);
  }
});

const manageCourse = (course) => {
  console.log('管理课程:', course);
};
</script>

<style scoped>
/* 根据需要添加样式 */
</style>