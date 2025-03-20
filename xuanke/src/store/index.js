import { createStore } from 'vuex';
import student from './modules/student';
import teacher from './modules/teacher';
import admin from './modules/admin';
import { login as apiLogin } from '@/services/api';

const store = createStore({
  state: {
    identity: localStorage.getItem('identity') || '',
    token: localStorage.getItem('token') || '',
  },
  mutations: {
    setIdentity(state, identity) {
      state.identity = identity;
      localStorage.setItem('identity', identity);
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    clearAuthData(state) {
      state.identity = '';
      state.token = '';
      localStorage.removeItem('identity');
      localStorage.removeItem('token');
    },
  },
  actions: {
    async login({ commit, dispatch }, { identity, username, password }) {
      try {
        const response = await apiLogin(identity, username, password);
        commit('setToken', response.token);
        commit('setIdentity', identity);

        if (identity === 'student') {
          commit('student/setStudentId', response.studentId, { root: true });
          commit('student/setStudentName', response.name, { root: true });
          await dispatch('student/fetchStudentSelections', null, { root: true });
        } else if (identity === 'teacher') {
          commit('teacher/setTeacherId', response.teacherId, { root: true });
          commit('teacher/setTeacherName', response.name, { root: true });
        } else if (identity === 'admin') {
          commit('admin/setAdminId', response.adminId, { root: true });
        }
      } catch (error) {
        throw new Error(error.response.data.message || '登录失败');
      }
    },
    logout({ commit }) {
      commit('clearAuthData');
      commit('student/clearStudentData', null, { root: true });
      commit('teacher/clearTeacherData', null, { root: true });
      commit('admin/clearAdminData', null, { root: true });
    },
  },
  modules: {
    student,
    teacher,
    admin,
  },
});

export default store;