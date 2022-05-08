function getDirectoryProject(directory, jumps = 2) {
    directory = directory.split('/');
    let dirProject = '/';
    for (let i = 1; i < directory.length - jumps; i++) {
        dirProject = dirProject.concat(directory[i] + '/');
    }
    return dirProject;
}

module.exports = {
    getDirectoryProject
};