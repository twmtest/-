<template>
  <div class="teacher-home">
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
          查看课程
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-s-ticket"></i>
          我的课程
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-s-data"></i>
          学生成绩
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
import ViewCourses from './ViewCourses.vue'
import MyCourses from './MyCourses.vue'
import StudentGrades from './StudentGrades.vue'

const currentMenu = ref('1')

const handleMenuSelect = (index) => {
  currentMenu.value = index
}

// 根据 currentMenu 的值计算当前显示的组件
const currentComponent = computed(() => {
  switch (currentMenu.value) {
    case '1':
      return ViewCourses
    case '2':
      return MyCourses
    case '3':
      return StudentGrades
    default:
      return ViewCourses
  }
})
</script>

<style scoped>
.teacher-home {
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
