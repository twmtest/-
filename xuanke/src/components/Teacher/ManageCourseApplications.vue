<template>
  <div class="manage-course-applications">
    <h2>管理学生选课申请</h2>
    <el-table :data="courseApplications" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="studentId" label="学号" />
      <el-table-column prop="status" label="申请状态" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-if="row.status === '待审核'" @click="approveApplication(row)" size="small" type="success">确认</el-button>
          <el-button v-if="row.status === '待审核'" @click="rejectApplication(row)" size="small" type="danger">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCourseApplications, updateApplicationStatus } from '@/services/api';

const courseApplications = ref([]);
const teacherId = localStorage.getItem('teacherId');

onMounted(async () => {
  try {
    courseApplications.value = await getCourseApplications(teacherId);
  } catch (error) {
    console.error('获取选课申请失败:', error.message);
  }
});

const approveApplication = async (application) => {
  try {
    await updateApplicationStatus(teacherId, application.applicationId, '已确认');
    courseApplications.value = await getCourseApplications(teacherId);
  } catch (error) {
    console.error('确认申请失败:', error.message);
  }
};

const rejectApplication = async (application) => {
  try {
    await updateApplicationStatus(teacherId, application.applicationId, '已驳回');
    courseApplications.value = await getCourseApplications(teacherId);
  } catch (error) {
    console.error('驳回申请失败:', error.message);
  }
};
</script>

<style scoped>
.manage-course-applications {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 