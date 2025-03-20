<template>
  <div class="student-grades-management">
    <h2>学生成绩管理</h2>
    
    <div class="action-buttons">
      <el-button type="primary" @click="showUploadDialog = true">上传成绩</el-button>
      <el-button type="success" @click="exportGrades">导出成绩报表</el-button>
    </div>
    
    <el-table :data="studentGrades" style="width: 100%">
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="regularScore" label="平时成绩" />
      <el-table-column prop="midtermScore" label="期中成绩" />
      <el-table-column prop="finalScore" label="期末成绩" />
      <el-table-column prop="totalScore" label="总成绩" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="editGrade(row)" size="small" type="primary">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showEditDialog" title="编辑成绩">
      <el-form :model="currentGrade" label-width="100px">
        <el-form-item label="平时成绩">
          <el-input v-model="currentGrade.regularScore" type="number" />
        </el-form-item>
        <el-form-item label="期中成绩">
          <el-input v-model="currentGrade.midtermScore" type="number" />
        </el-form-item>
        <el-form-item label="期末成绩">
          <el-input v-model="currentGrade.finalScore" type="number" />
        </el-form-item>
        <el-form-item label="总成绩">
          <el-input v-model="currentGrade.totalScore" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveGrade">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showUploadDialog" title="上传学生成绩" width="40%">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="选择课程">
          <el-select v-model="uploadForm.courseId" placeholder="请选择课程">
            <el-option 
              v-for="course in teacherCourses" 
              :key="course.course_id" 
              :label="course.courseName" 
              :value="course.course_id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="上传方式">
          <el-radio-group v-model="uploadForm.uploadType">
            <el-radio value="file">上传文件</el-radio>
            <el-radio value="manual">手动输入</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <template v-if="uploadForm.uploadType === 'file'">
          <el-form-item label="选择文件">
            <el-upload
              action=""
              :auto-upload="false"
              :limit="1"
              accept=".csv,.xlsx,.xls"
              :on-change="handleFileChange"
            >
              <template #trigger>
                <el-button type="primary">选择文件</el-button>
              </template>
              <template #tip>
                <div class="el-upload__tip">
                  请上传 CSV 或 Excel 文件，格式包含：学号、平时成绩、期中成绩、期末成绩
                  <el-button type="text" @click="downloadTemplate">下载模板</el-button>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </template>
        
        <template v-else>
          <el-form-item label="手动输入">
            <el-button type="primary" @click="addStudentRow">添加学生行</el-button>
            <div class="manual-grades">
              <div v-for="(row, index) in uploadForm.manualData" :key="index" class="manual-row">
                <el-input v-model="row.studentId" placeholder="学号" class="student-id-input" />
                <el-input v-model="row.regularScore" placeholder="平时成绩" type="number" />
                <el-input v-model="row.midtermScore" placeholder="期中成绩" type="number" />
                <el-input v-model="row.finalScore" placeholder="期末成绩" type="number" />
                <el-button 
                  type="danger" 
                  circle 
                  size="small" 
                  @click="removeStudentRow(index)"
                  :disabled="uploadForm.manualData.length <= 1"
                >
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadGrades">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStudentGrades, updateGrade, getTeacherCourses, uploadGradesBatch } from '@/services/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const studentGrades = ref([]);
const teacherId = localStorage.getItem('teacherId');
const showEditDialog = ref(false);
const currentGrade = ref({});
const showUploadDialog = ref(false);
const teacherCourses = ref([]);

const uploadForm = ref({
  courseId: '',
  uploadType: 'file',
  file: null,
  manualData: [{ studentId: '', regularScore: null, midtermScore: null, finalScore: null }]
});

onMounted(async () => {
  try {
    studentGrades.value = await getStudentGrades(teacherId);
    teacherCourses.value = await getTeacherCourses(teacherId);
  } catch (error) {
    console.error('获取数据失败:', error.message);
    ElMessage.error('获取数据失败: ' + error.message);
  }
});

const editGrade = (grade) => {
  currentGrade.value = { ...grade };
  showEditDialog.value = true;
};

const saveGrade = async () => {
  try {
    await updateGrade(currentGrade.value.gradeId, currentGrade.value);
    showEditDialog.value = false;
    studentGrades.value = await getStudentGrades(teacherId);
    ElMessage.success('成绩更新成功');
  } catch (error) {
    console.error('更新成绩失败:', error.message);
    ElMessage.error('更新成绩失败: ' + error.message);
  }
};

const exportGrades = () => {
  if (studentGrades.value.length === 0) {
    ElMessage.warning('没有可导出的成绩数据');
    return;
  }
  
  // 创建CSV数据
  let csvContent = "课程名称,学生姓名,平时成绩,期中成绩,期末成绩,总成绩\n";
  
  studentGrades.value.forEach(grade => {
    csvContent += `${grade.courseName},${grade.studentName},${grade.regularScore || ''},${grade.midtermScore || ''},${grade.finalScore || ''},${grade.totalScore || ''}\n`;
  });
  
  // 创建下载链接
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "学生成绩.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  ElMessage.success('成绩导出成功');
};

const handleFileChange = (file) => {
  uploadForm.value.file = file.raw;
};

const downloadTemplate = () => {
  // 创建一个临时的 a 标签用于下载
  const csvContent = "学号,平时成绩,期中成绩,期末成绩\nS1001,85,90,88\nS1002,78,82,85";
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "成绩导入模板.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const addStudentRow = () => {
  uploadForm.value.manualData.push({ 
    studentId: '', 
    regularScore: null, 
    midtermScore: null, 
    finalScore: null 
  });
};

const removeStudentRow = (index) => {
  uploadForm.value.manualData.splice(index, 1);
};

const uploadGrades = async () => {
  try {
    if (!uploadForm.value.courseId) {
      ElMessage.warning('请选择课程');
      return;
    }
    
    let gradesData;
    if (uploadForm.value.uploadType === 'file') {
      if (!uploadForm.value.file) {
        ElMessage.warning('请选择文件');
        return;
      }
      
      // 上传文件的逻辑
      ElMessageBox.confirm(
        '文件将被上传并处理，确认继续吗？',
        '确认上传',
        { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
      ).then(async () => {
        // 创建 FormData 进行文件上传
        const formData = new FormData();
        formData.append('file', uploadForm.value.file);
        formData.append('courseId', uploadForm.value.courseId);
        
        await uploadGradesBatch(teacherId, formData);
        ElMessage.success('成绩上传成功');
        showUploadDialog.value = false;
        studentGrades.value = await getStudentGrades(teacherId);
      });
      
    } else {
      // 手动输入的数据
      if (uploadForm.value.manualData.some(row => !row.studentId)) {
        ElMessage.warning('请填写所有学号');
        return;
      }
      
      gradesData = uploadForm.value.manualData.map(row => ({
        ...row,
        courseId: uploadForm.value.courseId
      }));
      
      await uploadGradesBatch(teacherId, { grades: JSON.stringify(gradesData) });
      ElMessage.success('成绩上传成功');
      showUploadDialog.value = false;
      studentGrades.value = await getStudentGrades(teacherId);
    }
  } catch (error) {
    console.error('上传成绩失败:', error.message);
    ElMessage.error('上传成绩失败: ' + error.message);
  }
};
</script>

<style scoped>
.student-grades-management {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.manual-grades {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.manual-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.student-id-input {
  min-width: 120px;
}
</style> 