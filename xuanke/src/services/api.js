import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端服务的基础URL
});

// 登录接口
export const login = async (identity, username, password) => {
  try {
    const response = await api.post('/login', { identity, username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '登录失败');
  }
};

// 获取所有课程
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

// 获取学生选课信息
export const getStudentCourses = async (studentId) => {
  try {
    const response = await api.get(`/student/${studentId}/courses`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取选课信息失败');
  }
};

// 获取学生成绩信息
export const getStudentGrades = async (teacherId) => {
  try {
    const response = await api.get(`/teacher/${teacherId}/student-grades`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取成绩信息失败');
  }
};

// 学生选课
export const selectCourse = async (studentId, courseId) => {
  try {
    const response = await api.post(`/student/${studentId}/select-course`, { courseId });
    return response.data;
  } catch (error) {
    console.error('选课失败:', error.response ? error.response.data.message : error.message);
    throw new Error(error.response ? error.response.data.message : '选课失败');
  }
};

// 学生退课
export const dropCourse = async (studentId, courseId) => {
  try {
    console.log(`API调用 - 退课: 学生ID=${studentId}, 课程ID=${courseId}`);
    const response = await api.post('/teacher/drop-course', { 
      studentId, 
      courseId 
    });
    return response.data;
  } catch (error) {
    console.error('API错误 - 退课失败:', error);
    throw new Error(error.response?.data?.message || '退课失败');
  }
};

// 获取教师教授的课程信息
export const getTeacherCourses = async (teacherId) => {
  try {
    const response = await api.get(`/teacher/${teacherId}/courses`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取课程信息失败');
  }
};

// 更新学生成绩
export const updateGrade = async (grade) => {
  try {
    const response = await api.put(`/grades/${grade.gradeId}`, grade);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '更新成绩失败');
  }
};

// 更新课程信息
export const updateCourse = async (course) => {
  const response = await api.put(`/courses/${course.course_id}`, course);
  return response.data;
};

// 添加课程
export const addCourse = async (course) => {
  const response = await api.post('/courses', course);
  return response.data;
};

// 删除课程
export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

// 获取教师教授课程的选课记录
export const getCourseSelections = async (teacherId) => {
  try {
    const response = await api.get(`/teacher/${teacherId}/course-selections`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取选课记录失败');
  }
};

// 更新选课状态
export const updateSelectionStatus = async (selectionId, status) => {
  try {
    const response = await api.put(`/course-selections/${selectionId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '更新选课状态失败');
  }
};

// 获取教师的课程统计信息
export const getCourseStatistics = async (teacherId) => {
  try {
    const response = await api.get(`/teacher/${teacherId}/course-statistics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取选课统计失败');
  }
};

// 获取选课申请
export const getCourseApplications = async (teacherId) => {
  try {
    const response = await api.get(`/teacher/${teacherId}/course-applications`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取选课申请失败');
  }
};

// 更新申请状态
export const updateApplicationStatus = async (teacherId, applicationId, status) => {
  try {
    const response = await api.put(`/teacher/${teacherId}/approve-application/${applicationId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '更新申请状态失败');
  }
};

// 获取学生已申请的课程
export const getStudentApplications = async (studentId) => {
  try {
    const response = await api.get(`/student/${studentId}/applications`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取已申请课程失败');
  }
};

// 获取学生已选的课程
export const getStudentSelections = async (studentId) => {
  try {
    const response = await api.get(`/student/${studentId}/selections`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取已选课程失败');
  }
};

// 学生申请课程
export const applyCourse = async (studentId, courseId) => {
  const response = await api.post(`/student/${studentId}/apply-course`, { courseId });
  return response.data;
};

// 获取所有用户
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// 删除用户
export const deleteUser = async (username, type) => {
  const response = await api.delete(`/users/${type}/${username}`);
  return response.data;
};

// 更新用户
export const updateUser = async (user, type) => {
  const response = await api.put(`/users/${type}/${user.username}`, user);
  return response.data;
};

// 获取系统统计数据
export const getStatistics = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

// 学生申请退课
export const applyDropCourse = async (studentId, courseId) => {
  const response = await api.post(`/student/${studentId}/apply-drop-course`, { courseId });
  return response.data;
};

// 获取退课申请
export const getDropRequests = async (teacherId) => {
  const response = await api.get(`/teacher/${teacherId}/drop-requests`);
  return response.data;
};

// 同意退课申请
export const approveDrop = async (studentId, courseId) => {
  const response = await api.post('/teacher/approve-drop', { studentId, courseId });
  return response.data;
};

// 驳回退课申请
export const rejectDrop = async (studentId, courseId) => {
  const response = await api.post('/teacher/reject-drop', { studentId, courseId });
  return response.data;
};

// 教师审核选课申请
export const approveApplication = async (applicationId) => {
  const response = await api.post('/teacher/approve-application', { applicationId });
  return response.data;
};

// 教师驳回选课申请
export const rejectApplication = async (applicationId) => {
  const response = await api.post('/teacher/reject-application', { applicationId });
  return response.data;
};

export default api; 