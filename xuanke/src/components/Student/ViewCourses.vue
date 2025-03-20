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
import { ref, onMounted } from 'vue';
import { getCourses, getStudentSelections } from '@/services/api';
import api from '@/services/api';

const courses = ref([]);
const filteredCourses = ref([]);
const selectedCourses = ref(new Set());
const searchName = ref('');
const searchTeacher = ref('');
const searchSchedule = ref('');
const studentId = localStorage.getItem('studentId');

onMounted(async () => {
  try {
    courses.value = await getCourses();
    filteredCourses.value = courses.value;

    // 获取学生已选的课程
    const selections = await getStudentSelections(studentId);
    selectedCourses.value = new Set(selections.map(sel => sel.course_id));
  } catch (error) {
    console.error('获取课程失败:', error.message);
  }
});

const filterCourses = () => {
  filteredCourses.value = courses.value.filter(course => {
    return (
      (!searchName.value || course.courseName.includes(searchName.value)) &&
      (!searchTeacher.value || course.teacherName.includes(searchTeacher.value)) &&
      (!searchSchedule.value || course.schedule.includes(searchSchedule.value))
    );
  });
};

const resetFilters = () => {
  searchName.value = '';
  searchTeacher.value = '';
  searchSchedule.value = '';
  filteredCourses.value = courses.value;
};

const applyForCourse = async (courseId) => {
  console.log('申请选课:', studentId, courseId);
  try {
    await api.post(`/student/${studentId}/apply-course`, { courseId });
    alert('选课申请已提交，等待教师审核');
    selectedCourses.value.add(courseId); // 更新已选课程列表
  } catch (error) {
    if (error.response && error.response.status === 400) {
      alert(error.response.data.message); // 显示后端返回的具体错误信息
    } else {
      console.error('申请选课失败:', error.message);
      alert('申请选课失败，请稍后重试');
    }
  }
};

const viewCourseDetails = (course) => {
  alert(`课程详情:\n名称: ${course.courseName}\n教师: ${course.teacherName}\n学分: ${course.credit}\n时间: ${course.schedule}\n地点: ${course.location}\n简介: ${course.description}`);
};

// 检查课程是否已选
const isCourseSelected = (courseId) => {
  return selectedCourses.value.has(courseId);
};
</script>

<style scoped>
/* 根据需要添加样式 */
</style>
  