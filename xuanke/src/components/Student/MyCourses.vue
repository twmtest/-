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
              v-if="row.status === '已选课'"
              @click="confirmDropCourse(row)" 
              size="small" 
              type="danger">申请退课</el-button>
            <span v-else>{{ row.status }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 退课确认对话框 -->
      <el-dialog
        v-model="showDropConfirmDialog"
        title="确认退课"
        width="30%">
        <span>确定要退选课程 "{{ courseToDrop.courseName }}" 吗？</span>
        <template #footer>
          <el-button @click="showDropConfirmDialog = false">取消</el-button>
          <el-button type="danger" @click="dropCourse">退课</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue';
    import { getStudentSelections, applyDropCourse } from '@/services/api';

    const selectedCourses = ref([]);
    const studentId = localStorage.getItem('studentId'); // 确保 studentId 已正确存储
    const showDropConfirmDialog = ref(false);
    const courseToDrop = ref({});

    const fetchCourses = async () => {
      try {
        const courses = await getStudentSelections(studentId);
        selectedCourses.value = courses.filter(course => course.status === '已选课');
      } catch (error) {
        alert(error.message);
      }
    };

    const confirmDropCourse = async (course) => {
      try {
        await applyDropCourse(studentId, course.courseId);
        fetchCourses();
      } catch (error) {
        alert('申请退课失败: ' + error.message);
      }
    };

    const dropCourse = async () => {
      try {
        await applyDropCourse(studentId, courseToDrop.value.courseId);
        showDropConfirmDialog.value = false;
        alert('退课成功');
        fetchCourses();
      } catch (error) {
        alert(error.message);
      }
    };

    onMounted(fetchCourses);
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  