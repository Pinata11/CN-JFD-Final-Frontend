<template>
  <div>
    <h1>Project Detail</h1>
    <div v-if="project">
      <p><strong>Project Name:</strong> {{ project.projectName }}</p>
      <p><strong>PIC Name:</strong> {{ project.PIC }}</p>
      <p><strong>Budget:</strong> {{ project.budget }}</p>
      <p><strong>Start Date:</strong> {{ project.startDate }}</p>
      <p><strong>End Date:</strong> {{ project.endDate }}</p>
      <div class="button-group">
        <button @click="createNewTask" class="create-btn">Create Task</button>
        <button @click="toggleInviteInput" class="inv-btn">Invite User</button>
      </div>
      <div v-if="showInviteInput">
        <input type="email" v-model="inviteEmail" placeholder="Enter email">
        <button @click="inviteUser" class="inv-btn" style="margin-top: 0;">Send Invitation</button>
      </div>
      
      <div ref="ganttContainer" style="width: 100%; height: 500px; padding-top: 15px;"></div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>

    <!-- Add Task Modal -->
    <div v-if="showCreateTaskModal">
      <div class="modal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">
              <span class="X"></span>
              <span class="Y"></span>
          </button>
          <h2>{{ taskModalTitle }}</h2>
          <form @submit.prevent="submitNewTask" class="form-disp">
            <label for="taskName">Task Name:</label>
            <input type="text" id="taskName" v-model="newTask.taskName" required>
            
            <label for="taskPIC">Task PIC:</label>
            <select id="taskPIC" v-model="newTask.taskPIC" required>
              <option disabled value="">Please select a user</option>
              <option v-for="user in projectUsers">{{ user}}</option>
            </select>
            
            <label for="taskBudget">Task Budget:</label>
            <input type="number" id="taskBudget" v-model="newTask.taskBudget" step="0.01" required>
            
            <label for="taskStartDate">Task Start Date:</label>
            <input type="date" id="taskStartDate" v-model="newTask.taskStartDate" required>
            
            <label for="taskEndDate">Task End Date:</label>
            <input type="date" id="taskEndDate" v-model="newTask.taskEndDate" required>
            
            <button type="submit" class="ct-btn">{{ taskModalAction }}</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Subtask Modal -->
    <div v-if="showCreateSubtaskModal">
      <div class="modal">
        <div class="modal-content">
          <button class="close-btn" @click="closeSubtaskModal">
              <span class="X"></span>
              <span class="Y"></span>
          </button>
          <h2>{{ subtaskModalTitle }}</h2>
          <form @submit.prevent="submitNewSubtask" class="form-disp">
            <label for="subtaskName">Subtask Name:</label>
            <input type="text" id="subtaskName" v-model="newSubtask.subtaskName" required>

            <label for="subtaskManPower">Man Power:</label>
            <input type="text" id="subtaskManPower" v-model="newSubtask.subtaskManPower" required>

            <label for="subtaskStartDate">Subtask Start Date:</label>
            <input type="date" id="subtaskStartDate" v-model="newSubtask.subtaskStartDate" required>

            <label for="subtaskEndDate">Subtask End Date:</label>
            <input type="date" id="subtaskEndDate" v-model="newSubtask.subtaskEndDate" required>

            <button type="submit">{{ subtaskModalAction}}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import '@babel/polyfill';
import { gantt } from 'dhtmlx-gantt';

