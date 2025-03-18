<template>
    <div>
      <h2>我的选课</h2>
      <el-table :data="selectedCourses" style="width: 100%">
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="teacherName" label="授课教师" />
        <el-table-column prop="credit" label="学分" />
        <el-table-column prop="schedule" label="上课时间" />
        <el-table-column prop="location" label="上课地点" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button 
              @click="handleDropCourse(row.course_id)" 
              size="mini" 
              type="danger" 
              :disabled="row.hasGrade"
            >
              退课
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue';
    import { getStudentCourses, dropCourse as apiDropCourse } from '@/services/api';

    const selectedCourses = ref([]);
    const studentId = localStorage.getItem('studentId'); // 确保 studentId 已正确存储

    onMounted(async () => {
      try {
        const courses = await getStudentCourses(studentId);
        selectedCourses.value = courses.map(course => ({
          ...course,
          hasGrade: course.grade !== null && course.grade !== undefined
        }));
      } catch (error) {
        console.error('获取选课信息失败:', error.message);
      }
    });

    const handleDropCourse = async (courseId) => {
      try {
        await apiDropCourse(studentId, courseId);
        alert('退课成功');
        // 更新选课列表
        const courses = await getStudentCourses(studentId);
        selectedCourses.value = courses.map(course => ({
          ...course,
          hasGrade: course.grade !== null && course.grade !== undefined
        }));
      } catch (error) {
        alert(error.message);
      }
    };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  