    import { projectService } from '../_services/project.service';

    const state = {
        showCreateProjectModal: false,
        showCreateTaskModal: false,
        showCreateSubtaskModal: false,
        projects: { items: [], loading: false, creating: false, updating: false },
        project: null,
        userProject: null,
        tasks: [], // Initialize tasks array
        subtasks: [],
        files:[],
        projectUsers:[],
        downloadingFile: false,
        downloadFileError: null
    };       

    const actions = {

        toggleCreateProjectModal({ commit }, value) {
            commit('TOGGLE_CREATE_PROJECT_MODAL', value);
        },
        toggleCreateTaskModal({ commit }, value) {
            commit('TOGGLE_CREATE_TASK_MODAL', value);
        },
        toggleCreateSubtaskModal({ commit }, value) {
            commit('TOGGLE_CREATE_SUBTASK_MODAL', value);
        },
        create({ commit }, projectData) {
            commit('createRequest');

            projectService.create(projectData)
                .then(
                    newProject => commit('createSuccess', newProject),
                    error => commit('createFailure', error)
                );
        },

        update({ commit }, projectData  ) {
            commit('updateRequest');

            projectService.update(projectData)
                .then(
                    updatedProject => commit('updateSuccess', updatedProject),
                    error => commit('updateFailure', error)
                );
        },

        getAll({ commit }) {
            commit('getAllRequest');

            projectService.getAll()
                .then(
                    projects => commit('getAllSuccess', projects),
                    error => commit('getAllFailure', error)
                );
        },

        getProjectUsers({ commit }, id) {
            commit('getProjectUserRequest');

            projectService.getProjectUsers(id)
                .then(
                    projectUsers => commit('getProjectUserSuccess', projectUsers),
                    error => commit('getProjectUserFailure', error)
                );
        },

        delete({ commit }, id) {
            commit('deleteRequest', id);

            projectService.delete(id)
                .then(
                    projects => commit('deleteSuccess', id),
                    error => commit('deleteFailure', { id, error: error.toString() })
                );
        },

        getProjectById({ commit }, id) {
            commit('getProjectRequest');

            projectService.getById(id)
                .then(
                    project => commit('getProjectSuccess', project),
                    error => commit('getProjectFailure', error)
                );
        },
        createTask({ commit }, { projectId, taskData }) {
            commit('createTaskRequest');
        
            // Assuming projectService.createTask is your API call to create a task
            return projectService.createTask(projectId, taskData)
            .then(
                newTask => commit('createTaskSuccess', newTask),
                error => commit('createTaskFailure', error)
            );
        },
        getAllTasks({ commit, dispatch }, projectId) {
            commit('getAllTasksRequest');
            return projectService.getAllTasks(projectId)
              .then(
                tasks => {
                  commit('getAllTasksSuccess', tasks);
                  // Create an array to hold all subtask fetching promises
                  const subtaskPromises = tasks.map(task => 
                    dispatch('getAllSubtasks', { projectId, taskId: task.id })
                      .then(subtasks => {
                        return dispatch('getAllFile', { projectId, taskId: task.id });
                      })
                      .catch(error => {
                        console.error('Error fetching subtasks for task:', error);
                      })
                  );
                  // Return a promise that resolves when all subtask fetching promises resolve
                  return Promise.all(subtaskPromises);
                },
                error => {
                  commit('getAllTasksFailure', error);
                  console.error('Error fetching tasks:', error);
                }
              );
          },
        updateTaskAction({commit}, { projectId, taskId, taskData }){
            commit('updateTaskRequest', taskId);
            return projectService.updateTask(projectId, taskId, taskData)
                .then(
                    updatedTask => commit('updateTaskSuccess', { taskId, updatedTask}),
                    error => commit('updateTaskFailure', { taskId, error})
                );
        },
        deleteTaskAction({ commit }, { projectId, taskId }) {
            commit('deleteTaskRequest', taskId);
        
            // Assuming projectService.deleteTask is your API call to delete a task
            return projectService.deleteTask(projectId, taskId)
            .then(
                () => commit('deleteTaskSuccess', taskId),
                error => commit('deleteTaskFailure', { taskId, error })
            );
        },
        createSubtask({ commit }, { projectId, taskId, subtaskData }) {
            commit('createSubtaskRequest');
        
            // Assuming projectService.createSubtask is your API call to create a subtask
            return projectService.createSubtask(projectId, taskId, subtaskData)
            .then(
                newSubtask => commit('createSubtaskSuccess', { taskId, newSubtask }), // Pass taskId to mutation
                error => commit('createSubtaskFailure', { taskId, error }) // Pass taskId to mutation
            );
        },
        getAllSubtasks({ commit }, { projectId, taskId }) {
            commit('getAllSubtasksRequest');
            return projectService.getAllSubtasks(projectId, taskId)
              .then(
                subtasks => {
                  commit('getAllSubtasksSuccess', { taskId, subtasks });
                },
                error => {
                  commit('getAllSubtasksFailure', { taskId, error });
                  console.error('Error fetching subtasks:', error);
                }
              );
          },          
        updateSubtaskAction({commit}, { projectId, taskId, subtaskId, subtaskData }){
            commit('updateSubtaskRequest', { taskId, subtaskId });
            return projectService.updateSubtask(projectId, taskId, subtaskId, subtaskData)
                .then(
                    updatedSubtask => commit('updateSubtaskSuccess', { taskId, subtaskId, updatedSubtask}),
                    error => commit('updateSubtaskFailure', { taskId, subtaskId, error})
                );
        },         
        deleteSubtaskAction({ commit }, { projectId, taskId, subtaskId}) {
            commit('deleteSubtaskRequest', subtaskId);
        
            // Assuming projectService.deleteTask is your API call to delete a task
            return projectService.deleteSubtask(projectId, taskId, subtaskId)
            .then(
                () => commit('deleteSubtaskSuccess', {taskId, subtaskId}),
                error => commit('deleteSubtaskFailure', { taskId, subtaskId, error })
            );
        },
        inviteUserAction({ commit }, { projectId, invitedUserEmail }) { // Receive the payload object
            commit('inviteRequest');
        
            return projectService.inviteUser(projectId, invitedUserEmail) // Pass projectId and invitedUserEmail separately
                .then(
                    inviteEmail => commit('inviteSuccess', inviteEmail),
                    error => commit('inviteFailure', error)
                );
        },
        uploadFileAction({ commit }, { projectId, taskId, file }) {
            commit('uploadFileRequest');
    
            return projectService.uploadFile(projectId, taskId, file)
                .then(
                    response => commit('uploadFileSuccess', response),
                    error => commit('uploadFileFailure', error)
                );
        },
        getAllFile({ commit }, { projectId, taskId }) {
            commit('getAllFileRequest');
            return projectService.getAllFile(projectId, taskId)
              .then(
                files => {
                  commit('getAllFileSuccess', { taskId, files });
                },
                error => {
                  commit('getAllFileFailure', { taskId, error });
                  console.error('Error fetching subtasks:', error);
                }
            );
        }, 
        downloadFileAction({ commit }, { projectId, taskId, fileId }) {
            commit('downloadFileRequest');
    
            return projectService.downloadFile(projectId, taskId, fileId)
                .then(
                    () => commit('downloadFileSuccess'),
                    error => commit('downloadFileFailure', error)
                );
        }
    }

    const mutations = {

        TOGGLE_CREATE_PROJECT_MODAL(state, value) {
            state.showCreateProjectModal = value;
        },
        TOGGLE_CREATE_TASK_MODAL(state, value) {
            state.showCreateTaskModal = value;
        },
        TOGGLE_CREATE_SUBTASK_MODAL(state, value) {
            state.showCreateSubtaskModal = value;
        },
        getAllRequest(state) {
            state.projects = { loading: true };
        },
        getAllSuccess(state, projects) {
            state.projects = { items: projects };
        },
        getAllFailure(state, error) {
            state.projects = { error };
        },
        getProjectUserRequest(state) {
            state.projectUsers = { loading: true };
        },
        getProjectUserSuccess(state, projectUsers) {
            state.projectUsers = projectUsers;
        },
        getProjectUserFailure(state, error) {
            state.projectUser = { error };
        },
        deleteRequest(state, projectId) {
            // Add 'deleting:true' property to projects being deleted
            state.projects.items = state.projects.items.map(project =>
                project.projectId === projectId
                    ? { ...project, deleting: true }
                    : project
            );
        },
        deleteSuccess(state, projectId) {
            // Remove deleted project from state
            state.projects.items = state.projects.items.filter(project => project.projectId !== projectId);
        },
        deleteFailure(state, { projectId, error }) {
            // Remove 'deleting:true' property and add 'deleteError:[error]' property to project 
            state.projects.items = state.projects.items.map(project => {
                if (project.projectId === projectId) {
                    // Make copy of project without 'deleting:true' property
                    const { deleting, ...projectCopy } = project;
                    // Return copy of project with 'deleteError:[error]' property
                    return { ...projectCopy, deleteError: error };
                }
                return project;
            });
        },
        
        createRequest(state) {
            state.projects.creating = true;
        },
        createSuccess(state, newProject) {
            state.projects.creating = false;
            state.projects.items.push(newProject);
        },
        createFailure(state, error) {
            state.projects.creating = false;
            state.projects.createError = error;
        },
        updateRequest(state) {
            state.projects.updating = true;
        },
        updateSuccess(state, updatedProject) {
            state.projects.updating = false;
            const index = state.projects.items.findIndex(project => project.id === updatedProject.id);
            if (index !== -1) {
                state.projects.items.splice(index, 1, updatedProject);
            }
        },
        updateFailure(state, error) {
            state.projects.updating = false;
            state.projects.updateError = error;
        },
        getProjectRequest(state) {
            state.project = { loading: true };
        },
        getProjectSuccess(state, project) {
            state.project = project;
        },
        getProjectFailure(state, error) {
            state.project = { error };
        },
        createTaskRequest(state) {
            state.projects.creatingTask = true;
        },
        createTaskSuccess(state, newTask) {
            state.projects.creatingTask = false;
            if (!state.projects.tasks) {
                state.projects.tasks = []; // Initialize tasks array if not already initialized
            }
            state.projects.tasks.push(newTask); // Push the new task to the tasks array
        },
        createTaskFailure(state, error) {
            state.projects.creatingTask = false;
            state.projects.createTaskError = error;
        },
        getAllTasksRequest(state) {
            state.projects.loadingTasks = true;
        },
        getAllTasksSuccess(state, tasks) {
            state.tasks = tasks;
            state.projects.loadingTasks = false;
        },
        getAllTasksFailure(state, error) {
            state.projects.tasksError = error;
            state.projects.loadingTasks = false;
        },    
        updateTaskRequest(state, taskId) {
            state.projects.updatingTask = true;
            state.tasks = state.tasks.map (task =>
                task.id === taskId
                    ? { ...task, updating: true }
                    :task
            );
        },
        updateTaskSuccess(state, {taskId, updatedTask }){
            state.projects.updatingTask = false;
            state.tasks = state.tasks.map (task =>
                task.id === taskId
                    ? { ...task, ...updatedTask, updating: false }
                    :task
            );
        },
        updateTaskFailure(state, { taskId, error}){
            state.projects.updatingTask = false;
            state.tasks = state.tasks.map(task =>
                task.id === taskId
                    ? { ...task, updating: false, updateTaskError: error}
                    :task
            );
        },
        deleteTaskRequest(state, taskId) {
            // Initialize tasks array if not already initialized
            if (!state.projects.tasks) {
                state.projects.tasks = [];
            }
            state.projects.tasks = state.projects.tasks.map(task =>
                task.id === taskId
                    ? { ...task, deleting: true }
                    : task
            );
        },    
        deleteTaskSuccess(state, taskId) {
            // Remove the deleted task from the state
            state.tasks = state.tasks.filter(task => task.id !== taskId);
        },
        deleteTaskFailure(state, { taskId, error }) {
            // Handle failure, if needed
            console.error(`Failed to delete task with ID ${taskId}:`, error);
        },
        createSubtaskRequest(state) {
            state.creatingSubtask = true;
        },
        createSubtaskSuccess(state, { taskId, newSubtask }) {
            state.tasks = state.tasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks ? [...task.subtasks, newSubtask] : [newSubtask]
                    }
                    : task
            );
            state.showCreateSubtaskModal = false;
        },        
        createSubtaskFailure(state, { taskId, error }) {
            console.error(`Failed to create subtask for task ${taskId}:`, error);
            state.creatingSubtask = false;
        },
        getAllSubtasksRequest(state) {
            state.projects.loadingSubtasks = true;
        },
        getAllSubtasksSuccess(state, { taskId, subtasks }) {
            state.tasks = state.tasks.map(task => {
              if (task.id === taskId) {
                return { ...task, subtasks };
              }
              return task;
            });
            state.projects.loadingSubtasks = false;
          
            // Ensure the subtasks array is correctly updated
            state.subtasks = state.subtasks.concat(subtasks);
          },          
        getAllSubtasksFailure(state, { taskId, error }) {
            state.tasks = state.tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, subtasks: [], subtasksError: error };
                }
                return task;
            });
            state.projects.loadingSubtasks = false;
        },
        updateSubtaskRequest(state, { taskId, subtaskId}) {
            state.projects.updatingSubtask = true;
            state.tasks = state.tasks.map (task =>
                task.id === taskId
                    ? { 
                        ...task, 
                        subtasks: (task.subtasks || []).map(subtask =>
                        subtask.id === subtaskId
                            ? { ...subtask, updating: true }
                            :subtask
                        )
                    }
                    :task
            );
        },
        updateSubtaskSuccess(state, {taskId, subtaskId, updatedSubtask }){
            state.projects.updatingSubtask = false;
            state.tasks = state.tasks.map (task =>
                task.id === taskId
                    ? { ...task,
                        subtasks: (task.subtasks || []).map(subtask =>
                            subtask.id === subtaskId
                                ? { ...subtask, ...updatedSubtask, updating: false }
                                :subtask
                        )
                    }
                    :task
            );
        },
        updateSubtaskFailure(state, { taskId, subtaskId, error}){
            state.projects.updatingSubtask = false;
            state.tasks = state.tasks.map(task =>
                task.id === taskId
                    ? { ...task, 
                        subtasks: (task.subtasks || []).map(subtask =>
                            subtask.id === subtaskId
                                ? {...subtask, updating: false, updateSubtaskError: error }
                                :subtask
                        )
                    }
                    :task
            );
        },
        deleteSubtaskRequest(state, { taskId, subtaskId }) {
            if (!state.projects.tasks) {
                state.projects.tasks = [];
            }
            state.projects.tasks = state.projects.tasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        subtasks: (task.subtasks || []).map(subtask => // Check if task.subtasks is defined
                            subtask.id === subtaskId
                                ? { ...subtask, deleting: true }
                                : subtask
                        )
                    }
                    : task
            );
        },                
        deleteSubtaskSuccess(state, { taskId, subtaskId }) {
            state.tasks = state.tasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId) // Remove the deleted subtask
                    }
                    : task
            );
        },
        deleteSubtaskFailure(state, { taskId, subtaskId, error }) {
            // Handle failure, if needed
            console.error(`Failed to delete subtask ${subtaskId} of task ${taskId}:`, error);
        },
        inviteRequest(state) {
            state.userProject = null;
            state.error = null;
        },
        inviteSuccess(state, userProject) {
            state.userProject = userProject;
            state.error = null;
        },
        inviteFailure(state, error) {
            state.userProject = null;
            state.error = error;
        },
        uploadFileRequest(state) {
            state.uploadingFile = true;
        },
        uploadFileSuccess(state, response) {
            state.uploadingFile = false;
            state.uploadedFile = response;
        },
        uploadFileFailure(state, error) {
            state.uploadingFile = false;
            state.uploadFileError = error;
        },
        getAllFileRequest(state) {
            state.projects.loadingFiles = true;
        },
        getAllFileSuccess(state, { taskId, files }) {
            state.tasks = state.tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, files };
                }
                return task;
            });
            state.projects.loadingFiles = false;
        },          
        getAllFileFailure(state, { taskId, error }) {
            state.tasks = state.tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, files: [], filesError: error };
                }
                return task;
            });
            state.projects.loadingFiles = false;
        },
        downloadFileRequest(state) {
            state.downloadingFile = true;
            state.downloadFileError = null;
        },
        downloadFileSuccess(state) {
            state.downloadingFile = false;
        },
        downloadFileFailure(state, error) {
            state.downloadingFile = false;
            state.downloadFileError = error;
        },
    };  

    export const projects = {
        namespaced: true,
        state,
        actions,
        mutations
    };