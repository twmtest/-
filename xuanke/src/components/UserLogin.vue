<template>
  <div class="login-container">
    <div class="login-box">
      <h2>学生网上选课系统</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="identity">身份选择</label>
          <select id="identity" v-model="identity">
            <option value="student">学生</option>
            <option value="teacher">老师</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="input-group">
          <label for="username">学号</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="请输入学号"
            required
          />
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const identity = ref('student');
const username = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await store.dispatch('login', { identity: identity.value, username: username.value, password: password.value });
    router.push({ name: 'Home' });
  } catch (error) {
    console.error('登录失败:', error.message);
    alert(error.message);
  }
};
</script>

<style scoped>
/* 整体背景样式 */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #74ebd5, #acb6e5);
}

/* 登录框样式 */
.login-box {
  background: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 320px;
  text-align: center;
}

/* 标题样式 */
.login-box h2 {
  margin-bottom: 24px;
  color: #333333;
}

/* 输入组样式 */
.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #555555;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 14px;
}

/* 按钮样式 */
.login-button {
  width: 100%;
  padding: 12px;
  background-color: #74ebd5;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #58d4c3;
}
</style>
