<template>
    <div>
        <h1>Project Management</h1>
        <div class="button-group">
            <button @click="createNewProject" class="cp-btn">Create Project</button>
            <button @click="handleLogout" class="logout-btn">
                <div class="logout-sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
                <div class="logout-text">Logout</div>
            </button>
        </div>
        <div v-if="projects && projects.items && projects.items.length > 0" style="display: inline-table;">
            <h1 style="padding: 10px 0 0 0; font-weight: 400;">Projects</h1>
            <ul style="display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-around;
                padding: 0;
                margin: 0;
                list-style: none;">
                <li v-for="project in projects.items" :key="project.id"
                    style="padding: 5px; margin-top: 10px;">
                    <div class="Animation">
                        <router-link :to="'/projects/' + project.id">
                            <div class="info-card">
                                <div class="info">
                                    <strong>{{ project.projectName }}</strong>
                                    <p>PIC: {{ project.PIC }}</p>
                                    <p>Budget: {{ project.budget }}</p>
                                    <button v-if="projects && projects.items" @click="deleteProject(project.id)" class="btn btn-danger"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>No projects available.</p>
        </div>
        
        <div v-if="showCreateProjectModal">
            <div class="modal">
                <div class="modal-content">
                    <button class="close-btn" @click="closeModal">
                        <span class="X"></span>
                        <span class="Y"></span>
                    </button>
                    <h2>Create New Project</h2>
                    <form @submit.prevent="submitNewProject" class="form-disp">
                        <label for="projectName">Project Name:</label>
                        <input type="text" id="projectName" v-model="newProject.projectName" required>
                        
                        <label for="PIC">PIC Name:</label>
                        <textarea id="PIC" v-model="newProject.PIC" required></textarea>
        
                        <label for="budget">Budget:</label>
                        <input type="number" id="budget" v-model="newProject.budget" step="0.01" required>
        
                        <label for="startDate">Start Date:</label>
                        <input type="date" id="startDate" v-model="newProject.startDate" required>
        
                        <label for="endDate">End Date:</label>
                        <input type="date" id="endDate" v-model="newProject.endDate" required>
                        
                        <button type="submit" class="create-btn">
                            <span>Create</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import axios from 'axios'; // Import Axios


export default {
    computed: {
        ...mapState('projects', ['projects']),
        showCreateProjectModal() {
            return this.$store.state.projects.showCreateProjectModal;
        }
    },
    data() {
        return {
            newProject: {
                projectName: '',
                PIC: '',
                budget: null,
                startDate: null,
                endDate: null
            }
        };
    },
    methods: {
        ...mapActions('projects', ['create', 'toggleCreateProjectModal', 'getAll', 'delete']),
        createNewProject() {
            this.toggleCreateProjectModal(true);
        },
        closeModal() {
            this.toggleCreateProjectModal(false);
        },
        submitNewProject() {
            const project = { ...this.newProject };

            this.create(project)
                .then(() => {
                    this.newProject = {
                        projectName: '',
                        PIC: '',
                        budget: null,
                        startDate: null,
                        endDate: null
                    };
                    this.toggleCreateProjectModal(false);
                    setTimeout(() => {
                        this.getAll();
                    }, 500);
                })
                .catch(error => {
                    console.error('Error creating project:', error);
                    // Handle error (e.g., show error message)
                });
        },
        handleLogout() {
            this.$router.push('/login');
        },
        deleteProject(id) {
            if (confirm('Are you sure you want to delete this project?')) {
                this.delete(id)
                    .then(() => {
                        // Trigger refresh by fetching all projects again
                        this.projects.items = this.projects.items.filter(project => project.id !== id);
                    })
                    .catch(error => {
                        console.error('Error deleting project:', error);
                        // Handle error (e.g., show error message)
                    });
            }
        }
    },
    created(){
        // Fetch all projects when the component is created
        this.getAll();
    }
};
</script>

<style scoped>
ul {
list-style-type: none; 
padding: 0;
}

/* Project card animation */
.Animation {
--hoverContorno: #ff0000;
display: block;
position: relative;
width: fit-content;
}

.Animation:hover,
.Animation:focus {
-webkit-animation: cardAnimacion 1.5s;
animation: cardAnimacion 1.5s;
box-shadow: 0 0 0 0.8em rgba(255, 0, 0, 0);
border-radius: 20px;
}

@-webkit-keyframes cardAnimacion {
0% {
box-shadow: 0 0 0 0 var(--hoverContorno);
}
}

@keyframes cardAnimacion {
0% {
box-shadow: 0 0 0 0 var(--hoverContorno);
}
}

/* Projects card */
.info-card {
position: relative;
text-decoration: none;
color: rgb(255, 0, 0);
width: 300px;
height: auto;
margin-top: 10px;
padding: 20px;
border: 2px solid #ff0000;
border-radius: 20px;
transition: all 0.5s;
}

.info-card:hover {
color: rgb(255, 0, 0);
background-position: -80% 0;
transition: all 1s;
}

.info-card strong{
font-size:24px;
}

