export default function actionLoadUsers(name) {
    return {
        type: "LOAD_USERS",
        payload: name
    }
}