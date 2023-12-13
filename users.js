let users = []; 

module.exports = {
    getUsers: () => users, 
    setUsers: (newUsers) => users = newUsers, 
    addUser: (newUser) => users.push(newUser)
}; 