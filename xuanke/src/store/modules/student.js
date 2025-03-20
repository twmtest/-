import { getStudentSelections, applyCourse as apiApplyCourse } from '@/services/api';

const state = {
  studentId: localStorage.getItem('studentId') || '',
  studentName: localStorage.getItem('studentName') || '用户',
  selectedCourses: new Set(),
};

const mutations = {
  setStudentId(state, studentId) {
    state.studentId = studentId;
    localStorage.setItem('studentId', studentId);
  },
  setStudentName(state, studentName) {
    state.studentName = studentName;
    localStorage.setItem('studentName', studentName);
  },
  setSelectedCourses(state, courses) {
    state.selectedCourses = new Set(courses.map(course => course.course_id));
  },
  clearStudentData(state) {
    state.studentId = '';
    state.studentName = '用户';
    state.selectedCourses.clear();
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
  },
};

const actions = {
  async fetchStudentSelections({ commit, state }) {
    const selections = await getStudentSelections(state.studentId);
    commit('setSelectedCourses', selections);
  },
  async applyCourse({ state }, courseId) {
    try {
      await apiApplyCourse(state.studentId, courseId);
    } catch (error) {
      throw new Error(error.response.data.message || '申请课程失败');
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}; 