<template>
  <div class="add-user">
    <h2>添加用户</h2>
    <el-form :model="form" ref="userForm" label-width="100px">
      <el-form-item label="身份">
        <el-select v-model="form.identity" placeholder="选择身份">
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.username" placeholder="请输入学号或工号" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item v-if="form.identity !== 'admin'" label="性别">
        <el-select v-model="form.gender" placeholder="选择性别">
          <el-option label="男" value="M" />
          <el-option label="女" value="F" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.identity !== 'admin'" label="出生日期">
        <el-date-picker v-model="form.birthdate" type="date" placeholder="选择出生日期" />
      </el-form-item>
      <el-form-item v-if="form.identity === 'teacher'" label="职称">
        <el-input v-model="form.title" placeholder="请输入职称" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="form.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addUser">添加用户</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/services/api' // 导入 API 服务

const form = ref({
  identity: 'student',
  username: '',
  name: '',
  gender: '',
  birthdate: '',
  title: '',
  password: '',
})

const addUser = async () => {
  try {
    // 格式化出生日期为 YYYY-MM-DD
    if (form.value.birthdate) {
      const date = new Date(form.value.birthdate);
      form.value.birthdate = date.toISOString().split('T')[0]; // 转换为 YYYY-MM-DD 格式
    }

    const response = await api.post('/register', form.value)
    ElMessage.success(response.data.message)
    // 清空表单
    form.value = { identity: 'student', username: '', name: '', gender: '', birthdate: '', title: '', password: '' }
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.add-user {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style> 