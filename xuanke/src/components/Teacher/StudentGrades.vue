<template>
  <div class="grades">
    <h2>学生成绩</h2>
    <el-table :data="grades" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="regular_score" label="平时成绩" />
      <el-table-column prop="midterm_score" label="期中成绩" />
      <el-table-column prop="final_score" label="期末成绩" />
      <el-table-column prop="total_score" label="总成绩" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="editGrade(row)" size="small" type="primary">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="编辑成绩">
      <el-form :model="currentGrade" ref="gradeForm" label-width="100px">
        <el-form-item label="平时成绩">
          <el-input v-model="currentGrade.regular_score" type="number" />
        </el-form-item>
        <el-form-item label="期中成绩">
          <el-input v-model="currentGrade.midterm_score" type="number" />
        </el-form-item>
        <el-form-item label="期末成绩">
          <el-input v-model="currentGrade.final_score" type="number" />
        </el-form-item>
        <el-form-item label="总成绩">
          <el-input v-model="currentGrade.total_score" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGrade">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStudentGrades, updateGrade } from '@/services/api'

const grades = ref([])
const dialogVisible = ref(false)
const currentGrade = ref({})

onMounted(async () => {
  try {
    grades.value = await getStudentGrades()
  } catch (error) {
    console.error('获取成绩信息失败:', error.message)
  }
})

const editGrade = (row) => {
  currentGrade.value = { ...row }
  dialogVisible.value = true
}

const saveGrade = async () => {
  try {
    await updateGrade(currentGrade.value)
    dialogVisible.value = false
    // 更新成绩列表
    grades.value = await getStudentGrades()
  } catch (error) {
    console.error('更新成绩失败:', error.message)
  }
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