let axios = window.axios;
export default {
  login(username, password) {
    return axios.post("/api/login", {
      email: username,
      password: password
    });
  },
  getHmacKey(id) {
    return axios({
      method: "post",
      url: "/api/getHmacKey",
      params: {
        to_user_id: id
      }
    });
  },
  getEncryptKey(id) {
    return axios({
      method: "post",
      url: "/api/getkey",
      params: {
        to_user_id: id
      }
    });
  },
  getMessage(id) {
    return axios.get(`/api/message/${id}`).then(data => {
      if (data.data.messages.length > 0) {
        axios.put("/api/readMessage", {
          read_messages_id: data.data.messages.map(msg => +msg.id)
        });
      }
      return data;
    });
  },
  getEmail(id) {
    return axios({
      method: "get",
      url: "/api/getEmail",
      params: {
        to_user_id: id
      }
    });
  },
  getUserId(email) {
    return axios({
      method: "get",
      url: "/api/getUserId",
      params: {
        email
      }
    });
  },
  sendMessage(data) {
    return axios.post("/api/message", data);
  }
};