export default {
  computed: {
    ...mapState('projects', ['project', 'showCreateTaskModal', 'tasks', 'loadingTasks','showCreateSubtaskModal', 'files', 'loadingFiles', 'filesError', 'projectUsers']), // Update computed properties
  },
  data() {
    return {
      newTask: {
        taskName: '',
        taskPIC: '',
        taskBudget: null,
        taskStartDate: null,
        taskEndDate: null,
        subtasks: [], // Initialize subtasks array
        files:[],
        projectUsers:[]
      },
      newSubtask: {
        subtaskName: '',
        subtaskManPower: null,
        subtaskStartDate: null,
        subtaskEndDate: null
      },
      selectedTaskId: null,
      taskModalTitle: '',
      taskModalAction: '',
      subtaskModalTitle: '',
      subtaskModalAction: '',
      inviteEmail:'',
      taskFile: {},
      showInviteInput: false
    };
  },
  mounted() {
    // Your existing mounted method
    window.updateSubtaskCompletion = this.updateSubtaskCompletion;
    window.handleFileUpload = this.handleFileUpload; 
    window.downloadFile = this.downloadFile;
    window.updateTaskComment = this.updateTaskComment;

    const projectId = this.$route.params.id;
    if (!projectId) {
        console.error('Project ID is not defined.');
        return;
    }
    this.getProjectById(projectId)
        .then(() => this.getProjectUsers(projectId))
        .then(() => this.getAllTasks(projectId))
        .then(() => {
            setTimeout(() => {
                this.initGantt();
                console.log('Tasks:', this.tasks);
                // Log each task and its associated files
                this.tasks.forEach(task => {
                    console.log(`Task ID: ${task.id}`);
                    console.log('Files:', task.files);
                });            }, 1000); // Adjust the delay time as needed
        })
        .catch(error => {
            console.error('Error initializing Gantt:', error);
        });
},
  methods: {
    ...mapActions('projects', ['getProjectById', 'createTask', 'toggleCreateTaskModal', 'getAllTasks', 'updateTaskAction', 'deleteTaskAction', 'createSubtask', 'toggleCreateSubtaskModal', 'updateSubtaskAction', 'deleteSubtaskAction', 'getAllSubtasks', 'inviteUserAction', 'uploadFileAction','getAllFile', 'downloadFileAction', 'getProjectUsers']),
    createNewTask() {
      this.resetNewTask(); // Reset newTask object before opening modal
      this.taskModalTitle = 'Create Task';
      this.taskModalAction = 'Add Task';
      this.toggleCreateTaskModal(true);
    },
    editTask(taskId) {
      
      const task = this.tasks.find(task => task.id === parseInt(taskId));
      // Set the newTask object with the task details
      this.newTask = {
        id: task.id,
        taskName: task.taskName,
        taskPIC: task.taskPIC,
        taskBudget: task.taskBudget,
        taskStartDate: task.taskStartDate,
        taskEndDate: task.taskEndDate
      };
      // Update modal title to "Edit Task"
      this.taskModalTitle = 'Edit Task'; 
      this.taskModalAction = 'Update Task'; 
      // Open the create task modal
      this.toggleCreateTaskModal(true);
    },
    closeModal() {
      this.toggleCreateTaskModal(false);
      this.resetNewTask(); // Reset newTask object when modal is closed
    },
    resetNewTask() {
    // Reset newTask object to its initial state
    this.newTask = {
      id: null,
      taskName: '',
      taskPIC: '',
      taskBudget: null,
      taskStartDate: null,
      taskEndDate: null,
      subtasks: [],
      files: []
    };
  },
    toggleInviteInput() {
      // Toggle the boolean value to show/hide the input field
      this.showInviteInput = !this.showInviteInput;
      if (!this.showInviteInput) {
        // Reset the input field when hiding it
        this.inviteEmail = '';
      }
    },
    inviteUser() {
        const projectId = this.project ? this.project.id : null;
        if (!projectId) {
            console.error('Project ID is not defined.');
            return;
        }
        // Get the email address from the input field
        const email = this.inviteEmail.trim();

        if (!email) {
            console.error('Please enter a valid email address.');
            return;
        }

        // Call the action to invite the user
        this.inviteUserAction({ projectId, invitedUserEmail: email }) // Pass an object with projectId and invitedUserEmail
            .then(() => {
                console.log('Invitation sent successfully.');
                // You can add further logic here, such as showing a success message
                this.toggleInviteInput(); // Hide the input field after sending invitation
            })
            .catch(error => {
                console.error('Error sending invitation:', error);
                // Handle errors appropriately, such as showing an error message
            });
    },
    createNewSubtask(taskId) {
      if (taskId) {
        this.resetNewSubtask(); // Reset newTask object before opening modal
        this.selectedTaskId = taskId;
        this.subtaskModalTitle = 'Create Subtask';
        this.subtaskModalAction = 'Add Subtask';
        this.toggleCreateSubtaskModal(true);
      } else {
        console.error('Task ID is not defined.');
      }
    },
    editSubtask(taskId, subtaskId){
      if (taskId) {
        this.selectedTaskId = parseInt(taskId);
        const task = this.tasks.find(task => task.id === parseInt(taskId));
        const subtask = task.subtasks.find(subtask => subtask.id === parseInt(subtaskId));
        this.newSubtask = {
          id: subtask.id,
          subtaskName: subtask.subtaskName,
          subtaskManPower: subtask.subtaskManPower,
          subtaskStartDate: subtask.subtaskStartDate,
          subtaskEndDate: subtask.subtaskEndDate
        };
        this.subtaskModalTitle = 'Edit Subtask';
        this.subtaskModalAction = 'Update Subtask';
        this.toggleCreateSubtaskModal(true);
      } else {
        console.error('Task ID is not defined');
      }
    },
    closeSubtaskModal() { 
      this.toggleCreateSubtaskModal(false);
      this.resetNewSubtask(); // Reset newTask object before opening modal
    },
    resetNewSubtask() {
    // Reset newTask object to its initial state
    this.newSubtask = {
      id: null,
      subtaskName: '',
      subtaskManPower: null,
      subtaskStartDate: null,
      subtaskEndDate: null
    };
  },
    submitNewTask() {
      const projectId = this.project ? this.project.id : null;
      if (!projectId) {
        console.error('Project ID is not defined.');
        return;
      }
      const taskData = { ...this.newTask };
      const action = this.newTask.id ? 'updateTaskAction' : 'createTask';
      const actionPayload = this.newTask.id ? { projectId, taskId: this.newTask.id, taskData } : {projectId, taskData};
      this[action](actionPayload)
        .then(() => {
          this.newTask = {
            id: null,
            taskName: '',
            taskPIC: '',
            taskBudget: null,
            taskStartDate: null,
            taskEndDate: null,
            subtasks: [], // Reset subtasks array after creating a task
            files: []
          };
          this.toggleCreateTaskModal(false);
          this.getAllTasks(projectId); // Fetch updated task list after creating a task
          this.updateGanttChart();
        })
        .catch(error => {
          console.error('Error adding task:', error);
        });
    },
    submitNewSubtask() {
      const projectId = this.project ? this.project.id : null;
      const taskId = this.selectedTaskId;
      if (!projectId || !taskId) {
        console.error('Project ID or Task ID is not defined.');
        return;
      }
      const subtaskData = { ...this.newSubtask, completed: false };
      const action = this.newSubtask.id ? 'updateSubtaskAction' : 'createSubtask';
      const actionPayload = this.newSubtask.id ? {projectId, taskId, subtaskId: this.newSubtask.id, subtaskData } : {projectId, taskId, subtaskData}
      this[action](actionPayload)
        .then(() => {
          this.closeSubtaskModal();
          this.updateGanttChart();
        })
        .catch(error => {
          console.error('Error adding subtask:', error);
        });
    },
    deleteTask(taskId) {
      const projectId = this.project ? this.project.id : null;
      if (!projectId) {
        console.error('Project ID is not defined.');
        return;
      }
      this.deleteTaskAction({ projectId, taskId })
        .then(() => {
        this.updateGanttChart();
      })
    },
    deleteSubtask(taskId, subtaskId) {
      const projectId = this.project ? this.project.id : null;
      if (!projectId) { 
        console.error('Project ID is not defined.');
        return;
      }
      this.deleteSubtaskAction({ projectId, taskId, subtaskId }) 
        .then(() => {
          this.updateGanttChart();
        })
    },
    handleFileUpload(taskId, file) {
      const projectId = this.project ? this.project.id : null;
      if (!projectId){
        console.error('Project ID is not defined.');
        return;
      }
      this.uploadFileAction({ projectId, taskId, file })
        .then(() => {
          this.updateGanttChart();
        })
    },
    downloadFile(taskId, fileId){
      const projectId = this.project ? this.project.id : null;
      if(!projectId){
        console.error('Project ID is not defined.');
        return;
      }
      this.downloadFileAction({ projectId, taskId, fileId})
        .then(() =>{
          console.log('Download Successful')
        })
    },
    updateGanttChart() {
    const projectId = this.$route.params.id;
    this.getProjectById(projectId)
        .then(() => this.getAllTasks(projectId))
        .then(() => {
            setTimeout(() => {
                gantt.clearAll();
                this.initGantt();
            }, 1000); // Adjust the delay time as needed
        })
        .catch(error => {
            console.error('Error initializing Gantt:', error);
        });

    },
    initGantt() {
      gantt.config.xml_date = '%Y-%m-%d'; // Optional: Set date format
      gantt.config.layout = {
        css: "gantt_container",
        cols: [
          {
            width:600,
            rows:[
              {view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer"}, 
      
              // horizontal scrollbar for the grid
              {view: "scrollbar", id: "gridScroll", group:"horizontal"} 
            ]
          },
          {resizer: true, width: 1},
          {
            rows:[
              {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
      
              // horizontal scrollbar for the timeline
              {view: "scrollbar", id: "scrollHor", group:"horizontal"}  
            ]
          },
          {view: "scrollbar", id: "scrollVer"}
        ]
      };
      gantt.config.columns = [
        {name: "text", label: "Task name", tree: true, width: '300'},
        {name: "start_date", label: "Start Date", align: "center",width: '100'},
        {name: "end_date", label: "End Date", align: "center", width: '100'}, // Add column for End Date
        {name: "duration", label: "duration", align: "center", width: '100'},
        {name: "buttons", label: "buttons", align: "center", width: '150', template: function (task){
          if (gantt.getParent(task.id) !== 0) { // Check if the task has a parent
            return `<button id="editBtn_${task.id}" class="btn btn-outline-primary" data-action="edit subtask"><i class="fas fa-edit"></i></button>
                    <button id="deleteBtn_${task.id}" class="btn btn-outline-danger btn-sm" data-action="delete subtask"><i class="fas fa-trash"></i></button>`;
          } else {
            return `<button id="addBtn_${task.id}" class="btn btn-outline-success btn-sm" data-action="add task"><i class="fas fa-plus"></i></button>
                    <button id="editBtn_${task.id}" class="btn btn-outline-primary btn-sm" data-action="edit task"><i class="fas fa-edit"></i></button>
                    <button id="deleteBtn_${task.id}" class="btn btn-outline-danger btn-sm" data-action="delete task"><i class="fas fa-trash"></i></button>
                    <input type="file" id="file_${task.id}" style="display:none">
                    <button id="uploadBtn_${task.id}" class="btn btn-outline-dark btn-sm" data-action="upload task"><i class="fas fa-upload"></i></button>`;
          }
        }}
      ];

      gantt.showLightbox = function(id) {
    const task = gantt.getTask(id);
    const isSubtask = gantt.getParent(id) !== 0;

    if (isSubtask) {
        // Do not show lightbox for subtasks
        return;
    }

    // Determine project status
    const today = new Date();
    const endDate = new Date(task.end_date);
    let projectStatus = 'Planned';
    let reminderMessage = '';

    if (today > endDate && task.progress < 1) {
        projectStatus = 'Overdue';
        reminderMessage = '<div style="color: red; font-weight: bold; margin-top: 10px;">This project is overdue!</div>';
    } else if (task.progress === 1) {
        projectStatus = 'Completed';
    } else if (today >= new Date(task.start_date)) {
        projectStatus = 'Ongoing';
    }

    const customLightboxHTML = `
    <div class="custom-lightbox">
        <div>
            <label>Task Name:</label>
            <input type="text" id="taskName" value="${task.text}" readonly>
        </div>
        <div>
            <label>PIC:</label>
            <input type="text" id="endDate" value="${task.PIC}" readonly>
        </div>
        <div>
            <label>Budget:</label>
            <input type="text" id="endDate" value="${task.budget}" readonly>
        </div>
        <div>
            <label>Progress:</label>
            <input type="text" id="endDate" value="${task.progress}" readonly>
        </div>
        <div>
            <label>Man Power:</label>
            <input type="text" id="endDate" value="${task.man_power}" readonly>
        </div>
        <div>
            <label>File Name:</label>
            <a href="#" onclick="downloadFile('${task.id}', '${task.fileId}')">${task.fileName}</a>
        </div>
        <div>
            <label>Project Status:</label>
            <input type="text" id="projectStatus" value="${projectStatus}" readonly>
        </div>
        <div>
            <label>Comment:</label>
            <textarea id="taskComment" rows="4" style="width:100%;">${task.comment || ''}</textarea>
        </div>
        ${reminderMessage}
        <button id="closeLightboxBtn">Close</button>
    </div>`;

    // Show the custom lightbox
    const lightbox = gantt.modalbox({
        title: "Task Details",
        text: customLightboxHTML,
        width: "800px",
    });

    const style = document.createElement("style");
    style.textContent = `
        .gantt_modal_box {
            position: absolute;
        }
        .custom-lightbox {
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .custom-lightbox label {
            font-weight: bold;
        }
        .custom-lightbox input[type="text"] {
            width: 100%;
            padding: 8px;
            margin-top: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .custom-lightbox button {
            margin-top: 10px;
            padding: 8px 15px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .custom-lightbox button:hover {
            background-color: #0056b3;
        }
    `;
    document.head.appendChild(style);

    const closeButton = document.getElementById("closeLightboxBtn");
    closeButton.addEventListener("click", () => {
        const taskId = id;
        const comment = document.getElementById("taskComment").value; // Get the comment from the textarea
        window.updateTaskComment(taskId, comment)
            .then(() => {
                // Update the comment in the Gantt chart UI if needed
                const task = gantt.getTask(taskId);
                if (task) {
                    task.comment = comment;
                    gantt.updateTask(taskId);
                }

                gantt.modalbox.hide(lightbox); // Hide the lightbox when close button is clicked
            });
    });
}

      gantt.attachEvent("onTaskClick", (id, e) => {
    const button = e.target.closest("[data-action]");
    if (button) {
        const action = button.getAttribute("data-action");
        switch (action) {
            case "edit task":
                console.log('ID:',id);
                this.editTask(id);
                break;
            case "add task":
                console.log('ID:',id);
                this.createNewSubtask(id);
                break;
            case "delete task":
                console.log('ID:',id);
                this.deleteTask(id);
                break;
            case "upload task":
                const fileInput = document.getElementById(`file_${id}`);
                if (fileInput) {
                  fileInput.click(); // Trigger click on the hidden file input
                  if (!fileInput.uploadEventListenerAdded) {
                    fileInput.uploadEventListenerAdded = true;
                    fileInput.addEventListener('change', function() {
                      handleFileUpload(id, fileInput.files[0]);
                    });
                  }
                }
                break;
            case "edit subtask":
              const [taskId, subtaskId] = id.split('-');
              console.log('Task ID:',taskId);
              console.log('Subtask ID:',subtaskId);
              this.editSubtask(taskId, subtaskId)
              break;
            case "delete subtask":
              const [TaskId, SubtaskId] = id.split('-');
              console.log('Task ID:',TaskId);
              console.log('Subtask ID:',SubtaskId);
              this.deleteSubtask(TaskId, SubtaskId)
              break;
        }
        return false;
    }
    return true;
});
      gantt.templates.grid_blank = function(task) {
        return `<input type="checkbox" id="ch-${task.id}" onchange="updateSubtaskCompletion('${task.id}', this.checked)" ${task.checked ? 'checked' : ''}>`;
      };
      gantt.init(this.$refs.ganttContainer);
      gantt.parse(this.prepareGanttData()); // Parse your Gantt chart data here
    },
    prepareGanttData() {
      const ganttData = [];

      this.tasks.forEach(task => {
        let totalManPower = 0; // Initialize total manpower for the parent task

    // Calculate total manpower for the parent task from its subtasks
    if (task.subtasks && task.subtasks.length) {
      task.subtasks.forEach(subtask => {
        totalManPower += subtask.subtaskManPower;
      });
    }
    // this.getFileForTask(task.id)
    // console.log('File Name:', this.taskFile)

        ganttData.push({
          id: task.id,
          text: task.taskName,
          start_date: task.taskStartDate,
          end_date:task.taskEndDate,
          PIC: task.taskPIC,
          budget: task.taskBudget,
          comment: task.comment,
          duration: Math.ceil((new Date(task.taskEndDate) - new Date(task.taskStartDate)) / (1000 * 60 * 60 * 24)),
          man_power: totalManPower,
          progress: this.getTaskCompletionPercentage(task),
          fileName: task.files ? task.files.map(file => file.name).join(', ') : '' ,
          fileId: task.files ? task.files.map(file => file.id).join(', ') : '' // Include fileId here
        });

        if (task.subtasks && task.subtasks.length) {
          task.subtasks.forEach(subtask => {
            ganttData.push({
              id: `${task.id}-${subtask.id}`,
              text: subtask.subtaskName,
              start_date: subtask.subtaskStartDate,
              end_date: subtask.subtaskEndDate,
              man_power: subtask.subtaskManPower,
              duration: Math.ceil((new Date(subtask.subtaskEndDate) - new Date(subtask.subtaskStartDate)) / (1000 * 60 * 60 * 24)),
              parent: task.id,
              checked: subtask.completed // Add a checked property based on subtask completion
            });
          });
        }
        // console.log('Data:', ganttData);
      });
      return { data: ganttData };
    },
    updateSubtaskCompletion(subtaskId, checked) {
        const [taskId, subId] = subtaskId.split('-');
        console.log('Updating subtask completion:', subId, checked);
        console.log('Task ID:', taskId);
        
        // Step 1: Verify Subtask ID
        console.log('All tasks:', this.tasks);
        
        const subtask = this.getSubtaskById(subId);
        console.log('Found subtask:', subtask);

        if (subtask) {
        // Update the completed property of the subtask
        subtask.completed = checked;
        console.log('Subtask updated:', subtask);

        // Dispatch an action to update the subtask completion status in the Vuex store
        const projectId = this.project ? this.project.id : null;
        if (!projectId) {
          console.error('Project ID is not defined.');
          return;
        }

        console.log("Proj ID:", projectId)
        console.log("Task ID:", taskId)
        console.log("Sub ID:", subId)
        console.log("Data:", checked)


        // Prepare data to be dispatched to the Vuex action
        const actionPayload = {
          projectId: projectId,
          taskId: taskId,
          subtaskId: subId,
          subtaskData: {completed: checked}
        };

        // Dispatch the action
        this.updateSubtaskAction(actionPayload)
          .then(() => {
            console.log('Subtask completion updated in the Vuex store.');
            this.updateGanttChart();
            // You might want to perform further actions here, such as updating UI or showing a success message
          })
          .catch(error => {
            console.error('Error updating subtask completion in the Vuex store:', error);
            // Handle errors appropriately, such as showing an error message
          });
      } else {
        console.error('Subtask not found.');
      }
    },
    getSubtaskById(subId) {
      // Step 2: Check Task Data
      subId = parseInt(subId); // Parse subId to a number
      console.log('Finding subtask by ID:', subId);
      console.log('All tasks:', this.tasks);

      // Iterate through tasks and subtasks to find the matching subtask
      for (const task of this.tasks) {
          console.log('Checking task:', task.id);
          const subtask = task.subtasks.find(subtask => subtask.id === subId); // Change variable name from subtask to sub
          if (subtask) {
              console.log('Subtask found:', subtask);
              return subtask;
          }
      }
      console.warn('Subtask not found.');
      return null; // Subtask not found
    },
    getTaskCompletionPercentage(task) {
      if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
      }
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed);
        return ((completedSubtasks.length / task.subtasks.length) * 100).toFixed(2);
    },
    updateTaskComment(taskId, comment) {
        const projectId = this.project ? this.project.id : null;
        if (!projectId) {
            console.error('Project ID is not defined.');
            return Promise.reject('Project ID is not defined.');
        }

        // Assuming you have an action in your Vuex store to update task comment
        return this.updateTaskAction({ projectId, taskId, taskData: { comment } });
    },

  },
};
</script>

