import { getCourses, addCourse as apiAddCourse, updateCourse as apiUpdateCourse, deleteCourse as apiDeleteCourse } from '@/services/api';

const state = {
  adminId: localStorage.getItem('adminId') || '',
  adminName: localStorage.getItem('adminName') || '管理员',
};

const mutations = {
  setAdminId(state, adminId) {
    state.adminId = adminId;
    localStorage.setItem('adminId', adminId);
  },
  clearAdminData(state) {
    state.adminId = '';
    state.adminName = '管理员';
    localStorage.removeItem('adminId');
  },
};

const actions = {
  async fetchCourses() {
    return await getCourses();
  },
  async addCourse(_, course) {
    await apiAddCourse(course);
  },
  async updateCourse(_, course) {
    await apiUpdateCourse(course);
  },
  async deleteCourse(_, courseId) {
    await apiDeleteCourse(courseId);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}; 