export default function users(state = {}, action) {
    switch (action.type) {
        case "LOAD_USERS":
            return action.payload;
        case "USERS_UPDATE":
            return state;
        default:
            return state;
    }
}