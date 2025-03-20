const state = {
  teacherId: localStorage.getItem('teacherId') || '',
  teacherName: localStorage.getItem('teacherName') || '用户',
  courseId: ''
};

const mutations = {
  setTeacherId(state, teacherId) {
    state.teacherId = teacherId;
    localStorage.setItem('teacherId', teacherId);
  },
  setTeacherName(state, teacherName) {
    state.teacherName = teacherName;
    localStorage.setItem('teacherName', teacherName);
  },
  setCourseId(state, courseId) {
    state.courseId = courseId;
  },
  clearTeacherData(state) {
    state.teacherId = '';
    state.teacherName = '用户';
    state.courseId = '';
    localStorage.removeItem('teacherId');
    localStorage.removeItem('teacherName');
  },
};

export default {
  namespaced: true,
  state,
  mutations,
}; 