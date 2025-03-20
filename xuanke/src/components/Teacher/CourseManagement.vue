<template>
  <div class="course-management">
    <h2>课程管理</h2>
    <el-table :data="courses" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="schedule" label="上课时间" />
      <el-table-column prop="location" label="上课地点" />
      <el-table-column prop="credit" label="学分" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="editCourse(row)" size="small" type="primary">编辑</el-button>
          <el-button @click="confirmDeleteCourse(row)" size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button type="primary" @click="showAddCourseDialog = true">新增课程</el-button>

    <el-dialog v-model="showEditDialog" title="编辑课程">
      <el-form :model="currentCourse" label-width="100px">
        <el-form-item label="课程名称">
          <el-input v-model="currentCourse.courseName" />
        </el-form-item>
        <el-form-item label="上课时间">
          <el-input v-model="currentCourse.schedule" />
        </el-form-item>
        <el-form-item label="上课地点">
          <el-input v-model="currentCourse.location" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input v-model="currentCourse.credit" type="number" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentCourse.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddCourseDialog" title="新增课程">
      <el-form :model="newCourse" label-width="100px">
        <el-form-item label="课程名称">
          <el-input v-model="newCourse.courseName" />
        </el-form-item>
        <el-form-item label="上课时间">
          <el-input v-model="newCourse.schedule" />
        </el-form-item>
        <el-form-item label="上课地点">
          <el-input v-model="newCourse.location" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input v-model="newCourse.credit" type="number" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newCourse.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="createCourse">添加</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteConfirmDialog"
      title="确认删除"
      width="30%">
      <span>确定要删除课程 "{{ courseToDelete.courseName }}" 吗？</span>
      <template #footer>
        <el-button @click="showDeleteConfirmDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteCourse">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTeacherCourses, updateCourse as apiUpdateCourse, addCourse as apiAddCourse, deleteCourse as apiDeleteCourse } from '@/services/api';

const courses = ref([]);
const teacherId = localStorage.getItem('teacherId');
const showEditDialog = ref(false);
const showAddCourseDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const currentCourse = ref({});
const newCourse = ref({
  courseName: '',
  schedule: '',
  location: '',
  credit: 0,
  description: ''
});
const courseToDelete = ref({});

onMounted(async () => {
  try {
    courses.value = await getTeacherCourses(teacherId);
  } catch (error) {
    console.error('获取课程信息失败:', error.message);
  }
});

const editCourse = (course) => {
  currentCourse.value = { ...course };
  showEditDialog.value = true;
};

const saveCourse = async () => {
  try {
    await apiUpdateCourse(currentCourse.value);
    showEditDialog.value = false;
    courses.value = await getTeacherCourses(teacherId);
  } catch (error) {
    console.error('更新课程失败:', error.message);
  }
};

const createCourse = async () => {
  try {
    await apiAddCourse({ ...newCourse.value, teacherId });
    showAddCourseDialog.value = false;
    courses.value = await getTeacherCourses(teacherId);
  } catch (error) {
    console.error('添加课程失败:', error.message);
  }
};

const confirmDeleteCourse = (course) => {
  courseToDelete.value = course;
  showDeleteConfirmDialog.value = true;
};

const deleteCourse = async () => {
  try {
    await apiDeleteCourse(courseToDelete.value.course_id);
    showDeleteConfirmDialog.value = false;
    courses.value = await getTeacherCourses(teacherId);
  } catch (error) {
    console.error('删除课程失败:', error.message);
  }
};
</script>

<style scoped>
.course-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 