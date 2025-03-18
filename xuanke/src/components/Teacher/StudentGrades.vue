<template>
    <div class="grades">
      <el-table :data="grades" style="width: 100%">
        <el-table-column prop="courseName" label="课程名称" width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="180" />
        <el-table-column prop="score" label="成绩" width="180" />
        <el-table-column prop="grade" label="等级" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button @click="editGrade(row)" size="mini" type="primary">编辑</el-button>
            <el-button @click="deleteGrade(row)" size="mini" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog v-model="dialogVisible" title="编辑成绩">
        <el-form :model="currentGrade" ref="gradeForm" label-width="100px">
          <el-form-item label="课程名称">
            <el-input v-model="currentGrade.courseName" disabled />
          </el-form-item>
          <el-form-item label="学生姓名">
            <el-input v-model="currentGrade.studentName" disabled />
          </el-form-item>
          <el-form-item label="成绩">
            <el-input v-model="currentGrade.score" type="number" />
          </el-form-item>
          <el-form-item label="等级">
            <el-select v-model="currentGrade.grade" placeholder="请选择等级">
              <el-option label="优秀" value="优秀" />
              <el-option label="良好" value="良好" />
              <el-option label="中等" value="中等" />
              <el-option label="及格" value="及格" />
              <el-option label="不及格" value="不及格" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveGrade">确 定</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
  
  const grades = ref([
    { courseName: '数学', studentName: '张三', score: 90, grade: '优秀' },
    { courseName: '英语', studentName: '李四', score: 85, grade: '良好' },
    { courseName: '物理', studentName: '王五', score: 78, grade: '中等' },
    // 更多成绩数据...
  ])
  
  const dialogVisible = ref(false)
  const currentGrade = ref({ courseName: '', studentName: '', score: '', grade: '' })
  
  const editGrade = (row) => {
    currentGrade.value = { ...row }
    dialogVisible.value = true
  }
  
  const deleteGrade = (row) => {
    const index = grades.value.indexOf(row)
    if (index !== -1) {
      grades.value.splice(index, 1)
    }
  }
  
  const saveGrade = () => {
    const index = grades.value.findIndex((grade) => grade.courseName === currentGrade.value.courseName && grade.studentName === currentGrade.value.studentName)
    if (index !== -1) {
      grades.value[index] = { ...currentGrade.value }
    } else {
      grades.value.push({ ...currentGrade.value })
    }
    dialogVisible.value = false
  }
  </script>
  
  <style scoped>
  .grades {
    padding: 20px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  </style>
  