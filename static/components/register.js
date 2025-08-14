export default{
    template:`
   <div class="bg-container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg bg-white bg-opacity-75" style="width: 24rem;">
      <h2 class="text-center mb-4 text-black">Register</h2>

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
        <label for="full_name" class="form-label">Full Name</label>
        <input 
          type="text" 
          id="full_name" 
          v-model="formData.full_name" 
          class="form-control" 
          placeholder="Enter your full name"
        />
      </div>

      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="formData.username" 
          class="form-control" 
          placeholder="Choose a username"
        />
      </div>

      <div class="mb-4">
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
        @click="addUser"
        class="btn btn-outline-dark w-100"
      >
        Register
      </button>
    </div>
  </div>
`,
  data: function() {
    return {
      formData:{
        email: "",
        full_name: "",
        username: "",
        password: ""
        
      }
    }
  },
  methods:{
    addUser : function(){
      fetch('/api/register' , {
        method: 'POST',
        headers: {
          "Content-Type" : 'application/json'
        },
        body: JSON.stringify(this.formData)
      })
      .then(response => response.json())
      .then(data => {
            alert(data.message)
            this.$router.push('/login')
      })
  }
}       
}