<style scoped>
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

.create-btn {
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #414141;
  color: black;
  background-color: transparent;
  cursor: pointer;
  border-radius: 10px;
  text-transform: uppercase;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
}

.create-btn:hover {
  border-color: #f10909;
  box-shadow: 0 0 20px rgba(241, 9, 9, 0.8);
}

.create-btn:active {
  box-shadow: 0 0 10px rgba(241, 9, 9, 0.4);
}

.inv-btn {
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #414141;
  color: black;
  background-color: transparent;
  cursor: pointer;
  border-radius: 10px;
  text-transform: uppercase;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
}

.inv-btn:hover {
  border-color: #2409f1;
  box-shadow: 0 0 20px rgba(17, 9, 241, 0.8);
}

.inv-btn:active {
  box-shadow: 0 0 10px rgba(24, 9, 241, 0.4);
}

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

.ct-btn {
  appearance: none;
  background-color: transparent;
  border: 0.125em solid #ff0000;
  border-radius: 1em;
  box-sizing: border-box;
  color: #ff0000;
  cursor: pointer;
  display: inline-block;
  font-family: Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  min-height: 1em;
  min-width: 0;
  outline: none;
  padding: 0.6em 1.6em;
  text-align: center;
  text-decoration: none;
  transition: all 300ms cubic-bezier(.23, 1, 0.32, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  will-change: transform;
}
.ct-btn:disabled {
  pointer-events: none;
}
.ct-btn:hover {
  color: #fff;
  background-color: #ff0000;
  box-shadow: rgba(255, 0, 0, 0.25) 0 8px 15px;
  transform: translateY(-1px);
}
.ct-btn:active {
  box-shadow: none;
  transform: translateY(0);
}
</style>