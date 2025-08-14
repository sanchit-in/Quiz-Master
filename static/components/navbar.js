export default {
  props: ['loggedIn'],
  template: `
  <div class="d-flex justify-content-end align-items-center border rounded py-2 px-3 shadow-sm" style="background:white;">
  <div class="d-flex gap-2">
    <router-link v-if="!loggedIn" class="btn btn-outline-secondary fw-bold px-3 py-1" to="/login">Login</router-link>
    <router-link v-if="!loggedIn" class="btn btn-outline-warning fw-bold px-3 py-1" to="/register">Register</router-link>
    <button v-if="loggedIn" @click="logoutUser" class="btn btn-danger fw-bold px-3 py-1">Logout</button>
  </div>
</div>
`,
  computed: {
    userRole() {
      return localStorage.getItem('role') || '';
    }
  },
  methods: {
    logoutUser() {
      localStorage.clear();
      this.$emit('logout');
      this.$router.push('/login');
    }
  }
};
