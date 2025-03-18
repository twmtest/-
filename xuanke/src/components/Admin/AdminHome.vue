<template>
  <div class="admin-home">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <el-menu
        default-active="1"
        class="sidebar-menu"
        @select="handleMenuSelect"
        background-color="#2d3a4b"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="1">
          <i class="el-icon-s-order"></i>
          课程管理
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-s-ticket"></i>
          用户管理
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-s-data"></i>
          数据统计
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-plus"></i>
          添加用户
        </el-menu-item>
      </el-menu>
    </aside>
    <!-- 主内容区域 -->
    <main class="content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CourseManagement from './CourseManagement.vue'
import UserManagement from './UserManagement.vue'
import DataStatistics from './DataStatistics.vue'
import AddUser from './AddUser.vue'

const currentMenu = ref('1')

const handleMenuSelect = (index) => {
  currentMenu.value = index
}

// 根据 currentMenu 的值计算当前显示的组件
const currentComponent = computed(() => {
  switch (currentMenu.value) {
    case '1':
      return CourseManagement
    case '2':
      return UserManagement
    case '3':
      return DataStatistics
    case '4':
      return AddUser
    default:
      return CourseManagement
  }
})
</script>

<style scoped>
.admin-home {
  display: flex;
  height: 100vh; /* 使用全屏高度 */
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* 侧边栏区域 */
.sidebar {
  width: 240px;
  background-color: #2d3a4b;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 主内容区域 */
.content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}

/* 调整菜单样式 */
.sidebar-menu {
  flex-grow: 1;
  border-right: none;
}
</style>
