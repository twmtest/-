<template>
  <div class="course-selection-management">
    <h2>学生选课管理</h2>
    <el-table :data="courseSelections" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="studentId" label="学号" />
      <el-table-column prop="status" label="选课状态" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="row.status === '待审核'" @click="approveSelection(row)" size="small" type="success">确认</el-button>
          <el-button v-if="row.status === '待审核'" @click="rejectSelection(row)" size="small" type="danger">驳回</el-button>
          <el-button @click="confirmDropCourse(row)" size="small" type="danger">退课</el-button>
        </template>
      </el-table-column>
    </el-table>

    <h3>选课统计</h3>
    <el-table :data="courseStatistics" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="studentCount" label="选课人数" />
    </el-table>

    <!-- 退课确认对话框 -->
    <el-dialog
      v-model="showDropConfirmDialog"
      title="确认退课"
      width="30%">
      <span>确定要退选课程 "{{ courseToDrop.courseName }}" 吗？</span>
      <template #footer>
        <el-button @click="showDropConfirmDialog = false">取消</el-button>
        <el-button type="danger" @click="dropCourseHandler">退课</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCourseSelections, updateSelectionStatus, getCourseStatistics, dropCourse } from '@/services/api';

const courseSelections = ref([]);
const courseStatistics = ref([]);
const teacherId = localStorage.getItem('teacherId');
const showDropConfirmDialog = ref(false);
const courseToDrop = ref({});

onMounted(async () => {
  try {
    const selections = await getCourseSelections(teacherId);
    // 确保每个选课记录都有 course_id
    courseSelections.value = selections.map(selection => ({
      ...selection,
      course_id: selection.course_id.toString() // 确保 course_id 是字符串类型
    }));
    courseStatistics.value = await getCourseStatistics(teacherId);
  } catch (error) {
    console.error('获取选课信息失败:', error.message);
  }
});

const approveSelection = async (selection) => {
  try {
    await updateSelectionStatus(selection.selection_id, '已确认');
    await refreshSelections();
  } catch (error) {
    console.error('确认选课失败:', error.message);
  }
};

const rejectSelection = async (selection) => {
  try {
    await updateSelectionStatus(selection.selection_id, '已驳回');
    await refreshSelections();
  } catch (error) {
    console.error('驳回选课失败:', error.message);
  }
};

const refreshSelections = async () => {
  try {
    const selections = await getCourseSelections(teacherId);
    courseSelections.value = selections.map(selection => ({
      ...selection,
      course_id: selection.course_id.toString()
    }));
  } catch (error) {
    console.error('刷新选课信息失败:', error.message);
  }
};

const confirmDropCourse = (course) => {
  courseToDrop.value = {
    studentId: course.student_id,
    courseId: course.course_id,
    courseName: course.courseName
  };
  console.log('退课信息:', courseToDrop.value); // 调试输出
  showDropConfirmDialog.value = true;
};

const dropCourseHandler = async () => {
  try {
    console.log('准备退课，学生ID:', courseToDrop.value.studentId, '课程ID:', courseToDrop.value.courseId);
    await dropCourse(courseToDrop.value.studentId, courseToDrop.value.courseId);
    showDropConfirmDialog.value = false;
    await refreshSelections();
  } catch (error) {
    console.error('退课失败:', error.message);
  }
};
</script>

<style scoped>
.course-selection-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 