import { userService } from '../_services';
import { router } from '../_helpers';

const user = JSON.parse(localStorage.getItem('user'));
const state = user
    ? { status: { loggedIn: true }, user }
    : { status: {}, user: null };

const actions = {
    login({ dispatch, commit }, { email, password }) {
        commit('loginRequest', { email });
    
        userService.login(email, password)
            .then(
                user => {
                    commit('loginSuccess', user);
                    router.push('/');
                },
                error => {
                    commit('loginFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    },
    logout({ commit }) {
        userService.logout();
        commit('logout');
    },
    register({ dispatch, commit }, user) {
        commit('registerRequest', user);
    
        userService.register(user)
            .then(
                user => {
                    commit('registerSuccess', user);
                    router.push('/login');
                    setTimeout(() => {
                        // display success message after route change completes
                        dispatch('alert/success', 'Registration successful', { root: true });
                    })
                },
                error => {
                    commit('registerFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    },
    sendOTP({ dispatch, commit }, email) {
    
        // Proceed with sending OTP
        commit('sendOTPRequest');
    
        userService.sendOTP(email)
            .then(
                () => {
                    commit('sendOTPSuccess');
                    dispatch('alert/success', 'OTP sent successfully', { root: true });
                },
                error => {
                    commit('sendOTPFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    }    
};

const mutations = {
    loginRequest(state, user) {
        state.status = { loggingIn: true };
        state.user = user;
    },
    loginSuccess(state, user) {
        state.status = { loggedIn: true };
        state.user = user;
        localStorage.setItem('token', user.token);

    },
    loginFailure(state) {
        state.status = {};
        state.user = null;
    },
    logout(state) {
        state.status = {};
        state.user = null;
    },
    registerRequest(state, user) {
        state.status = { registering: true };
    },
    registerSuccess(state, user) {
        state.status = {};
    },
    registerFailure(state, error) {
        state.status = {};
    },
    sendOTPRequest(state) {
        state.status = { sendingOTP: true };
    },
    sendOTPSuccess(state) {
        state.status = {};
    },
    sendOTPFailure(state) {
        state.status = {};
    }
};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};