<template>
    <div>
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
  import { ref } from 'vue'
  
  const myCourses = ref([
    { name: '高等数学', studentCount: 50, status: '进行中' },
    { name: '大学英语', studentCount: 40, status: '已结束' },
    // 更多课程数据
  ])
  
  const manageCourse = (course) => {
    // 跳转到课程管理页
    console.log('管理课程:', course)
  }
  </script>
  