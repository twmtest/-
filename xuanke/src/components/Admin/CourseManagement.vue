<template>
  <div class="course-management">
    <h2>课程管理</h2>
    <el-button type="primary" @click="openAddCourseDialog">添加课程</el-button>
    <el-table :data="courses" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="teacherId" label="教师ID" />
      <el-table-column prop="credit" label="学分" />
      <el-table-column prop="schedule" label="上课时间" />
      <el-table-column prop="location" label="上课地点" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="openEditCourseDialog(row)" size="small">编辑</el-button>
          <el-button @click="deleteCourse(row.course_id)" size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加课程对话框 -->
    <el-dialog title="添加课程" v-model="showAddCourseDialog">
      <el-form :model="newCourse">
        <el-form-item label="课程名称">
          <el-input v-model="newCourse.courseName" />
        </el-form-item>
        <el-form-item label="教师ID">
          <el-input v-model="newCourse.teacherId" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input v-model="newCourse.credit" />
        </el-form-item>
        <el-form-item label="上课时间">
          <el-input v-model="newCourse.schedule" />
        </el-form-item>
        <el-form-item label="上课地点">
          <el-input v-model="newCourse.location" />
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input v-model="newCourse.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="addCourse">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑课程对话框 -->
    <el-dialog title="编辑课程" v-model="showEditCourseDialog">
      <el-form :model="editCourseData">
        <el-form-item label="课程名称">
          <el-input v-model="editCourseData.courseName" />
        </el-form-item>
        <el-form-item label="教师ID">
          <el-input v-model="editCourseData.teacherId" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input v-model="editCourseData.credit" />
        </el-form-item>
        <el-form-item label="上课时间">
          <el-input v-model="editCourseData.schedule" />
        </el-form-item>
        <el-form-item label="上课地点">
          <el-input v-model="editCourseData.location" />
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input v-model="editCourseData.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="updateCourse">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const courses = ref([]);
const showAddCourseDialog = ref(false);
const showEditCourseDialog = ref(false);
const newCourse = ref({
  courseName: '',
  teacherId: '',
  credit: '',
  schedule: '',
  location: '',
  description: '',
});
const editCourseData = ref({});

const fetchCourses = async () => {
  try {
    courses.value = await store.dispatch('admin/fetchCourses');
  } catch (error) {
    console.error('获取课程失败:', error.message);
  }
};

const openAddCourseDialog = () => {
  newCourse.value = {
    courseName: '',
    teacherId: '',
    credit: '',
    schedule: '',
    location: '',
    description: '',
  };
  showAddCourseDialog.value = true;
};

const openEditCourseDialog = (course) => {
  editCourseData.value = { ...course };
  showEditCourseDialog.value = true;
};

const addCourse = async () => {
  try {
    await store.dispatch('admin/addCourse', newCourse.value);
    showAddCourseDialog.value = false;
    fetchCourses();
  } catch (error) {
    console.error('添加课程失败:', error.message);
  }
};

const updateCourse = async () => {
  try {
    await store.dispatch('admin/updateCourse', editCourseData.value);
    showEditCourseDialog.value = false;
    fetchCourses();
  } catch (error) {
    console.error('更新课程失败:', error.message);
  }
};

const deleteCourse = async (courseId) => {
  try {
    await store.dispatch('admin/deleteCourse', courseId);
    fetchCourses();
  } catch (error) {
    console.error('删除课程失败:', error.message);
  }
};

onMounted(fetchCourses);
</script>

<style scoped>
.course-management {
  padding: 20px;
}

.dialog-footer {
  text-align: right;
}
</style> 