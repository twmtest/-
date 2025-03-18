<template>
    <div>
      <el-table :data="courses" style="width: 100%">
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="teacher" label="授课教师" />
        <el-table-column prop="credits" label="学分" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button @click="viewDetails(row)" size="small">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const courses = ref([
    { name: '高等数学', teacher: '李老师', credits: 3 },
    { name: '大学英语', teacher: '王老师', credits: 2 },
    // 更多课程数据
  ])
  
  const viewDetails = (course) => {
    // 跳转到课程详情页
    console.log('查看课程详情:', course)
  }
  </script>
  