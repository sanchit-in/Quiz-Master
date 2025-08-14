import home from './components/home.js'
import login from './components/login.js'
import register from './components/register.js'
import navbar from './components/navbar.js'
import footer from './components/footer.js'
import dashboard from './components/dashboard.js'
import admin_dashboard from './components/admin_dashboard.js'
import admin_chapters from './components/admin_chapters.js'
import admin_quizzes from './components/admin_quizzes.js'
import admin_questions from './components/admin_questions.js'
import start_quiz from './components/start_quiz.js'
import summary from './components/summary.js'
import scores from './components/scores.js'
import User from './components/User.js'



const routes = [
    {path: '/', component: home},
    {path: '/login', component: login},
    {path: '/register', component: register},
    {path: '/user/dashboard', component: dashboard},
    {path: '/admin/dashboard', component: admin_dashboard},
    {path: '/admin/subject/:id/chapters', component:admin_chapters},
    {path: '/admin/subject/:id/chapters/:chapter_id/quizzes',component:admin_quizzes},
    {path: '/admin/subject/:id/chapters/:chapter_id/quizzes/:quiz_id/questions',component:admin_questions},
    {path:'/user/dashboard/quiz/:quiz_id',component: start_quiz},
    {path:'/admin/summary', component:summary},
    {path:'/scores', component: scores },
    {path:'/admin/user' , component: User}
]

const router = new VueRouter({
    routes // route: route
})

const app = new Vue({
    el: "#app" , 
    router , // router: router
    template : `
    <div class = "container">
        <nav-bar :loggedIn = 'loggedIn' @logout="handleLogout" > </nav-bar>
        <router-view  :loggedIn = 'loggedIn' @login="handleLogin">  </router-view>
        <foot> </foot>
    </div>

    `,
    data : {
        loggedIn: !!localStorage.getItem("token"),
        userRole: localStorage.getItem("role") || ""
    },
    components:{
        "nav-bar": navbar,
        "foot": footer

    },

    methods:{
        handleLogout(){
            localStorage.clear(); 
            this.loggedIn = false; 
            this.userRole = "";
            this.$router.push("/login"); 

        },
        handleLogin(){
            this.loggedIn = true;
            this.userRole = localStorage.getItem("role") || "";

        }
    },
    mounted() {
        // Ensure navbar updates when the page is reloaded
        this.loggedIn = !!localStorage.getItem("token");
        this.userRole = localStorage.getItem("role") || "";
    }
})