<template>
  <div class="home-container">
    <header class="home-header">
      <div class="header-left">
        <h1>学生网上选课系统</h1>
      </div>
      <div class="header-right">
        <span class="user-name">{{ userName }}</span>
        <el-button link @click="logout" class="logout-button">退出</el-button>
      </div>
    </header>
    <StudentHome v-if="identity === 'student'" />
    <TeacherHome v-else-if="identity === 'teacher'" />
    <AdminHome v-else-if="identity === 'admin'" />
    <p v-else class="unknown-msg">身份未知，请重新登录！</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import StudentHome from '@/components/Student/StudentHome.vue';
import TeacherHome from '@/components/Teacher/TeacherHome.vue';
import AdminHome from '@/components/Admin/AdminHome.vue';

const store = useStore();
const router = useRouter();

const identity = computed(() => store.state.identity);

const userName = computed(() => {
  if (identity.value === 'student') {
    return store.state.student.studentName;
  } else if (identity.value === 'teacher') {
    return store.state.teacher.teacherName;
  } else if (identity.value === 'admin') {
    return store.state.admin.adminName; // 假设管理员也有名字
  }
  return '用户';
});

const logout = () => {
  store.dispatch('logout');
  router.push({ name: 'Login' });
};
</script>

<script>
export default {
  name: 'MainHome'
};
</script>

<style scoped>
.home-container {
  height: 100vh; /* 使用全屏高度 */
  background: linear-gradient(135deg, #e0f7fa, #e1bee7);
  padding: 0; /* 移除内边距 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  font-size: 24px;
  color: #2d3a4b;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-name {
  margin-right: 10px;
  font-size: 16px;
  color: #333;
}

.logout-button {
  font-size: 14px;
  color: #e74c3c;
  cursor: pointer;
}

.unknown-msg {
  text-align: center;
  font-size: 18px;
  color: #e74c3c;
  margin-top: 20px;
}
</style>
