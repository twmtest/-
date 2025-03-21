<template>
  <div>
    <h2>查看课程</h2>
    <el-input v-model="searchName" placeholder="按课程名称搜索" />
    <el-input v-model="searchTeacher" placeholder="按教师搜索" />
    <el-input v-model="searchSchedule" placeholder="按时间搜索" />
    <el-button @click="filterCourses">筛选</el-button>
    <el-button @click="resetFilters">重置</el-button>
    <el-table :data="filteredCourses" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="teacherName" label="授课教师" />
      <el-table-column prop="credit" label="学分" />
      <el-table-column prop="schedule" label="上课时间" />
      <el-table-column prop="location" label="上课地点" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="viewCourseDetails(row)" size="small">详情</el-button>
          <el-button 
            @click="applyForCourse(row.course_id)" 
            size="small" 
            type="primary"
            :disabled="isCourseSelected(row.course_id)"
          >
            申请选课
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { getCourses, getStudentApplications } from '@/services/api';

const store = useStore();
const searchName = ref('');
const searchTeacher = ref('');
const searchSchedule = ref('');
const courses = ref([]);
const studentApplications = ref([]);

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    return (
      (!searchName.value || course.courseName.includes(searchName.value)) &&
      (!searchTeacher.value || course.teacherName.includes(searchTeacher.value)) &&
      (!searchSchedule.value || course.schedule.includes(searchSchedule.value))
    );
  });
});

const selectedCourses = computed(() => store.state.student.selectedCourses);

const fetchCourses = async () => {
  try {
    courses.value = await getCourses();
    studentApplications.value = await getStudentApplications(store.state.student.studentId);
  } catch (error) {
    console.error('获取课程失败:', error.message);
  }
};

const applyForCourse = async (courseId) => {
  const existingApplication = studentApplications.value.find(app => app.course_id === courseId && app.status !== '已驳回');
  if (existingApplication) {
    alert('您已申请过此课程，不能重复申请');
    return;
  }
  
  try {
    await store.dispatch('student/applyCourse', courseId);
    alert('选课申请已提交，等待教师审核');
    studentApplications.value = await getStudentApplications(store.state.student.studentId);
  } catch (error) {
    alert(error.message);
  }
};

const viewCourseDetails = (course) => {
  alert(`课程详情:\n名称: ${course.courseName}\n教师: ${course.teacherName}\n学分: ${course.credit}\n时间: ${course.schedule}\n地点: ${course.location}\n简介: ${course.description}`);
};

const isCourseSelected = (courseId) => {
  return selectedCourses.value.has(courseId);
};

const filterCourses = () => {
  // Implementation of filterCourses method
};

const resetFilters = () => {
  // Implementation of resetFilters method
};

fetchCourses();
</script>

<style scoped>
/* 根据需要添加样式 */
</style>
  