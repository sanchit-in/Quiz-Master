export default {
  props: ['loggedIn'],
  template: `
    <div class="bg-container d-flex justify-content-center align-items-center vh-100">
      <div class="card p-4 shadow-lg bg-white bg-opacity-75" style="width: 22rem;">
        <h2 class="text-center mb-4 text-black">Login</h2>

        <div v-if="message" class="alert alert-danger">{{ message }}</div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input 
            type="text" 
            id="email" 
            v-model="formData.email" 
            class="form-control" 
            placeholder="Enter your email"
          />
        </div>

        <div class="mb-3">
          <label for="pass" class="form-label">Password</label>
          <input 
            type="password" 
            id="pass" 
            v-model="formData.password" 
            class="form-control" 
            placeholder="Enter your password"
          />
        </div>

        <button 
          @click="loginUser"
          class="btn btn-outline-dark w-100"
        >
          Sign In
        </button>
      </div>
    </div>
  `,
  data: function() {
    return {
      formData: {
        email: "",
        password: ""
      },
      message: ""
    };
  },
  methods: {
    loginUser: function () {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.formData)
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("id", data.id);
            localStorage.setItem("role", data.role);
            this.$emit("login");

            if (data.role.includes("admin")) {
              this.$router.push("/admin/dashboard");
            } else {  
              this.$router.push("/user/dashboard");
            }
          } else {
            this.message = data.message || "Login failed!";
          }
        })
        .catch(error => {
          console.error(error);
          this.message = "Something went wrong!";
        });
    }
  }
};
