<template>
  <div class="user-management">
    <h2>用户管理</h2>
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="role" label="角色" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button @click="editUser(row)" size="small" type="primary">编辑</el-button>
          <el-button @click="deleteUser(row)" size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  { username: 'admin', role: '管理员' },
  { username: 'teacher1', role: '教师' },
  // 更多用户数据...
])

const editUser = (user) => {
  console.log('编辑用户:', user)
}

const deleteUser = (user) => {
  const index = users.value.indexOf(user)
  if (index !== -1) {
    users.value.splice(index, 1)
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 