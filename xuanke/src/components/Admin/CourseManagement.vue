<template>
  <div class="course-management">
    <h2>课程管理</h2>
    <el-table :data="courses" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" width="180" />
      <el-table-column prop="teacher" label="授课教师" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button @click="editCourse(row)" size="small" type="primary">编辑</el-button>
          <el-button @click="deleteCourse(row)" size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const courses = ref([
  { courseName: '数学', teacher: '张老师' },
  { courseName: '英语', teacher: '李老师' },
  // 更多课程数据...
])

const editCourse = (course) => {
  console.log('编辑课程:', course)
}

const deleteCourse = (course) => {
  const index = courses.value.indexOf(course)
  if (index !== -1) {
    courses.value.splice(index, 1)
  }
}
</script>

<style scoped>
.course-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 