.info-card p {
display: none;
}

.info-card:hover p {
display: block;
}

.info-card button {
display: none;
}

.info-card:hover button {
display: block;
}

/* Create project modal */
.modal {
display: block;
position: fixed;
z-index: 1;
left: 0;
top: 0;
width: 100%;
height: 100%;
overflow: auto;
background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
background-color: #fefefe;
margin: 11% auto;
padding: 20px;
border: 2px solid #ff7777;
width: 40%;
gap: 5px;
left: 0px;
display: flexbox;
}

.close {
color: #aaa;
float: right;
font-size: 28px;
font-weight: bold;
}

.close:hover,
.close:focus {
color: black;
text-decoration: none;
cursor: pointer;
}

.button-group {
display: flex;
align-items: center;
gap: 5px;
}

/* create project button */
.cp-btn {
background-color: white;
font-family: inherit;
display: inline-block;
width: 9em;
height: 2.7em;
line-height: 2.5em;
overflow: hidden;
margin: 10px;
margin-left: 0px;
font-size: 14px;
z-index: 1;
color: red;
border: 2px solid red;
border-radius: 6px;
position: relative;
outline: none;
}

.cp-btn::before {
position: absolute;
content: "";
background: red;
width:190px;
height: 240px;
z-index: -1;
border-radius: 50%;
}

.cp-btn:hover {
color: white;
}

.cp-btn:before {
top: 100%;
left: 100%;
transition: .3s all;
}

.cp-btn:hover::before {
top: -30px;
left: -30px;
}

/* logout button */
.logout-btn {
display: flex;
align-items: center;
justify-content: flex-start;
width: 40px;
height: 40px;
border: none;
border-radius: 5px;
cursor: pointer;
position: relative;
overflow: hidden;
transition-duration: .3s;
box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
background-color: rgb(255,65,65);
}

.logout-sign {
width: 100%;
transition-duration: .3s;
display: flex;
align-items: center;
justify-content: center;
}

.logout-sign svg {
width: 14px;
}

.logout-sign svg path {
fill: white;
}

.logout-text {
position: absolute;
right: 0%;
width: 0%;
opacity: 0;
color: white;
font-size: 14px;
font-weight: 600;
transition-duration: .3s;
}

.logout-btn:hover {
width: 125px;
border-radius: 5px;
transition-duration: .3s;
}

.logout-btn:hover .logout-sign {
width: 30%;
transition-duration: .3s;
padding-left: 20px;
}

.logout-btn:hover .logout-text {
opacity: 1;
width: 70%;
transition-duration: .3s;
padding-right: 10px;
}

.logout-btn:active {
transform: translate(2px ,2px);
}

/* form close button */
.close-btn {
position: relative;
display: fixed;
left: 0px;
width: 2em;
height: 2em;
border: none;
background: rgb(255, 255, 255);
border-radius: 5px;
transition: background 0.5s;
}

.X {
content: "";
position: absolute;
top: 50%;
left: 50%;
width: 1em;
height: 1px;
background-color: rgb(0, 0, 0);
transform: translateX(-50%) rotate(45deg);
}

.Y {
content: "";
position: absolute;
top: 50%;
left: 50%;
width: 1em;
height: 1px;
background-color: #000000;
transform: translateX(-50%) rotate(-45deg);
}

.close-btn:hover {
background-color: rgb(255, 155, 155);
}

.close-btn:active {
background-color: rgb(130, 0, 0);
outline: none;
}

/* form display */
.form-disp {
display: grid;
grid-template-columns: max-content min-content;
grid-gap: 10px;
}

.form-disp label { text-align: right; }
.form-disp input, textarea {
border: 1px solid #d2a1a1;
border-radius: 5px;
background-color: #fff;
padding: 3px 5px;
box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);
width: 190px;
outline: none;
}

[type="date"] {
background:#fff url(https://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/calendar_2.png)  97% 50% no-repeat ;
}
[type="date"]::-webkit-inner-spin-button {
display: none;
}
[type="date"]::-webkit-calendar-picker-indicator {
opacity: 0;
}

/* create button */
.create-btn {
position: relative;
font-family: inherit;
font-weight: 500;
font-size: 16px;
margin-top: 10px;
letter-spacing: 0.05em;
border-radius: 0.8em;
cursor: pointer;
border: none;
background: linear-gradient(to right, #e22d2d, #e00000);
color: ghostwhite;
overflow: hidden;
}

.create-btn span {
position: relative;
z-index: 10;
transition: color 0.4s;
display: inline-flex;
align-items: center;
padding: 0.5em 1em;
}

.create-btn::before,
.create-btn::after {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
z-index: 1;
}

.create-btn::before {
content: "";
background: #000;
width: 120%;
left: -10%;
transform: skew(30deg);
transition: transform 0.4s cubic-bezier(0.3, 1, 0.8, 1);
}

.create-btn:hover::before {
transform: translate3d(100%, 0, 0);
}

.create-btn:active {
transform: scale(0.95);
border: none;
outline: none;
}
</style>