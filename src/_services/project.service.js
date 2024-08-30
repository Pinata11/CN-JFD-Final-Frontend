import config from 'config';
import { authHeader } from '../_helpers';

export const projectService = {
    create,
    getAll,
    getProjectUsers,
    getById,
    update,
    delete: _delete,
    createTask,
    getAllTasks,
    updateTask,
    deleteTask: _deleteTask,
    createSubtask,
    getAllSubtasks,
    updateSubtask,
    deleteSubtask: _deleteSubtask,
    inviteUser,
    uploadFile,
    getAllFile,
    downloadFile
};

function create(project) {
    const requestOptions = {
        method: 'POST',
        headers: {...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
    };

    return fetch(`${config.apiUrl}/projects/create`, requestOptions).then(handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects`, requestOptions).then(handleResponse);
}

function getProjectUsers(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${id}/getUser`, requestOptions).then(handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${id}`, requestOptions).then(handleResponse);
}

function update(project, id) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
    };

    return fetch(`${config.apiUrl}/projects/${id}`, requestOptions).then(handleResponse);
}

function _delete(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${id}`, requestOptions).then(handleResponse);
}

function createTask(projectId, taskData) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/create`, requestOptions).then(handleResponse);
}

function getAllTasks(projectId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks`, requestOptions).then(handleResponse);
}

function updateTask(projectId,taskId,taskData){
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-type': 'application/json' },
        body: JSON.stringify(taskData)
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}`, requestOptions).then(handleResponse)
}

function _deleteTask(projectId, taskId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}`, requestOptions).then(handleResponse);
}

function createSubtask(projectId, taskId, subtaskData) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(subtaskData)
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/subtasks/create`, requestOptions).then(handleResponse);
}

function getAllSubtasks(projectId, taskId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/subtasks`, requestOptions).then(handleResponse);
}

function updateSubtask(projectId, taskId, subtaskId, subtaskData){
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(subtaskData)
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`, requestOptions).then(handleResponse);
}

function _deleteSubtask(projectId, taskId, subtaskId) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };
    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`, requestOptions).then(handleResponse);
}

function inviteUser(projectId, invitedUserEmail){
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ "email": invitedUserEmail })
    };
    return fetch(`${config.apiUrl}/projects/${projectId}/invite`, requestOptions).then(handleResponse);
}

function uploadFile(projectId, taskId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/upload`, requestOptions).then(handleResponse);
}

function getAllFile(projectId, taskId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/files`, requestOptions).then(handleResponse);
}

function downloadFile(projectId, taskId, fileId) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/projects/${projectId}/tasks/${taskId}/files/${fileId}/download`, requestOptions)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'file';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        });
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}