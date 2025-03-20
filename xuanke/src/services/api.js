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

// 获取所有课程信息
export const getCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '获取课程失败');
  }
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
    const response = await api.delete(`/student/${studentId}/drop-course/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '退课失败');
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
  try {
    const response = await api.put(`/courses/${course.course_id}`, course);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '更新课程失败');
  }
};

// 添加新课程
export const addCourse = async (course) => {
  try {
    const response = await api.post('/courses', course);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '添加课程失败');
  }
};

// 删除课程
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || '删除课程失败');
  }
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

// 获取课程选课统计
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

export default api; 