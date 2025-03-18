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
export const getStudentGrades = async (studentId) => {
  try {
    const response = await api.get(`/student/${studentId}/grades`);
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

export default api; 