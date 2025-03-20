<template>
  <div class="user-management">
    <h2>用户管理</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="学生" name="students">
        <el-table :data="students" style="width: 100%">
          <el-table-column prop="username" label="学号" width="180" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column prop="gender" label="性别" width="100" />
          <el-table-column prop="birthdate" label="出生日期" width="180" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button @click="openEditDialog(row, 'student')" size="small" type="primary">编辑</el-button>
              <el-button @click="confirmDeleteUser(row, 'student')" size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="教师" name="teachers">
        <el-table :data="teachers" style="width: 100%">
          <el-table-column prop="username" label="工号" width="180" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column prop="title" label="职称" width="180" />
          <el-table-column prop="gender" label="性别" width="100" />
          <el-table-column prop="birthdate" label="出生日期" width="180" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button @click="openEditDialog(row, 'teacher')" size="small" type="primary">编辑</el-button>
              <el-button @click="confirmDeleteUser(row, 'teacher')" size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="管理员" name="admins">
        <el-table :data="admins" style="width: 100%">
          <el-table-column prop="username" label="管理员ID" width="180" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button @click="openEditDialog(row, 'admin')" size="small" type="primary">编辑</el-button>
              <el-button @click="confirmDeleteUser(row, 'admin')" size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑用户对话框 -->
    <el-dialog title="编辑用户" v-model="showEditDialog">
      <el-form :model="editUserData">
        <el-form-item label="姓名">
          <el-input v-model="editUserData.name" />
        </el-form-item>
        <el-form-item v-if="editUserType === 'teacher'" label="职称">
          <el-input v-model="editUserData.title" />
        </el-form-item>
        <el-form-item v-if="editUserType !== 'admin'" label="性别">
          <el-select v-model="editUserData.gender" placeholder="选择性别">
            <el-option label="男" value="M" />
            <el-option label="女" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editUserType !== 'admin'" label="出生日期">
          <el-date-picker v-model="editUserData.birthdate" type="date" placeholder="选择出生日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog title="确认删除" v-model="showDeleteConfirmDialog">
      <span>确定要删除用户 "{{ userToDelete.name }}" 吗？</span>
      <template #footer>
        <el-button @click="showDeleteConfirmDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteUser">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUsers, deleteUser as apiDeleteUser, updateUser as apiUpdateUser } from '@/services/api';

const activeTab = ref('students');
const students = ref([]);
const teachers = ref([]);
const admins = ref([]);
const showEditDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const editUserData = ref({});
const editUserType = ref('');
const userToDelete = ref({});

const fetchUsers = async () => {
  try {
    const { students: studentData, teachers: teacherData, admins: adminData } = await getUsers();

    // 格式化学生的出生日期
    students.value = studentData.map(student => ({
      ...student,
      birthdate: student.birthdate ? new Date(student.birthdate).toISOString().split('T')[0] : ''
    }));

    // 格式化教师的出生日期
    teachers.value = teacherData.map(teacher => ({
      ...teacher,
      birthdate: teacher.birthdate ? new Date(teacher.birthdate).toISOString().split('T')[0] : ''
    }));

    admins.value = adminData;
  } catch (error) {
    console.error('获取用户信息失败:', error.message);
  }
};

const openEditDialog = (user, type) => {
  editUserData.value = { ...user };
  editUserType.value = type;
  showEditDialog.value = true;
};

const updateUser = async () => {
  try {
    // 格式化出生日期为 YYYY-MM-DD
    if (editUserData.value.birthdate) {
      const date = new Date(editUserData.value.birthdate);
      editUserData.value.birthdate = date.toISOString().split('T')[0]; // 转换为 YYYY-MM-DD 格式
    }

    await apiUpdateUser(editUserData.value, editUserType.value);
    showEditDialog.value = false;
    fetchUsers();
  } catch (error) {
    console.error('更新用户失败:', error.message);
  }
};

const confirmDeleteUser = (user, type) => {
  userToDelete.value = { ...user, type };
  showDeleteConfirmDialog.value = true;
};

const deleteUser = async () => {
  try {
    await apiDeleteUser(userToDelete.value.username, userToDelete.value.type);
    showDeleteConfirmDialog.value = false;
    fetchUsers();
  } catch (error) {
    console.error(`删除${userToDelete.value.type}用户失败:`, error.message);
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 